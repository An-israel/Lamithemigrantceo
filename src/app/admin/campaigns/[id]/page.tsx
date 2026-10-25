import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import type { EmailCampaign, EmailCampaignRecipient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CampaignPage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const supabase = createClient();
  const [{ data: campaign }, { count }, admin] = await Promise.all([
    supabase.from("email_campaigns").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    getAdminUser(),
  ]);
  if (!campaign) notFound();

  let problems: EmailCampaignRecipient[] = [];
  if ((campaign as EmailCampaign).status !== "draft") {
    const { data } = await supabase
      .from("email_campaign_recipients")
      .select("campaign_id, email, status, sent_at, error")
      .eq("campaign_id", params.id)
      .in("status", ["failed", "skipped"])
      .order("email")
      .limit(500);
    problems = (data as EmailCampaignRecipient[]) || [];
  }

  return (
    <>
      <Link href="/admin/campaigns" className="text-sm text-muted no-underline hover:text-ink">
        ← All emails
      </Link>
      <CampaignEditor
        initial={campaign as EmailCampaign}
        subscriberCount={count || 0}
        adminEmail={admin?.email || ""}
        problems={problems}
      />
    </>
  );
}
