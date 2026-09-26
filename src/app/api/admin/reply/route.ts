import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { sendEmail, emailConfigured } from "@/lib/resend";

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

  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "Email sending is not switched on yet. Add a Resend key to send from here." },
      { status: 503 }
    );
  }

  const result = await sendEmail({
    to,
    subject: subject || "A reply from Lami the Migrant CEO",
    text: [`Hi ${(name || "there").split(" ")[0]},`, ``, message, ``, `Lami`].join("\n"),
    replyTo: process.env.RESEND_FROM_EMAIL ? undefined : admin.email,
    kind: "admin_reply",
    label: `Reply from admin (${admin.email})`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: "Could not send the reply." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
