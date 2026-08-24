import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

/**
 * Sends a reply email from inside the admin dashboard (Enquiries,
 * Applications), via Resend, instead of opening the admin's own email app.
 * Admin-guarded.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const { to, name, subject, message } = await request.json();
  if (!to || !message) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes("your_key")) {
    return NextResponse.json(
      { error: "Email sending is not switched on yet. Add a Resend key to send from here." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Lami <onboarding@resend.dev>",
        to,
        reply_to: process.env.RESEND_FROM_EMAIL ? undefined : admin.email,
        subject: subject || "A reply from Lami the Migrant CEO",
        text: [
          `Hi ${(name || "there").split(" ")[0]},`,
          ``,
          message,
          ``,
          `Lami`,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("resend reply failed", body);
      return NextResponse.json({ error: "Could not send the reply." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reply send failed", e);
    return NextResponse.json({ error: "Could not send the reply." }, { status: 500 });
  }
}
