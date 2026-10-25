const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lamithemigrantceo.uk";
const LOGO_URL = `${SITE_URL}/brand/lockup-horizontal-color.png`;

const BRAND = {
  clay: "#0E4D3A",
  clayDeep: "#0A3A2B",
  ink: "#17140E",
  muted: "#6E6658",
  shell: "#F8F6F0",
  line: "#E5DDCB",
  gold: "#B4893C",
};

function wrap(bodyHtml: string, opts: { preheader?: string; footerHtml?: string } = {}): string {
  const preheader = opts.preheader
    ? `<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${BRAND.shell};">${opts.preheader}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lami the Migrant CEO</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.shell}; font-family:Arial, Helvetica, sans-serif;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.shell};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#FFFFFF; border-radius:16px; overflow:hidden; border:1px solid ${BRAND.line};">
          <tr>
            <td align="center" style="padding:32px 32px 8px;">
              <img src="${LOGO_URL}" alt="Lami the Migrant CEO" width="200" style="display:block; width:200px; max-width:60%; height:auto;">
            </td>
          </tr>
          ${bodyHtml}
          <tr>
            <td style="padding:24px 32px 32px; border-top:1px solid ${BRAND.line};">
              <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.6; color:${BRAND.muted};">
                Lami the Migrant CEO &middot; <a href="${SITE_URL}" style="color:${BRAND.muted};">${SITE_URL.replace(/^https?:\/\//, "")}</a>
              </p>${opts.footerHtml ?? ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 4px;">
    <tr>
      <td align="center" style="border-radius:10px; background-color:${BRAND.clay};">
        <a href="${href}" style="display:inline-block; padding:14px 28px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:bold; color:${BRAND.shell}; text-decoration:none; border-radius:10px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function orderConfirmationEmail(params: {
  name: string;
  itemName: string;
  amountGbp: number;
  siteUrl?: string;
}) {
  const site = params.siteUrl || SITE_URL;
  const firstName = params.name.split(" ")[0] || "there";
  const amount = `£${params.amountGbp.toFixed(2)}`;

  const html = wrap(`
    <tr>
      <td style="padding:8px 32px 0;">
        <p style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.3; color:${BRAND.ink};">
          You're in, ${firstName}.
        </p>
        <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:${BRAND.muted};">
          Thank you for buying from Lami the Migrant CEO — your payment is confirmed and your place is booked.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; border:1px solid ${BRAND.line}; border-radius:12px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:${BRAND.gold};">
                Order
              </p>
              <p style="margin:6px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:${BRAND.ink};">
                ${params.itemName}
              </p>
              <p style="margin:6px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:${BRAND.muted};">
                ${amount} &middot; paid
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:${BRAND.muted};">
          Sign in any time to see everything you've bought and pick up where you left off.
        </p>
        ${button("Sign in to your account", `${site}/my`)}
        <p style="margin:24px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:${BRAND.muted};">
          Any questions at all, just reply to this email.
        </p>
        <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:${BRAND.ink};">
          Lami
        </p>
      </td>
    </tr>
  `);

  const text = [
    `You're in, ${firstName}.`,
    ``,
    `Thank you for buying from Lami the Migrant CEO — your payment is confirmed and your place is booked.`,
    ``,
    `Order: ${params.itemName}`,
    `${amount} — paid`,
    ``,
    `Sign in any time to see everything you've bought: ${site}/my`,
    ``,
    `Any questions at all, just reply to this email.`,
    ``,
    `Lami`,
  ].join("\n");

  return { subject: "You are in — payment confirmed", html, text };
}

export function abandonedCheckoutEmail(params: {
  name: string;
  itemName: string;
  amountGbp: number;
  resumeUrl: string;
}) {
  const firstName = params.name.split(" ")[0] || "there";
  const amount = `£${params.amountGbp.toFixed(2)}`;

  const html = wrap(`
    <tr>
      <td style="padding:8px 32px 0;">
        <p style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.3; color:${BRAND.ink};">
          Did you mean to finish, ${firstName}?
        </p>
        <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:${BRAND.muted};">
          You started checking out but didn't complete your payment. No charge was made — your spot isn't held, so if you'd still like it, you'll need to check out again.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; border:1px solid ${BRAND.line}; border-radius:12px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:${BRAND.gold};">
                Left in your cart
              </p>
              <p style="margin:6px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:${BRAND.ink};">
                ${params.itemName}
              </p>
              <p style="margin:6px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:${BRAND.muted};">
                ${amount}
              </p>
            </td>
          </tr>
        </table>
        ${button("Complete your order", params.resumeUrl)}
        <p style="margin:24px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:${BRAND.muted};">
          If something stopped you, or you have a question before you buy, just reply to this email — I read them myself.
        </p>
        <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:${BRAND.ink};">
          Lami
        </p>
      </td>
    </tr>
  `);

  const text = [
    `Did you mean to finish, ${firstName}?`,
    ``,
    `You started checking out but didn't complete your payment. No charge was made — your spot isn't held, so if you'd still like it, you'll need to check out again.`,
    ``,
    `Left in your cart: ${params.itemName} — ${amount}`,
    ``,
    `Complete your order: ${params.resumeUrl}`,
    ``,
    `If something stopped you, or you have a question before you buy, just reply to this email — I read them myself.`,
    ``,
    `Lami`,
  ].join("\n");

  return { subject: "Did you mean to finish checking out?", html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function freeResourceEmail(params: {
  title: string;
  /** Direct file or video link, when the resource has one. */
  accessUrl: string | null;
  kind: "file" | "video" | "none";
  resourcesUrl: string;
}) {
  const title = escapeHtml(params.title);
  const cta =
    params.kind === "file" ? "Download your guide" : params.kind === "video" ? "Watch now" : "View free resources";
  const link = params.accessUrl || params.resourcesUrl;
  const lead =
    params.kind === "none"
      ? "Thank you for requesting it. I'll send it to this address shortly."
      : "Here it is, as promised. Keep this email so you can come back to it any time.";

  const html = wrap(`
    <tr>
      <td style="padding:8px 32px 0;">
        <p style="margin:0; font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.3; color:${BRAND.ink};">
          Your free resource is here.
        </p>
        <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:${BRAND.muted};">
          ${lead}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; border:1px solid ${BRAND.line}; border-radius:12px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; letter-spacing:0.08em; text-transform:uppercase; color:${BRAND.gold};">
                Free resource
              </p>
              <p style="margin:6px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:${BRAND.ink};">
                ${title}
              </p>
            </td>
          </tr>
        </table>
        ${params.kind === "none" ? "" : button(cta, escapeHtml(link))}
        <p style="margin:24px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:${BRAND.muted};">
          Questions about getting started? Just reply to this email. I read them myself.
        </p>
        <p style="margin:16px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:${BRAND.ink};">
          Lami
        </p>
      </td>
    </tr>
  `);

  const text = [
    `Your free resource is here.`,
    ``,
    params.kind === "none" ? lead : `${params.title}: ${link}`,
    ``,
    `Questions about getting started? Just reply to this email. I read them myself.`,
    ``,
    `Lami`,
  ].join("\n");

  return { subject: `Your free resource: ${params.title}`, html, text };
}

// ---------------------------------------------------------------------------
// Marketing emails (The Build Letter campaigns + welcome)
// ---------------------------------------------------------------------------

const FONT = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

/** Matches {{first_name}} (any spacing/case) in subject, preview and body. */
const FIRST_NAME_TAG = /\{\{\s*first_?name\s*\}\}/gi;

export function firstNameOf(name: string | null | undefined): string {
  const first = (name || "").trim().split(/\s+/)[0] || "";
  return first || "there";
}

export function personalize(text: string, firstName: string): string {
  return text.replace(FIRST_NAME_TAG, firstName);
}

/**
 * Turns the rich-text editor's HTML into email-safe HTML: strips anything
 * that isn't text formatting, and inlines styles (many inboxes ignore
 * <style> blocks and classes).
 */
export function emailSafeBody(html: string): string {
  const allowed = new Set(["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li", "a", "blockquote", "hr"]);
  const clean = (html || "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, rawName: string, attrs: string) => {
      const name = rawName.toLowerCase();
      if (!allowed.has(name)) return "";
      if (tag.startsWith("</")) return `</${name}>`;
      if (name === "a") {
        const href = (attrs.match(/href\s*=\s*"([^"]*)"/i) || attrs.match(/href\s*=\s*'([^']*)'/i) || [])[1] || "";
        const safe = /^(https?:|mailto:|tel:)/i.test(href.trim()) ? href.trim() : "#";
        return `<a href="${escapeHtml(safe)}">`;
      }
      return `<${name}>`;
    });

  const styles: Record<string, string> = {
    p: `margin:0 0 16px; font-family:${FONT}; font-size:16px; line-height:1.6; color:${BRAND.ink};`,
    h2: `margin:24px 0 12px; font-family:${SERIF}; font-size:22px; line-height:1.3; font-weight:normal; color:${BRAND.ink};`,
    h3: `margin:20px 0 10px; font-family:${FONT}; font-size:17px; line-height:1.4; font-weight:bold; color:${BRAND.ink};`,
    ul: `margin:0 0 16px; padding-left:22px; font-family:${FONT}; font-size:16px; line-height:1.6; color:${BRAND.ink};`,
    ol: `margin:0 0 16px; padding-left:22px; font-family:${FONT}; font-size:16px; line-height:1.6; color:${BRAND.ink};`,
    li: `margin:0 0 6px;`,
    a: `color:${BRAND.clay}; text-decoration:underline;`,
    blockquote: `margin:0 0 16px; padding:4px 0 4px 16px; border-left:3px solid ${BRAND.gold}; font-family:${SERIF}; font-size:18px; line-height:1.5; color:${BRAND.ink};`,
    hr: `border:0; border-top:1px solid ${BRAND.line}; margin:24px 0;`,
  };

  return clean
    .replace(/<p><\/p>/g, '<p style="margin:0 0 16px;">&nbsp;</p>')
    .replace(/<(p|h2|h3|ul|ol|li|blockquote|hr)>/g, (_m, n: string) => `<${n} style="${styles[n]}">`)
    .replace(/<a href="/g, `<a style="${styles.a}" href="`)
    .replace(/<li style="[^"]*">\s*<p style="[^"]*">([\s\S]*?)<\/p>\s*<\/li>/g, `<li style="${styles.li}">$1</li>`);
}

/** Plain-text twin of an HTML body, for the text/plain part. */
export function htmlToText(html: string): string {
  return (html || "")
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, "").trim();
      return href && href !== "#" && href !== text ? `${text} (${href})` : text;
    })
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/(p|h2|h3|li|blockquote|ul|ol)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr[^>]*>/gi, "\n----\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function marketingFooter(unsubscribeUrl: string): string {
  return `
              <p style="margin:10px 0 0; font-family:${FONT}; font-size:12px; line-height:1.6; color:${BRAND.muted};">
                You're getting this because you signed up for The Build Letter.
                <a href="${escapeHtml(unsubscribeUrl)}" style="color:${BRAND.muted}; text-decoration:underline;">Unsubscribe</a>
              </p>`;
}

export type CampaignContent = {
  subject: string;
  previewText: string;
  bodyHtml: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

export function campaignEmail(
  c: CampaignContent,
  recipient: { firstName: string; unsubscribeUrl: string }
) {
  const first = escapeHtml(recipient.firstName);
  const subject = personalize(c.subject, recipient.firstName);
  const preview = personalize(c.previewText || "", first);
  const body = personalize(emailSafeBody(c.bodyHtml), first);
  const hasCta = !!(c.ctaLabel?.trim() && c.ctaUrl?.trim() && /^https?:\/\//i.test(c.ctaUrl.trim()));

  const html = wrap(
    `
    ${
      c.imageUrl
        ? `<tr><td style="padding:16px 32px 0;"><img src="${escapeHtml(c.imageUrl)}" alt="" width="496" style="display:block; width:100%; max-width:496px; height:auto; border-radius:12px;"></td></tr>`
        : ""
    }
    <tr>
      <td style="padding:20px 32px 8px;">
        ${body}
        ${hasCta ? button(escapeHtml(c.ctaLabel!.trim()), escapeHtml(c.ctaUrl!.trim())) : ""}
        <p style="margin:24px 0 0; font-family:${FONT}; font-size:15px; color:${BRAND.ink};">Lami</p>
      </td>
    </tr>
  `,
    { preheader: preview, footerHtml: marketingFooter(recipient.unsubscribeUrl) }
  );

  const text = [
    htmlToText(personalize(c.bodyHtml, recipient.firstName)),
    hasCta ? `\n${c.ctaLabel!.trim()}: ${c.ctaUrl!.trim()}` : "",
    "",
    "Lami",
    "",
    "---",
    `You're getting this because you signed up for The Build Letter. Unsubscribe: ${recipient.unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

export function welcomeEmail(params: { firstName: string; unsubscribeUrl: string; siteUrl?: string }) {
  const site = params.siteUrl || SITE_URL;
  const first = escapeHtml(params.firstName);
  const html = wrap(
    `
    <tr>
      <td style="padding:8px 32px 0;">
        <p style="margin:0; font-family:${SERIF}; font-size:24px; line-height:1.3; color:${BRAND.ink};">
          Welcome to The Build Letter, ${first}.
        </p>
        <p style="margin:16px 0 0; font-family:${FONT}; font-size:15px; line-height:1.6; color:${BRAND.muted};">
          You're in. Every so often I'll send you practical business, wealth and legacy insights: what's working, what to avoid, and new resources before anyone else.
        </p>
        <p style="margin:16px 0 0; font-family:${FONT}; font-size:15px; line-height:1.6; color:${BRAND.muted};">
          While you wait for the first one, the free guides are a good place to start.
        </p>
        ${button("Get the free guides", `${site}/resources`)}
        <p style="margin:24px 0 0; font-family:${FONT}; font-size:14px; line-height:1.6; color:${BRAND.muted};">
          Reply any time and tell me what you're building. I read every message.
        </p>
        <p style="margin:16px 0 0; font-family:${FONT}; font-size:15px; color:${BRAND.ink};">Lami</p>
      </td>
    </tr>
  `,
    { preheader: "You're in. Here's what to expect.", footerHtml: marketingFooter(params.unsubscribeUrl) }
  );

  const text = [
    `Welcome to The Build Letter, ${params.firstName}.`,
    "",
    "You're in. Every so often I'll send you practical business, wealth and legacy insights: what's working, what to avoid, and new resources before anyone else.",
    "",
    `While you wait for the first one, the free guides are a good place to start: ${site}/resources`,
    "",
    "Reply any time and tell me what you're building. I read every message.",
    "",
    "Lami",
    "",
    "---",
    `Unsubscribe: ${params.unsubscribeUrl}`,
  ].join("\n");

  return { subject: "Welcome to The Build Letter", html, text };
}
