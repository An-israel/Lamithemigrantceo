import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewCampaignButton } from "@/components/admin/NewCampaignButton";
import type { EmailCampaign } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<EmailCampaign["status"], string> = {
  draft: "bg-peach-deep text-ink",
  sending: "bg-gold/25 text-ink",
  sent: "bg-jade text-shell",
};

function when(c: EmailCampaign) {
  const iso = c.status === "sent" ? c.sent_at : c.status === "sending" ? c.started_at : c.updated_at;
  if (!iso) return "";
  const date = new Date(iso).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });
  return c.status === "sent" ? `Sent ${date}` : c.status === "sending" ? `Started ${date}` : `Edited ${date}`;
}

export default async function CampaignsPage() {
  const supabase = createClient();
  let campaigns: EmailCampaign[] = [];
  let subscribed = 0;
  let ready = true;
  try {
    const [list, count] = await Promise.all([
      supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    ]);
    if (list.error) ready = false;
    campaigns = (list.data as EmailCampaign[]) || [];
    subscribed = count.count || 0;
  } catch {
    ready = false;
  }

  return (
    <>
      <h1>Email campaigns</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Write The Build Letter and send it to everyone on your mailing list. Each email is branded, has its own
        unsubscribe link, and you can send yourself a test before it goes out.
      </p>

      {!ready && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          Email marketing isn&rsquo;t set up in the database yet. Run{" "}
          <code>supabase/migrations/0020_email_marketing.sql</code> in the Supabase SQL editor, then reload.
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <NewCampaignButton />
        <p className="text-sm text-muted">
          <Link href="/admin/subscribers" className="font-bold text-ink">
            {subscribed} subscriber{subscribed === 1 ? "" : "s"}
          </Link>{" "}
          on your list
        </p>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-card border border-line bg-shell">
        {campaigns.length === 0 && (
          <li className="p-4 text-sm text-muted">No emails yet. Write your first one above.</li>
        )}
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/campaigns/${c.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 text-ink no-underline hover:bg-peach/40">
              <span className={`pill shrink-0 text-xs ${STATUS_PILL[c.status]}`}>{c.status}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{c.name}</span>
                <span className="block truncate text-sm text-muted">{c.subject || "No subject yet"}</span>
              </span>
              <span className="text-right text-sm text-muted">
                {c.status !== "draft" && (
                  <span className="block tabular-nums text-ink">
                    {c.sent_count} of {c.recipient_count} sent
                    {c.failed_count > 0 ? ` · ${c.failed_count} failed` : ""}
                  </span>
                )}
                <span className="block">{when(c)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-prose text-xs text-muted">
        Sending uses your Resend account. On Resend&rsquo;s free plan that&rsquo;s 100 emails a day and 3,000 a month in
        total, shared with order confirmations. If you reach the limit, sending pauses and you can resume it later. Nobody
        is emailed twice.
      </p>
    </>
  );
}
