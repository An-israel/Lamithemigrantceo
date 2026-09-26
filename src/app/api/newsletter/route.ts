import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logEvent, errorText } from "@/lib/serviceLog";

/**
 * Footer "free starter list" capture. Adds the subscriber to a real Resend
 * Audience (create one at resend.com/audiences and set RESEND_AUDIENCE_ID)
 * so she can actually send to a list later, not just see rows in an inbox.
 * Also stored as an enquiry so it still shows up where Lami already looks,
 * even before RESEND_AUDIENCE_ID is configured.
 */
async function addToResendAudience(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    await logEvent({
      category: "form",
      event: "newsletter.audience_skipped",
      status: "skipped",
      summary: `${email} not added to the Resend mailing list: RESEND_AUDIENCE_ID is not set (saved in Enquiries instead)`,
      ref: email,
    });
    return;
  }

  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }
    );
    if (!res.ok) {
      const error = (await res.text()).slice(0, 500);
      console.error("Resend audience add failed", error);
      await logEvent({
        category: "form",
        event: "newsletter.audience_failed",
        status: "failed",
        summary: `${email} could not be added to the Resend mailing list (Resend ${res.status})`,
        ref: email,
        detail: { error },
      });
    }
  } catch (e) {
    await logEvent({
      category: "form",
      event: "newsletter.audience_failed",
      status: "failed",
      summary: `${email} could not be added to the Resend mailing list (could not reach Resend)`,
      ref: email,
      detail: { error: errorText(e) },
    });
    // Never fail the signup over the ESP call — the enquiries row is the
    // fallback record of who asked to be added.
    console.error("Resend audience add errored", e);
  }
}

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute and try again." }, { status: 429 });
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

  const email = String(body.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("enquiries").insert({
      name: "Newsletter signup",
      email,
      topic: "Newsletter",
      message: "Requested the free starter list from the footer.",
      marketing_opt_in: true,
      status: "new",
      source_page: "footer",
    });
    if (error) throw error;

    await logEvent({
      category: "form",
      event: "newsletter.signup",
      status: "success",
      summary: `Build Letter signup: ${email}`,
      ref: email,
    });

    await addToResendAudience(email);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("newsletter insert failed", e);
    await logEvent({
      category: "form",
      event: "newsletter.save_failed",
      status: "failed",
      summary: `Build Letter signup for ${email} could NOT be saved`,
      ref: email,
      detail: { error: errorText(e) },
    });
    return NextResponse.json({ error: "Could not sign you up." }, { status: 500 });
  }
}
