const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Falls back to Resend's onboarding sender until the domain is verified.
const FROM = process.env.RESEND_FROM_EMAIL || "Lami <onboarding@resend.dev>";

/**
 * Sends one transactional email via Resend. Silently no-ops if
 * RESEND_API_KEY isn't set yet, and never throws — a failed notification
 * email should never take down the request that triggered it.
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  if (!RESEND_API_KEY) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text, ...(html ? { html } : {}) }),
    });
    if (!res.ok) {
      console.error("Resend error", await res.text());
    }
  } catch (e) {
    console.error("Resend request failed", e);
  }
}
