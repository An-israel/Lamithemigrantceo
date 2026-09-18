import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/resend";

const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_EMAIL || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lamithemigrantceo.com";

/**
 * Stores a contact-form submission and emails both Lami and the enquirer
 * directly (no Supabase Database Webhook or Edge Function needed — this
 * route already runs on every request, so it just sends the emails itself
 * after a successful insert).
 */
export async function POST(request: Request) {
  if (!rateLimit(`enquiries:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — a real visitor never fills this in. Report success without
  // writing anything, so scripted submissions get no useful signal back.
  if (String(body.company || "").trim()) {
    return NextResponse.json({ ok: true });
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

  const whatsapp = body.whatsapp ? String(body.whatsapp).trim() : null;
  const organisation = body.organisation ? String(body.organisation).trim() : null;
  const eventDate = body.event_date ? String(body.event_date) : null;
  const budgetRange = body.budget_range ? String(body.budget_range) : null;
  const marketingOptIn = Boolean(body.marketing_opt_in);
  const sourcePage = body.source_page ? String(body.source_page) : null;
  const trimmedMessage = message.slice(0, 1000);

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("enquiries").insert({
      name,
      email,
      whatsapp,
      organisation,
      topic,
      event_date: eventDate,
      budget_range: budgetRange,
      message: trimmedMessage,
      marketing_opt_in: marketingOptIn,
      status: "new",
      source_page: sourcePage,
    });
    if (error) throw error;
  } catch (e) {
    console.error("enquiry insert failed", e);
    return NextResponse.json(
      { error: "Could not save your message. Please try WhatsApp instead." },
      { status: 500 }
    );
  }

  // Email both sides. Best-effort — the enquiry is already saved, so a
  // failed send here never loses the message, it just delays the reply.
  if (NOTIFY_TO) {
    const adminBody = [
      `New enquiry from ${name}`,
      ``,
      `Type:     ${topic}`,
      `Email:    ${email}`,
      `Org:      ${organisation ?? "—"}`,
      `Event:    ${eventDate ?? "—"}`,
      `Budget:   ${budgetRange ?? "—"}`,
      `WhatsApp: ${whatsapp ?? "—"}`,
      `Opt-in:   ${marketingOptIn ? "yes" : "no"}`,
      `Page:     ${sourcePage ?? "—"}`,
      ``,
      `Message:`,
      trimmedMessage,
      ``,
      `Open in admin: ${SITE_URL}/admin/enquiries`,
      `Reply: mailto:${email}`,
    ].join("\n");
    await sendEmail(NOTIFY_TO, `New enquiry: ${topic} from ${name}`, adminBody);
  }

  await sendEmail(
    email,
    "I got your message",
    [
      `Hi ${name.split(" ")[0]},`,
      ``,
      `Thank you for reaching out — I have your message and I reply within one working day.`,
      `If it is urgent you can message me on WhatsApp.`,
      ``,
      `Lami`,
      SITE_URL,
    ].join("\n")
  );

  return NextResponse.json({ ok: true });
}
