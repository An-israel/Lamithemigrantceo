import { logEvent, errorText } from "@/lib/serviceLog";
import { resolveSender } from "@/lib/sender";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Always a valid `Name <address>`, rebuilt from RESEND_FROM_EMAIL however
// it was pasted; falls back to Resend's test sender if it holds no address.
const SENDER = resolveSender();
const FROM = SENDER.from;

/** Pulls Resend's own explanation out of an error response body. */
function resendMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string; name?: string };
    return parsed.message || parsed.name || body;
  } catch {
    return body;
  }
}

export function senderInUse(): string {
  return FROM;
}

export function emailConfigured(): boolean {
  return !!RESEND_API_KEY && !RESEND_API_KEY.includes("your_key");
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Extra email headers, e.g. List-Unsubscribe on marketing emails. */
  headers?: Record<string, string>;
  /** Machine label for the service log, e.g. "order_confirmation". */
  kind: string;
  /** Human label for the service log, e.g. "Order confirmation". */
  label: string;
  /** Extra searchable reference (order/session id) — the recipient is always logged. */
  ref?: string;
};

export type SendEmailResult = {
  ok: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
  /** Resend's own human-readable reason, when it rejected the send. */
  reason?: string;
};

/**
 * Sends one transactional email via Resend and records the outcome in the
 * service log (sent / failed / skipped because Resend isn't configured).
 * Never throws — a failed notification email should never take down the
 * request that triggered it.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { to, subject, text, html, replyTo, headers, kind, label, ref } = input;
  const base = { category: "email" as const, event: `email.${kind}`, ref: to };
  const detail = { to, subject, kind, from: FROM, ...(ref ? { related: ref } : {}) };

  if (!emailConfigured()) {
    await logEvent({
      ...base,
      status: "skipped",
      summary: `${label} not sent to ${to}: RESEND_API_KEY is not set`,
      detail,
    });
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(headers ? { headers } : {}),
      }),
    });
    if (!res.ok) {
      const error = (await res.text()).slice(0, 500);
      console.error("Resend error", error);
      const reason = resendMessage(error).slice(0, 200);
      await logEvent({
        ...base,
        status: "failed",
        summary: `${label} to ${to} failed (Resend ${res.status}: ${reason})`,
        detail: {
          ...detail,
          http_status: res.status,
          error,
          resend_from_email_in_vercel: SENDER.raw,
        },
      });
      return { ok: false, error, reason };
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    await logEvent({
      ...base,
      status: "success",
      summary: `${label} sent to ${to}`,
      detail: { ...detail, resend_id: body.id ?? null },
    });
    return { ok: true, id: body.id };
  } catch (e) {
    console.error("Resend request failed", e);
    await logEvent({
      ...base,
      status: "failed",
      summary: `${label} to ${to} failed (could not reach Resend)`,
      detail: { ...detail, error: errorText(e) },
    });
    return { ok: false, error: errorText(e), reason: "Could not reach Resend" };
  }
}

// ---------------------------------------------------------------------------
// Bulk sending for campaigns. No per-email service-log rows here (a campaign
// of 500 would flood it); the campaign routes log the outcome once.
// ---------------------------------------------------------------------------

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export type BulkFailure = {
  ok: false;
  status: number;
  /** Resend's error name, e.g. "daily_quota_exceeded", "rate_limit_exceeded". */
  name: string;
  reason: string;
};

function payload(e: OutgoingEmail) {
  return {
    from: FROM,
    to: e.to,
    subject: e.subject,
    html: e.html,
    text: e.text,
    ...(e.replyTo ? { reply_to: e.replyTo } : {}),
    ...(e.headers ? { headers: e.headers } : {}),
  };
}

async function failureFrom(res: Response): Promise<BulkFailure> {
  const body = (await res.text()).slice(0, 500);
  let name = "";
  try {
    name = (JSON.parse(body) as { name?: string }).name || "";
  } catch {
    /* not JSON */
  }
  return { ok: false, status: res.status, name, reason: resendMessage(body).slice(0, 200) };
}

/** Up to 100 emails in one Resend call. Ids come back in the same order. */
export async function sendEmailBatch(
  emails: OutgoingEmail[]
): Promise<{ ok: true; ids: (string | null)[] } | BulkFailure> {
  try {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(emails.map(payload)),
    });
    if (!res.ok) return failureFrom(res);
    const body = (await res.json().catch(() => ({}))) as { data?: { id?: string }[] };
    return { ok: true, ids: emails.map((_, i) => body.data?.[i]?.id ?? null) };
  } catch (e) {
    return { ok: false, status: 0, name: "network_error", reason: `Could not reach Resend (${errorText(e)})` };
  }
}

/** One email, unlogged — used to isolate a bad address when a batch is rejected. */
export async function sendOneEmail(email: OutgoingEmail): Promise<{ ok: true; id: string | null } | BulkFailure> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload(email)),
    });
    if (!res.ok) return failureFrom(res);
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: body.id ?? null };
  } catch (e) {
    return { ok: false, status: 0, name: "network_error", reason: `Could not reach Resend (${errorText(e)})` };
  }
}

/** Where replies to marketing emails go: Lami's inbox, if set. */
export function marketingReplyTo(): string | undefined {
  const to = process.env.ENQUIRY_NOTIFY_EMAIL?.trim();
  return to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ? to : undefined;
}
