import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** Stores a programme application (§11 Phase 4). */
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
    const programId =
      typeof body.program_id === "string" && !body.program_id.startsWith("seed-")
        ? body.program_id
        : null;
    const { error } = await supabase.from("applications").insert({
      program_id: programId,
      program_name: body.program_name ? String(body.program_name) : null,
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
