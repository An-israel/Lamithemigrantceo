import { logEvent, errorText } from "@/lib/serviceLog";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Falls back to Resend's onboarding sender until the domain is verified.
const FROM = process.env.RESEND_FROM_EMAIL || "Lami <onboarding@resend.dev>";

export function emailConfigured(): boolean {
  return !!RESEND_API_KEY && !RESEND_API_KEY.includes("your_key");
}

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Machine label for the service log, e.g. "order_confirmation". */
  kind: string;
  /** Human label for the service log, e.g. "Order confirmation". */
  label: string;
  /** Extra searchable reference (order/session id) — the recipient is always logged. */
  ref?: string;
};

export type SendEmailResult = { ok: boolean; skipped?: boolean; id?: string; error?: string };

/**
 * Sends one transactional email via Resend and records the outcome in the
 * service log (sent / failed / skipped because Resend isn't configured).
 * Never throws — a failed notification email should never take down the
 * request that triggered it.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { to, subject, text, html, replyTo, kind, label, ref } = input;
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
      }),
    });
    if (!res.ok) {
      const error = (await res.text()).slice(0, 500);
      console.error("Resend error", error);
      await logEvent({
        ...base,
        status: "failed",
        summary: `${label} to ${to} failed (Resend ${res.status})`,
        detail: { ...detail, http_status: res.status, error },
      });
      return { ok: false, error };
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
    return { ok: false, error: errorText(e) };
  }
}
