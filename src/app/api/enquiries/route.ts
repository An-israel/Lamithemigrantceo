import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/resend";
import { freeResourceEmail } from "@/lib/emailTemplates";
import { logEvent, errorText } from "@/lib/serviceLog";

const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_EMAIL || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lamithemigrantceo.uk";

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
  const isResource = topic === "Resource";
  const resourceId =
    typeof body.resource_id === "string" && /^[0-9a-f-]{36}$/i.test(body.resource_id)
      ? body.resource_id
      : null;

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
    await logEvent({
      category: "form",
      event: "enquiry.save_failed",
      status: "failed",
      summary: `Enquiry from ${name} (${email}) could NOT be saved — they were told to use WhatsApp`,
      ref: email,
      detail: { topic, error: errorText(e) },
    });
    return NextResponse.json(
      { error: "Could not save your message. Please try WhatsApp instead." },
      { status: 500 }
    );
  }

  // Free-resource downloads come through this route too; look the resource
  // up so the requester is emailed the actual file/video, not a generic reply.
  let resource: { title: string; file_url: string | null; video_url: string | null } | null = null;
  if (isResource && resourceId) {
    try {
      const { data } = await createServiceClient()
        .from("resources")
        .select("title, file_url, video_url")
        .eq("id", resourceId)
        .maybeSingle();
      resource = data;
    } catch {
      resource = null;
    }
  }
  const resourceTitle = resource?.title || trimmedMessage.replace(/^Requested:\s*/, "");

  await logEvent({
    category: "form",
    event: isResource ? "resource.requested" : "enquiry.received",
    status: "success",
    summary: isResource
      ? `Free resource requested: ${resourceTitle} by ${email}`
      : `New ${topic} enquiry from ${name}`,
    ref: email,
    detail: { topic, organisation, event_date: eventDate, budget_range: budgetRange, source_page: sourcePage },
  });

  // Email both sides. Best-effort — the enquiry is already saved, so a
  // failed send here never loses the message, it just delays the reply.
  if (NOTIFY_TO) {
    const adminBody = [
      isResource ? `Free resource downloaded: ${resourceTitle}` : `New enquiry from ${name}`,
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
    await sendEmail({
      to: NOTIFY_TO,
      subject: isResource
        ? `Free resource downloaded: ${resourceTitle} (${email})`
        : `New enquiry: ${topic} from ${name}`,
      text: adminBody,
      replyTo: email,
      kind: "enquiry_notification",
      label: "New-enquiry alert to Lami",
      ref: email,
    });
  } else {
    await logEvent({
      category: "email",
      event: "email.enquiry_notification",
      status: "skipped",
      summary: `New-enquiry alert not sent: ENQUIRY_NOTIFY_EMAIL is not set`,
      ref: email,
    });
  }

  if (isResource) {
    const kind = resource?.file_url ? "file" : resource?.video_url ? "video" : "none";
    const { subject, text, html } = freeResourceEmail({
      title: resourceTitle,
      accessUrl: resource?.file_url || resource?.video_url || null,
      kind,
      resourcesUrl: `${SITE_URL}/resources${resourceId ? `#${resourceId}` : ""}`,
    });
    await sendEmail({
      to: email,
      subject,
      text,
      html,
      kind: "free_resource",
      label: "Free resource email",
      ref: resourceId ?? undefined,
    });
    return NextResponse.json({ ok: true });
  }

  await sendEmail({
    to: email,
    subject: "I got your message",
    text: [
      `Hi ${name.split(" ")[0]},`,
      ``,
      `Thank you for reaching out — I have your message and I reply within one working day.`,
      `If it is urgent you can message me on WhatsApp.`,
      ``,
      `Lami`,
      SITE_URL,
    ].join("\n"),
    kind: "enquiry_acknowledgement",
    label: "Enquiry acknowledgement",
  });

  return NextResponse.json({ ok: true });
}
