import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logEvent, errorText } from "@/lib/serviceLog";

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
    const { error } = await supabase
      .from("restock_alerts")
      .insert({ email, product_id: realId });
    if (error) throw error;
    await logEvent({
      category: "form",
      event: "restock.requested",
      status: "success",
      summary: `Restock alert requested by ${email}`,
      ref: email,
      detail: { product_id: realId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    await logEvent({
      category: "form",
      event: "restock.save_failed",
      status: "failed",
      summary: "A restock-alert request could NOT be saved",
      detail: { error: errorText(e) },
    });
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
}
