import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Creates a Stripe Checkout Session for a single program purchase in GBP.
 * The price is read from the database, never from the request body.
 *
 * For the wholesale cart (multiple line items + shipping) this handler is
 * extended in Release 2 — see supabase/functions/create-checkout-session for
 * the edge-function equivalent used from other clients.
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

  let body: { type?: string; programId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.type !== "program" || !body.programId) {
    return NextResponse.json({ error: "Unknown item." }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
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

    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
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
  } catch (e) {
    console.error("checkout failed", e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again or use WhatsApp." },
      { status: 500 }
    );
  }
}
