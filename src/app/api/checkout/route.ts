import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Creates a Stripe Checkout Session in GBP for either:
 *   - a single program purchase  { type: "program", programId }
 *   - a wholesale cart           { type: "wholesale", items: [{id, quantity}] }
 *
 * Prices are always read from the database, never trusted from the request.
 */
export async function POST(request: Request) {
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
    programId?: string;
    items?: { id: string; quantity: number }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  const supabase = createServiceClient();

  try {
    // --- Program checkout -------------------------------------------------
    if (body.type === "program" && body.programId) {
      const { data: program, error } = await supabase
        .from("programs")
        .select("id, name, price_gbp, slug, status")
        .eq("id", body.programId)
        .single();

      if (error || !program) {
        return NextResponse.json({ error: "Program not found." }, { status: 404 });
      }
      if (program.status === "sold_out") {
        return NextResponse.json({ error: "This program is sold out." }, { status: 409 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "gbp",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: Math.round(program.price_gbp * 100),
              product_data: { name: program.name },
            },
          },
        ],
        metadata: { item_type: "program", item_id: program.id },
        success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout-cancelled?program=${program.slug}`,
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
        metadata: { item_type: "wholesale" },
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
