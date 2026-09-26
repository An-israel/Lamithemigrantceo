import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logEvent, errorText } from "@/lib/serviceLog";

/** Captures an African Women Builds community join/waitlist request. */
export async function POST(request: Request) {
  if (!rateLimit(`membership:${clientIp(request)}`, 5, 60_000)) {
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

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Name and a valid email are required." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("memberships").insert({
      name,
      email,
      whatsapp: body.whatsapp ? String(body.whatsapp).trim() : null,
      reason: body.reason ? String(body.reason).trim() : null,
      status: "new",
    });
    if (error) throw error;
    await logEvent({
      category: "form",
      event: "membership.received",
      status: "success",
      summary: `African Women Builds join request from ${name}`,
      ref: email,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("membership insert failed", e);
    await logEvent({
      category: "form",
      event: "membership.save_failed",
      status: "failed",
      summary: `Join request from ${name} (${email}) could NOT be saved`,
      ref: email,
      detail: { error: errorText(e) },
    });
    return NextResponse.json({ error: "Could not sign you up." }, { status: 500 });
  }
}
