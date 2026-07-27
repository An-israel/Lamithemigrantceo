import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** Captures an African Women Builds community join/waitlist request. */
export async function POST(request: Request) {
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("membership insert failed", e);
    return NextResponse.json({ error: "Could not sign you up." }, { status: 500 });
  }
}
