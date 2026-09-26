/**
 * Configuration checks for the Service log page. Server-only: reads env
 * vars but only ever reports whether each is set (and Stripe's test/live
 * mode) — never a value.
 */
export type HealthLevel = "ok" | "warn" | "missing";
export type HealthCheck = { name: string; level: HealthLevel; detail: string };

function set(v: string | undefined) {
  return !!v && !v.includes("your_key") && !v.includes("your-");
}

export function configurationChecks(): HealthCheck[] {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  const stripeMode = !set(stripeKey)
    ? null
    : stripeKey!.startsWith("sk_live_") || stripeKey!.startsWith("rk_live_")
      ? "live"
      : "test";

  return [
    {
      name: "Stripe payments",
      level: !stripeMode ? "missing" : stripeMode === "live" ? "ok" : "warn",
      detail: !stripeMode
        ? "STRIPE_SECRET_KEY is not set — checkout is switched off."
        : stripeMode === "live"
          ? "Live mode — real cards are being charged."
          : "Test mode — only Stripe test cards work, no real money is taken. Switch to live keys to launch.",
    },
    {
      name: "Stripe webhook",
      level: set(process.env.STRIPE_WEBHOOK_SECRET) ? "ok" : "missing",
      detail: set(process.env.STRIPE_WEBHOOK_SECRET)
        ? "Signing secret set. Payments are recorded as orders and confirmation / abandoned-checkout emails are sent."
        : "STRIPE_WEBHOOK_SECRET is not set — payments will NOT be saved as orders and no confirmation emails go out.",
    },
    {
      name: "Email sending (Resend)",
      level: set(resendKey) ? "ok" : "missing",
      detail: set(resendKey)
        ? "RESEND_API_KEY set — transactional emails are sent."
        : "RESEND_API_KEY is not set — no emails are sent (they show as Skipped below).",
    },
    {
      name: "Sender address",
      level: set(from) ? "ok" : "warn",
      detail: set(from)
        ? `Emails are sent from ${from}.`
        : "RESEND_FROM_EMAIL is not set — using Resend's test sender, which only delivers to the Resend account owner. Verify your domain in Resend and set it.",
    },
    {
      name: "Enquiry alerts",
      level: set(process.env.ENQUIRY_NOTIFY_EMAIL) ? "ok" : "warn",
      detail: set(process.env.ENQUIRY_NOTIFY_EMAIL)
        ? `New enquiries are emailed to ${process.env.ENQUIRY_NOTIFY_EMAIL}.`
        : "ENQUIRY_NOTIFY_EMAIL is not set — enquiries are saved but nobody is emailed about them.",
    },
    {
      name: "Newsletter list",
      level: set(process.env.RESEND_AUDIENCE_ID) ? "ok" : "warn",
      detail: set(process.env.RESEND_AUDIENCE_ID)
        ? "Build Letter sign-ups are added to your Resend audience."
        : "RESEND_AUDIENCE_ID is not set — sign-ups are only saved in Enquiries, not added to a mailing list.",
    },
    {
      name: "Database (server access)",
      level: set(process.env.SUPABASE_SERVICE_ROLE_KEY) ? "ok" : "missing",
      detail: set(process.env.SUPABASE_SERVICE_ROLE_KEY)
        ? "Service key set — orders, forms and this log can be written."
        : "SUPABASE_SERVICE_ROLE_KEY is not set — orders, forms and this log cannot be saved.",
    },
    {
      name: "Site address",
      level: set(process.env.NEXT_PUBLIC_SITE_URL) ? "ok" : "warn",
      detail: set(process.env.NEXT_PUBLIC_SITE_URL)
        ? `Links in emails point to ${process.env.NEXT_PUBLIC_SITE_URL}.`
        : "NEXT_PUBLIC_SITE_URL is not set — links in emails and checkout may point to the wrong address.",
    },
  ];
}
