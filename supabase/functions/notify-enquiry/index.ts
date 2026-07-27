// Supabase Edge Function: notify-enquiry
// Fires from a Database Webhook on INSERT into public.enquiries and sends two
// emails via Resend: one to Lami, one confirming receipt to the enquirer.
//
// Set up (see docs/DEPLOYMENT.md):
//   supabase functions deploy notify-enquiry
//   supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL="..." \
//     ENQUIRY_NOTIFY_EMAIL=... SITE_URL=https://...
// Then add a Database Webhook: table public.enquiries, event INSERT, HTTP POST
// to this function's URL.
//
// deno-lint-ignore-file no-explicit-any
declare const Deno: { env: { get(k: string): string | undefined } };

interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  topic: string;
  message: string;
  marketing_opt_in: boolean;
  source_page: string | null;
  organisation: string | null;
  event_date: string | null;
  budget_range: string | null;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Falls back to Resend's onboarding sender until the domain is verified.
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Lami <onboarding@resend.dev>";
const NOTIFY_TO = Deno.env.get("ENQUIRY_NOTIFY_EMAIL") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://lamithemigrantceo.com";

async function sendEmail(to: string, subject: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, text }),
  });
  if (!res.ok) {
    console.error("Resend error", await res.text());
  }
}

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record: EnquiryRecord = payload.record ?? payload;

    if (!record?.email) {
      return new Response("No record", { status: 400 });
    }

    // 1) Notify Lami.
    if (NOTIFY_TO) {
      const adminBody = [
        `New enquiry from ${record.name}`,
        ``,
        `Type:     ${record.topic}`,
        `Email:    ${record.email}`,
        `Org:      ${record.organisation ?? "—"}`,
        `Event:    ${record.event_date ?? "—"}`,
        `Budget:   ${record.budget_range ?? "—"}`,
        `WhatsApp: ${record.whatsapp ?? "—"}`,
        `Opt-in:   ${record.marketing_opt_in ? "yes" : "no"}`,
        `Page:     ${record.source_page ?? "—"}`,
        ``,
        `Message:`,
        record.message,
        ``,
        `Open in admin: ${SITE_URL}/admin/enquiries`,
        `Reply: mailto:${record.email}`,
      ].join("\n");

      await sendEmail(
        NOTIFY_TO,
        `New enquiry: ${record.topic} from ${record.name}`,
        adminBody
      );
    }

    // 2) Confirm to the person who wrote in.
    await sendEmail(
      record.email,
      "I got your message",
      [
        `Hi ${record.name.split(" ")[0]},`,
        ``,
        `Thank you for reaching out — I have your message and I reply within one working day.`,
        `If it is urgent you can message me on WhatsApp.`,
        ``,
        `Lami`,
        `${SITE_URL}`,
      ].join("\n")
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "failed" }), { status: 500 });
  }
});
