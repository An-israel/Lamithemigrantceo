import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Footer "free starter list" capture. Stored as an enquiry with topic
 * "Newsletter" and marketing opt-in, so it lands in the same inbox Lami
 * already checks. Kept deliberately simple.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("newsletter insert failed", e);
    return NextResponse.json({ error: "Could not sign you up." }, { status: 500 });
  }
}
