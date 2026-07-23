// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session in GBP for a program (or, later, a
// wholesale cart). Price is looked up from the DB — never trusted from the
// client. The Next.js /api/checkout route does the same thing for the web
// app; this function exists for any non-web client and parity.
//
// deno-lint-ignore-file no-explicit-any
declare const Deno: { env: { get(k: string): string | undefined } };

import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://lamithemigrantceo.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { programId } = await req.json();
    if (!programId) {
      return new Response(JSON.stringify({ error: "Missing programId" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { data: program, error } = await supabase
      .from("programs")
      .select("id, name, price_gbp, slug, status")
      .eq("id", programId)
      .single();

    if (error || !program) {
      return new Response(JSON.stringify({ error: "Program not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "gbp",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(Number(program.price_gbp) * 100),
            product_data: { name: program.name },
          },
        },
      ],
      metadata: { item_type: "program", item_id: program.id },
      success_url: `${SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout-cancelled?program=${program.slug}`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Checkout failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
