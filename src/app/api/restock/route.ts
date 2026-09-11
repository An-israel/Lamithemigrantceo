import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/** Captures a restock-alert email for a sold-out wholesale bundle. */
export async function POST(request: Request) {
  if (!rateLimit(`restock:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute and try again." }, { status: 429 });
  }

  try {
    const { productId, email } = await request.json();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""))) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    const supabase = createServiceClient();
    // Seed product ids (w-seed-*) are not real rows; store null product ref.
    const realId =
      typeof productId === "string" && !productId.startsWith("w-seed-")
        ? productId
        : null;
    await supabase
      .from("restock_alerts")
      .insert({ email, product_id: realId });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}
