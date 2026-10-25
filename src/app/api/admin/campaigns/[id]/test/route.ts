import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { emailConfigured, sendEmail, marketingReplyTo } from "@/lib/resend";
import { campaignEmail } from "@/lib/emailTemplates";
import { contentOf, loadCampaign } from "@/lib/campaigns";
import { normaliseEmail } from "@/lib/subscribers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lamithemigrantceo.uk";

/** Sends the campaign, as it is now, to one address with [Test] in the subject. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  if (!emailConfigured()) {
    return NextResponse.json({ error: "Email sending is off: RESEND_API_KEY is not set in Vercel." }, { status: 503 });
  }

  const campaign = await loadCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: "Email not found." }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { to?: string };
  const to = normaliseEmail(body.to || admin.email);
  if (!to) return NextResponse.json({ error: "Enter a valid email address for the test." }, { status: 400 });
  if (!campaign.subject.trim()) return NextResponse.json({ error: "Add a subject line first." }, { status: 400 });

  const { subject, html, text } = campaignEmail(contentOf(campaign), {
    firstName: "there",
    unsubscribeUrl: `${SITE_URL}/unsubscribe?test=1`,
  });
  const result = await sendEmail({
    to,
    subject: `[Test] ${subject}`,
    html,
    text,
    replyTo: marketingReplyTo(),
    kind: "campaign_test",
    label: `Test of "${campaign.name}"`,
    ref: campaign.id,
  });

  return result.ok
    ? NextResponse.json({ ok: true, message: `Test sent to ${to}. It can take a minute to arrive; check spam too.` })
    : NextResponse.json({ error: `Resend refused it: ${result.reason || "unknown error"}` }, { status: 502 });
}
