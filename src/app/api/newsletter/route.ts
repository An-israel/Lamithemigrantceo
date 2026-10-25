import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logEvent, errorText } from "@/lib/serviceLog";
import { normaliseEmail, subscribe } from "@/lib/subscribers";

/** Which page the sign-up form was on, for the Subscribers list's "source". */
function sourceFrom(request: Request): string {
  try {
    const path = new URL(request.headers.get("referer") || "").pathname;
    return path === "/" ? "newsletter: homepage" : `newsletter: ${path}`;
  } catch {
    return "newsletter";
  }
}

/**
 * The Build Letter sign-up (footer, homepage, /start, resources, journal).
 * Adds the person to the mailing list in Admin → Subscribers and sends a
 * welcome email. If the list can't be saved, the sign-up is kept as an
 * enquiry instead so nobody is lost.
 */
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

  const email = normaliseEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const result = await subscribe(email, { source: sourceFrom(request) });
  if (result !== "error") {
    return NextResponse.json({ ok: true });
  }

  try {
    const { error } = await createServiceClient().from("enquiries").insert({
      name: "Newsletter signup",
      email,
      topic: "Newsletter",
      message: "Signed up for The Build Letter (could not be added to the mailing list automatically).",
      marketing_opt_in: true,
      status: "new",
      source_page: sourceFrom(request),
    });
    if (error) throw error;
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
