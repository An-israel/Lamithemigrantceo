import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Updates an order's fulfilment status (and tracking). When the status moves
 * to "shipped", emails the customer their tracking number via Resend.
 * Admin-guarded.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const { orderId, fulfilment_status, tracking_number } = await request.json();
  if (!orderId || !fulfilment_status) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ fulfilment_status, tracking_number: tracking_number || null })
    .eq("id", orderId)
    .select("email, name")
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  // Email the customer on shipment (best-effort).
  if (fulfilment_status === "shipped" && order?.email) {
    const key = process.env.RESEND_API_KEY;
    if (key && !key.includes("your_key")) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "Lami <onboarding@resend.dev>",
            to: order.email,
            subject: "Your order is on its way",
            text: [
              `Hi ${(order.name || "there").split(" ")[0]},`,
              ``,
              `Good news — your order has shipped.`,
              tracking_number ? `Tracking number: ${tracking_number}` : "",
              ``,
              `Lami`,
            ]
              .filter(Boolean)
              .join("\n"),
          }),
        });
      } catch {
        // don't fail the request if the email doesn't send
      }
    }
  }

  return NextResponse.json({ ok: true });
}
