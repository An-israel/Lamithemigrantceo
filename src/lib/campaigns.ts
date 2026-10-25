import { createServiceClient } from "@/lib/supabase/server";
import { campaignEmail, firstNameOf, type CampaignContent } from "@/lib/emailTemplates";
import { sendEmailBatch, sendOneEmail, marketingReplyTo, type OutgoingEmail } from "@/lib/resend";
import { unsubscribeHeaders, unsubscribeUrl } from "@/lib/subscribers";
import { logEvent } from "@/lib/serviceLog";
import type { EmailCampaign } from "@/lib/types";

export { campaignProblem } from "@/lib/campaignRules";

/** Recipients per request. One Resend batch call (max 100) per request. */
export const BATCH_SIZE = 50;
/** Spacing between single sends when a batch has to be split up. */
const SINGLE_SEND_GAP_MS = 550;

export function contentOf(c: EmailCampaign): CampaignContent {
  return {
    subject: c.subject,
    previewText: c.preview_text,
    bodyHtml: c.body_html,
    imageUrl: c.image_url,
    ctaLabel: c.cta_label,
    ctaUrl: c.cta_url,
  };
}

export async function loadCampaign(id: string): Promise<EmailCampaign | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await createServiceClient().from("email_campaigns").select("*").eq("id", id).maybeSingle();
  return (data as EmailCampaign) || null;
}

export type BatchOutcome = {
  status: "draft" | "sending" | "sent";
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  remaining: number;
  /** Sending stopped and needs the admin to resume later; human-readable reason. */
  paused?: string;
  /** Resend asked us to slow down; try again after this many ms. */
  retryAfterMs?: number;
};

async function progress(
  campaignId: string,
  extra: Partial<BatchOutcome> = {}
): Promise<BatchOutcome & { justCompleted: boolean }> {
  const supabase = createServiceClient();
  const { data: refreshed } = await supabase.rpc("refresh_email_campaign", { p_campaign: campaignId });
  const justCompleted = refreshed === "completed";
  const status = justCompleted ? "sent" : refreshed;
  const { data: c } = await supabase
    .from("email_campaigns")
    .select("recipient_count, sent_count, failed_count, skipped_count")
    .eq("id", campaignId)
    .single();
  const total = c?.recipient_count ?? 0;
  const done = (c?.sent_count ?? 0) + (c?.failed_count ?? 0) + (c?.skipped_count ?? 0);
  return {
    status: (status as BatchOutcome["status"]) || "sending",
    total,
    sent: c?.sent_count ?? 0,
    failed: c?.failed_count ?? 0,
    skipped: c?.skipped_count ?? 0,
    remaining: Math.max(0, total - done),
    justCompleted,
    ...extra,
  };
}

function pauseMessage(name: string, reason: string): string {
  if (name === "daily_quota_exceeded") {
    return "Resend's daily sending limit is reached (100 a day on the free plan). Nobody was emailed twice. Press Resume tomorrow, or upgrade your Resend plan and resume now.";
  }
  if (name === "monthly_quota_exceeded") {
    return "Resend's monthly sending limit is reached (3,000 a month on the free plan). Upgrade your Resend plan, then press Resume.";
  }
  return `Resend didn't accept the emails (${reason}). Nothing was lost. Fix the cause, then press Resume.`;
}

/**
 * Sends the next slice of a campaign. Safe to call repeatedly and from two
 * tabs at once: recipients are claimed in the database before sending.
 */
export async function sendNextBatch(campaign: EmailCampaign): Promise<BatchOutcome> {
  const supabase = createServiceClient();
  if (campaign.status !== "sending") return progress(campaign.id);

  const { data: claimed, error: claimError } = await supabase.rpc("claim_email_batch", {
    p_campaign: campaign.id,
    p_limit: BATCH_SIZE,
  });
  if (claimError) {
    return progress(campaign.id, { paused: `Could not read the send list (${claimError.message}). Press Resume to try again.` });
  }

  const rows = (claimed || []) as {
    email: string;
    subscriber_id: string | null;
    name: string | null;
    unsubscribe_token: string | null;
    subscribed: boolean;
  }[];
  if (rows.length === 0) return finish(campaign);

  const now = () => new Date().toISOString();
  const mark = async (emails: string[], patch: Record<string, unknown>) => {
    if (emails.length === 0) return;
    await supabase
      .from("email_campaign_recipients")
      .update(patch)
      .eq("campaign_id", campaign.id)
      .in("email", emails);
  };

  // People who unsubscribed after the campaign started are skipped, not emailed.
  const gone = rows.filter((r) => !r.subscribed || !r.unsubscribe_token);
  await mark(gone.map((r) => r.email), { status: "skipped", error: "Unsubscribed before this email went out", claimed_at: null });
  const live = rows.filter((r) => r.subscribed && r.unsubscribe_token);
  if (live.length === 0) return progress(campaign.id);

  const content = contentOf(campaign);
  const replyTo = marketingReplyTo();
  const emails: OutgoingEmail[] = live.map((r) => {
    const { subject, html, text } = campaignEmail(content, {
      firstName: firstNameOf(r.name),
      unsubscribeUrl: unsubscribeUrl(r.unsubscribe_token!),
    });
    return { to: r.email, subject, html, text, replyTo, headers: unsubscribeHeaders(r.unsubscribe_token!) };
  });

  const release = () => mark(live.map((r) => r.email), { status: "pending", claimed_at: null });
  const result = await sendEmailBatch(emails);

  if (result.ok) {
    // One update per recipient: each has its own Resend id.
    await Promise.all(
      live.map((r, i) =>
        supabase
          .from("email_campaign_recipients")
          .update({ status: "sent", sent_at: now(), resend_id: result.ids[i], error: null, claimed_at: null })
          .eq("campaign_id", campaign.id)
          .eq("email", r.email)
      )
    );
    return finish(campaign);
  }

  if (result.status === 429 && result.name !== "daily_quota_exceeded" && result.name !== "monthly_quota_exceeded") {
    await release();
    return progress(campaign.id, { retryAfterMs: 2000 });
  }

  if (result.status === 422 || result.status === 400) {
    // Resend rejects a whole batch if one address is bad. Send these one by
    // one so a single typo can't block everyone else.
    for (let i = 0; i < live.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, SINGLE_SEND_GAP_MS));
      const one = await sendOneEmail(emails[i]);
      if (one.ok) {
        await mark([live[i].email], { status: "sent", sent_at: now(), resend_id: one.id, error: null, claimed_at: null });
      } else if (one.status === 429 || one.status === 0 || one.status >= 500) {
        await mark(live.slice(i).map((r) => r.email), { status: "pending", claimed_at: null });
        const paused = one.status === 429 && !one.name.includes("quota") ? undefined : pauseMessage(one.name, one.reason);
        return progress(campaign.id, paused ? { paused } : { retryAfterMs: 2000 });
      } else {
        await mark([live[i].email], { status: "failed", error: one.reason, claimed_at: null });
      }
    }
    return finish(campaign);
  }

  // Quota, auth, outage or network: put everyone back and pause.
  await release();
  const paused = pauseMessage(result.name, result.reason);
  await supabase.from("email_campaigns").update({ last_error: paused, updated_at: now() }).eq("id", campaign.id);
  await logEvent({
    category: "email",
    event: "campaign.paused",
    status: "failed",
    summary: `Email "${campaign.name}" paused: ${result.reason}`,
    ref: campaign.id,
    detail: { http_status: result.status, resend_error: result.name, reason: result.reason },
  });
  return progress(campaign.id, { paused });
}

async function finish(campaign: EmailCampaign): Promise<BatchOutcome> {
  const out = await progress(campaign.id);
  if (out.justCompleted) {
    await createServiceClient().from("email_campaigns").update({ last_error: null }).eq("id", campaign.id);
    await logEvent({
      category: "email",
      event: "campaign.sent",
      status: out.failed > 0 ? "failed" : "success",
      summary: `Email "${campaign.name}" finished: ${out.sent} sent, ${out.failed} failed, ${out.skipped} skipped`,
      ref: campaign.id,
      detail: { subject: campaign.subject, total: out.total, sent: out.sent, failed: out.failed, skipped: out.skipped },
    });
  }
  return out;
}
