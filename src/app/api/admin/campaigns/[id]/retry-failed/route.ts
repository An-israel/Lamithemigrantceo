import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { loadCampaign } from "@/lib/campaigns";

/** Puts failed recipients back in the queue so the page can send to them again. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  const campaign = await loadCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: "Email not found." }, { status: 404 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("email_campaign_recipients")
    .update({ status: "pending", error: null, claimed_at: null })
    .eq("campaign_id", campaign.id)
    .eq("status", "failed")
    .select("email");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data && data.length > 0) {
    await supabase.from("email_campaigns").update({ status: "sending", last_error: null }).eq("id", campaign.id);
  }
  return NextResponse.json({ ok: true, retrying: data?.length ?? 0 });
}
