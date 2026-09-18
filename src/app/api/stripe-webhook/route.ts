import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";

/**
 * Stripe calls this directly (no Supabase Edge Function / Database Webhook
 * involved) on checkout.session.completed. Verifies the signature, then:
 *   - inserts an order (idempotent on stripe_session_id)
 *   - increments ticket/decrements stock counts
 *   - emails a payment confirmation
 *
 * Configure in the Stripe dashboard: Developers → Webhooks → Add endpoint,
 * URL <your-domain>/api/stripe-webhook, event checkout.session.completed.
 * Copy the signing secret into STRIPE_WEBHOOK_SECRET (Vercel env vars).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    console.error("Stripe webhook hit but STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
  } catch (err) {
    console.error("Stripe signature verification failed", err);
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email || "";
    const name = session.customer_details?.name || "";
    const amount = (session.amount_total ?? 0) / 100;

    const supabase = createServiceClient();

    // Idempotency: skip if we already recorded this session.
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!existing) {
      // Wholesale orders carry a compact {i: product_id, q: quantity}[] list
      // in metadata (set at checkout creation) instead of a single item_id,
      // since a cart can hold several different bundles.
      let wholesaleItems: { i: string; q: number }[] = [];
      if (session.metadata?.item_type === "wholesale" && session.metadata?.items) {
        try {
          wholesaleItems = JSON.parse(session.metadata.items);
        } catch {
          wholesaleItems = [];
        }
      }

      let orderItemsForRecord: { id: string; name: string; quantity: number }[] | null = null;
      if (wholesaleItems.length > 0) {
        const { data: bundles } = await supabase
          .from("wholesale_products")
          .select("id, name")
          .in("id", wholesaleItems.map((it) => it.i));
        orderItemsForRecord = wholesaleItems.map((it) => ({
          id: it.i,
          name: bundles?.find((b: { id: string }) => b.id === it.i)?.name ?? "Unknown bundle",
          quantity: it.q,
        }));
      }

      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        email,
        name,
        item_type: session.metadata?.item_type ?? "product",
        item_id: session.metadata?.item_id ?? null,
        amount_gbp: amount,
        status: "paid",
        shipping_address:
          (session as unknown as { shipping_details?: { address?: unknown } })
            .shipping_details?.address ?? null,
        items: orderItemsForRecord,
      });

      // For event tickets, increment the sold count so capacity stays live.
      if (session.metadata?.item_type === "event" && session.metadata?.item_id) {
        await supabase.rpc("increment_tickets_sold", {
          event_id: session.metadata.item_id,
        });
      }

      // For wholesale orders, decrement each bundle's stock so it reflects
      // real sales (checkout-time checks alone don't do this).
      for (const it of wholesaleItems) {
        await supabase.rpc("decrement_wholesale_stock", {
          product_id: it.i,
          qty: it.q,
        });
      }

      // Access to /my is matched by the buyer's email. Their profile row is
      // created automatically on first magic-link sign-in (see the
      // on_auth_user_created trigger), so nothing to insert here.

      if (email) {
        await sendEmail(
          email,
          "You are in — payment confirmed",
          [
            `Hi ${name.split(" ")[0] || "there"},`,
            ``,
            `Your payment of £${amount.toFixed(2)} is confirmed and your place is booked.`,
            `I will email your joining details shortly. Sign in any time to see your products.`,
            ``,
            `Lami`,
          ].join("\n")
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
