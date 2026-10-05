import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { emailConfigured, sendEmail, senderInUse } from "@/lib/resend";

/** Sends a test email to the signed-in admin and reports Resend's answer. Admin-guarded. */
export async function POST() {
  const admin = await getAdminUser();
  if (!admin?.email) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }
  if (!emailConfigured()) {
    return NextResponse.json({
      ok: false,
      message: "RESEND_API_KEY is not set in Vercel, so no email can be sent.",
    });
  }

  const from = senderInUse();
  const result = await sendEmail({
    to: admin.email,
    subject: "Test email from your website",
    text: [
      "This is a test from Admin → Service log.",
      "",
      `If you're reading it, emails from the site are working. Sent from: ${from}`,
      "",
      "Lami the Migrant CEO",
    ].join("\n"),
    kind: "test",
    label: "Test email",
  });

  return NextResponse.json(
    result.ok
      ? { ok: true, message: `Sent to ${admin.email} from ${from}. Check that inbox (and spam).` }
      : {
          ok: false,
          message: `Resend refused it: ${result.reason || "unknown error"}`,
          from,
        }
  );
}
