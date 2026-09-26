import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { orderConfirmationEmail, abandonedCheckoutEmail } from "@/lib/emailTemplates";
import { logEvent, errorText } from "@/lib/serviceLog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lamithemigrantceo.uk";

/**
 * Stripe calls this directly (no Supabase Edge Function / Database Webhook
 * involved). Verifies the signature, then handles two events:
 *
 *   checkout.session.completed — inserts an order (idempotent on
 *   stripe_session_id), increments ticket/decrements stock counts, and
 *   emails a payment confirmation.
 *
 *   checkout.session.expired — checkout sessions expire 1 hour after
 *   creation (set in /api/checkout) instead of Stripe's 24h default, so
 *   this fires promptly for anyone who starts paying and doesn't finish.
 *   Emails a "did you mean to finish?" nudge with a link back to the item,
 *   only if Stripe captured an email before they left.
 *
 * Configure in the Stripe dashboard: Developers → Webhooks → Add endpoint,
 * URL <your-domain>/api/stripe-webhook, events checkout.session.completed
 * AND checkout.session.expired. Copy the signing secret into
 * STRIPE_WEBHOOK_SECRET (Vercel env vars).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    console.error("Stripe webhook hit but STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET not set");
    await logEvent({
      category: "system",
      event: "webhook.not_configured",
      status: "failed",
      summary: "Stripe webhook received but STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET is not set",
    });
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
    await logEvent({
      category: "system",
      event: "webhook.bad_signature",
      status: "failed",
      summary:
        "Stripe webhook rejected: signature check failed (STRIPE_WEBHOOK_SECRET may not match this endpoint)",
      detail: { error: errorText(err) },
    });
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

      const itemType = session.metadata?.item_type ?? "product";
      const itemName = session.metadata?.item_name || "Your order";
      const { error: insertError } = await supabase.from("orders").insert({
        stripe_session_id: session.id,
        email,
        name,
        item_type: itemType,
        item_id: session.metadata?.item_id ?? null,
        amount_gbp: amount,
        status: "paid",
        shipping_address:
          (session as unknown as { shipping_details?: { address?: unknown } })
            .shipping_details?.address ?? null,
        items: orderItemsForRecord,
      });

      if (insertError) {
        // Stripe retries non-2xx responses, so fail loudly and let it retry
        // rather than silently losing a paid order.
        console.error("order insert failed", insertError);
        await logEvent({
          category: "payment",
          event: "order.save_failed",
          status: "failed",
          summary: `Payment of £${amount.toFixed(2)} from ${email || "unknown buyer"} for ${itemName} could NOT be saved as an order — Stripe will retry`,
          ref: session.id,
          detail: { email, item_type: itemType, item_name: itemName, error: insertError.message },
        });
        return NextResponse.json({ error: "Could not save order." }, { status: 500 });
      }

      await logEvent({
        category: "payment",
        event: "payment.received",
        status: "success",
        summary: `Payment received: £${amount.toFixed(2)} for ${itemName} from ${email || "unknown buyer"}`,
        ref: session.id,
        detail: {
          email,
          name,
          amount_gbp: amount,
          item_type: itemType,
          item_id: session.metadata?.item_id ?? null,
          item_name: itemName,
          items: orderItemsForRecord,
          livemode: event.livemode,
        },
      });

      // For event tickets, increment the sold count so capacity stays live.
      if (session.metadata?.item_type === "event" && session.metadata?.item_id) {
        const { error: rpcError } = await supabase.rpc("increment_tickets_sold", {
          event_id: session.metadata.item_id,
        });
        if (rpcError) {
          await logEvent({
            category: "order",
            event: "event.tickets_count_failed",
            status: "failed",
            summary: `Ticket sold for ${itemName} but the sold-count could not be updated — check capacity manually`,
            ref: session.id,
            detail: { event_id: session.metadata.item_id, error: rpcError.message },
          });
        }
      }

      // For wholesale orders, decrement each bundle's stock so it reflects
      // real sales (checkout-time checks alone don't do this).
      for (const it of wholesaleItems) {
        const { error: rpcError } = await supabase.rpc("decrement_wholesale_stock", {
          product_id: it.i,
          qty: it.q,
        });
        if (rpcError) {
          await logEvent({
            category: "order",
            event: "wholesale.stock_update_failed",
            status: "failed",
            summary: `Wholesale stock could not be reduced by ${it.q} for bundle ${it.i} — update stock manually`,
            ref: session.id,
            detail: { product_id: it.i, qty: it.q, error: rpcError.message },
          });
        }
      }

      // Access to /my is matched by the buyer's email. Their profile row is
      // created automatically on first magic-link sign-in (see the
      // on_auth_user_created trigger), so nothing to insert here.

      if (email) {
        const { subject, text, html } = orderConfirmationEmail({
          name,
          itemName,
          amountGbp: amount,
          siteUrl: SITE_URL,
        });
        await sendEmail({
          to: email,
          subject,
          text,
          html,
          kind: "order_confirmation",
          label: "Order confirmation",
          ref: session.id,
        });
      } else {
        await logEvent({
          category: "email",
          event: "email.order_confirmation",
          status: "skipped",
          summary: `Order confirmation not sent: Stripe gave no buyer email for ${itemName}`,
          ref: session.id,
        });
      }
    } else {
      await logEvent({
        category: "payment",
        event: "payment.duplicate_ignored",
        status: "info",
        summary: "Stripe re-sent a payment that was already recorded — ignored (no double order)",
        ref: session.id,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email || "";
    const name = session.customer_details?.name || "";
    const amount = (session.amount_total ?? 0) / 100;

    const itemName = session.metadata?.item_name || "Your order";

    await logEvent({
      category: "checkout",
      event: "checkout.abandoned",
      status: "info",
      summary: `Checkout abandoned: ${itemName} (£${amount.toFixed(2)})${email ? ` by ${email}` : " — no email captured"}`,
      ref: session.id,
      detail: { email: email || null, name, amount_gbp: amount, item_name: itemName, item_type: session.metadata?.item_type ?? null },
    });

    // Nothing to email if they left before Stripe ever captured an address.
    if (email) {
      const resumePath = session.metadata?.resume_path || "/";
      const { subject, text, html } = abandonedCheckoutEmail({
        name,
        itemName,
        amountGbp: amount,
        resumeUrl: `${SITE_URL}${resumePath}`,
      });
      await sendEmail({
        to: email,
        subject,
        text,
        html,
        kind: "abandoned_checkout",
        label: "Abandoned-checkout reminder",
        ref: session.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}
