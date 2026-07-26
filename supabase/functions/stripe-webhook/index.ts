// Supabase Edge Function: stripe-webhook
// Listens for checkout.session.completed, verifies the signature, and:
//   - inserts an order (idempotent on stripe_session_id)
//   - ensures a user record exists for the buyer's email
//   - sends a confirmation email via Resend
//
// Configure the endpoint in the Stripe dashboard to point at this function's
// URL, and store the signing secret:
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// deno-lint-ignore-file no-explicit-any
declare const Deno: { env: { get(k: string): string | undefined } };

import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Lami <onboarding@resend.dev>";

async function sendConfirmation(email: string, name: string, amount: number) {
  if (!RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: "You are in — payment confirmed",
      text: [
        `Hi ${name.split(" ")[0] || "there"},`,
        ``,
        `Your payment of £${amount.toFixed(2)} is confirmed and your place is booked.`,
        `I will email your joining details shortly. Sign in any time to see your programs.`,
        ``,
        `Lami`,
      ].join("\n"),
    }),
  });
}

Deno.serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Signature verification failed", err);
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email =
      session.customer_details?.email || session.customer_email || "";
    const name = session.customer_details?.name || "";
    const amount = (session.amount_total ?? 0) / 100;

    // Idempotency: skip if we already recorded this session.
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        email,
        name,
        item_type: session.metadata?.item_type ?? "program",
        item_id: session.metadata?.item_id ?? null,
        amount_gbp: amount,
        status: "paid",
        shipping_address: (session as any).shipping_details?.address ?? null,
      });

      // For event tickets, increment the sold count so capacity stays live.
      if (session.metadata?.item_type === "event" && session.metadata?.item_id) {
        await supabase.rpc("increment_tickets_sold", {
          event_id: session.metadata.item_id,
        });
      }

      // Access to /my is matched by the buyer's email. Their profile row is
      // created automatically on first magic-link sign-in (see the
      // on_auth_user_created trigger), so nothing to insert here.

      await sendConfirmation(email, name, amount);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
