import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { emailConfigured } from "@/lib/resend";
import { campaignProblem, loadCampaign } from "@/lib/campaigns";
import { logEvent } from "@/lib/serviceLog";

/** Freezes the audience (everyone subscribed right now) and starts sending. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  if (!emailConfigured()) {
    return NextResponse.json({ error: "Email sending is off: RESEND_API_KEY is not set in Vercel." }, { status: 503 });
  }

  const campaign = await loadCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: "Email not found." }, { status: 404 });
  if (campaign.status !== "draft") return NextResponse.json({ ok: true, alreadyStarted: true });

  const problem = campaignProblem(campaign);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const supabase = createServiceClient();
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "subscribed");
  if (!count) return NextResponse.json({ error: "There are no subscribers to send to yet." }, { status: 400 });

  const { data: recipients, error } = await supabase.rpc("start_email_campaign", { p_campaign: campaign.id });
  if (error) return NextResponse.json({ error: `Could not start sending (${error.message}).` }, { status: 500 });

  await logEvent({
    category: "email",
    event: "campaign.started",
    status: "info",
    summary: `${admin.email} started sending "${campaign.name}" to ${recipients} subscribers`,
    ref: campaign.id,
    detail: { subject: campaign.subject, recipients },
  });
  return NextResponse.json({ ok: true, recipients });
}
