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

function wrap(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lami the Migrant CEO</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.shell}; font-family:Arial, Helvetica, sans-serif;">
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
              </p>
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
