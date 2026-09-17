import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/** Stores a product application (§11 Phase 4). */
export async function POST(request: Request) {
  if (!rateLimit(`apply:${clientIp(request)}`, 5, 60_000)) {
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
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Name and a valid email are required." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceClient();
    const productId =
      typeof body.product_id === "string" && !body.product_id.startsWith("seed-")
        ? body.product_id
        : null;
    const { error } = await supabase.from("applications").insert({
      product_id: productId,
      product_name: body.product_name ? String(body.product_name) : null,
      name,
      email,
      whatsapp: body.whatsapp ? String(body.whatsapp).trim() : null,
      answers: body.answers ?? null,
      status: "new",
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("application insert failed", e);
    return NextResponse.json({ error: "Could not submit your application." }, { status: 500 });
  }
}
