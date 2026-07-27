import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Stores a contact-form submission. Runs with the service role so anonymous
 * visitors can write without an open RLS insert policy on `enquiries`. The
 * Supabase `notify-enquiry` edge function emails Lami on insert.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const topic = String(body.topic || "General").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email does not look right." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("enquiries").insert({
      name,
      email,
      whatsapp: body.whatsapp ? String(body.whatsapp).trim() : null,
      organisation: body.organisation ? String(body.organisation).trim() : null,
      topic,
      event_date: body.event_date ? String(body.event_date) : null,
      budget_range: body.budget_range ? String(body.budget_range) : null,
      message: message.slice(0, 1000),
      marketing_opt_in: Boolean(body.marketing_opt_in),
      status: "new",
      source_page: body.source_page ? String(body.source_page) : null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("enquiry insert failed", e);
    return NextResponse.json(
      { error: "Could not save your message. Please try WhatsApp instead." },
      { status: 500 }
    );
  }
}
