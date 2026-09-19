import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { isEventOver } from "@/lib/events";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * Creates a Stripe Checkout Session in GBP for either:
 *   - a single product purchase  { type: "product", productId }
 *   - a wholesale cart           { type: "wholesale", items: [{id, quantity}] }
 *
 * Prices are always read from the database, never trusted from the request.
 */
export async function POST(request: Request) {
  if (!rateLimit(`checkout:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429 }
    );
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!secret || secret.includes("your_key")) {
    return NextResponse.json(
      { error: "Payments are not switched on yet. Please use WhatsApp to enrol." },
      { status: 503 }
    );
  }

  let body: {
    type?: string;
    productId?: string;
    eventId?: string;
    items?: { id: string; quantity: number }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  const supabase = createServiceClient();
  // Sessions expire in an hour instead of Stripe's 24h default, so an
  // abandoned checkout email can go out promptly (see /api/stripe-webhook).
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

  try {
    // --- Event ticket checkout -------------------------------------------
    if (body.type === "event" && body.eventId) {
      const { data: event, error } = await supabase
        .from("events")
        .select("id, name, price_gbp, slug, status, capacity, tickets_sold, starts_at, ends_at")
        .eq("id", body.eventId)
        .single();

      if (error || !event) {
        return NextResponse.json({ error: "Event not found." }, { status: 404 });
      }
      const isPast = event.status === "past" || isEventOver(event);
      const soldOut =
        event.status === "sold_out" ||
        (event.capacity != null && event.tickets_sold >= event.capacity);
      if (isPast || soldOut) {
        return NextResponse.json({ error: "Tickets are not available." }, { status: 409 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "gbp",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(event.price_gbp * 100),
              product_data: { name: `${event.name} ticket` },
            },
          },
        ],
        metadata: {
          item_type: "event",
          item_id: event.id,
          item_name: `${event.name} ticket`,
          resume_path: `/events/${event.slug}`,
        },
        expires_at: expiresAt,
        success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/events/${event.slug}`,
      });

      return NextResponse.json({ url: session.url });
    }

    // --- Product checkout ---------------------------------------------------
    if (body.type === "product" && body.productId) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, price_gbp, slug, status")
        .eq("id", body.productId)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
      if (product.status === "sold_out") {
        return NextResponse.json({ error: "This product is sold out." }, { status: 409 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "gbp",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(product.price_gbp * 100),
              product_data: { name: product.name },
            },
          },
        ],
        metadata: {
          item_type: "product",
          item_id: product.id,
          item_name: product.name,
          resume_path: `/products/${product.slug}`,
        },
        expires_at: expiresAt,
        success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout-cancelled?product=${product.slug}`,
      });

      return NextResponse.json({ url: session.url });
    }

    // --- Wholesale cart checkout -----------------------------------------
    if (body.type === "wholesale" && Array.isArray(body.items) && body.items.length > 0) {
      const ids = body.items
        .map((i) => i.id)
        .filter((id) => typeof id === "string" && !id.startsWith("w-seed-"));

      if (ids.length === 0) {
        return NextResponse.json(
          { error: "These sample bundles are not purchasable yet. Contact Lami to order." },
          { status: 409 }
        );
      }

      const { data: products, error } = await supabase
        .from("wholesale_products")
        .select("id, name, price_gbp, stock, images")
        .in("id", ids);

      if (error || !products || products.length === 0) {
        return NextResponse.json({ error: "Bundles not found." }, { status: 404 });
      }

      const line_items = [];
      const orderedItems: { i: string; q: number }[] = [];
      for (const item of body.items) {
        const product = products.find((p: { id: string }) => p.id === item.id);
        if (!product) continue;
        const qty = Math.max(1, Math.min(99, Math.floor(item.quantity || 1)));
        if (product.stock <= 0) {
          return NextResponse.json(
            { error: `${product.name} is sold out.` },
            { status: 409 }
          );
        }
        if (qty > product.stock) {
          return NextResponse.json(
            {
              error: `Only ${product.stock} of ${product.name} left. Lower the quantity to continue.`,
            },
            { status: 409 }
          );
        }
        line_items.push({
          quantity: qty,
          price_data: {
            currency: "gbp" as const,
            unit_amount: Math.round(product.price_gbp * 100),
            product_data: {
              name: product.name,
              images: product.images?.length ? [product.images[0]] : undefined,
            },
          },
        });
        orderedItems.push({ i: product.id, q: qty });
      }

      if (line_items.length === 0) {
        return NextResponse.json({ error: "Nothing to check out." }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "gbp",
        line_items,
        shipping_address_collection: { allowed_countries: ["GB"] },
        phone_number_collection: { enabled: true },
        // Compact {id, quantity} pairs so the webhook can decrement stock
        // and record what was bought, without hitting Stripe's 500-char
        // per-value metadata limit.
        metadata: {
          item_type: "wholesale",
          items: JSON.stringify(orderedItems),
          item_name:
            orderedItems.length === 1
              ? products.find((p) => p.id === orderedItems[0].i)?.name || "Wholesale order"
              : `Wholesale order (${orderedItems.length} bundles)`,
          resume_path: "/wholesale",
        },
        expires_at: expiresAt,
        success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/wholesale`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Unknown item." }, { status: 400 });
  } catch (e) {
    console.error("checkout failed", e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again or use WhatsApp." },
      { status: 500 }
    );
  }
}
