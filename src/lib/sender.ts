/**
 * The "from" address for every email. Resend rejects the whole send with a
 * 422 if this isn't `hello@domain` or `Name <hello@domain>`, so it's
 * normalised here (stray whitespace and wrapping quotes pasted into Vercel
 * are common) and checked for the Service log's Setup health panel.
 */
export const DEFAULT_FROM = "Lami <onboarding@resend.dev>";

export function configuredFrom(): string {
  return (process.env.RESEND_FROM_EMAIL ?? "")
    .trim()
    .replace(/^(["'])([\s\S]*)\1$/, "$2")
    .trim();
}

export function senderAddress(): string {
  return configuredFrom() || DEFAULT_FROM;
}

/** Why Resend would reject RESEND_FROM_EMAIL, or null if it looks valid (or is unset). */
export function senderProblem(): string | null {
  const value = configuredFrom();
  if (!value) return null;

  const named = value.match(/^([^<>]*)<([^<>]*)>$/);
  const address = (named ? named[2] : value).trim();
  const name = named ? named[1].trim() : "";

  if (!named && /[<>]/.test(value)) {
    return "its angle brackets don't match";
  }
  if (!/^[^\s@<>",;]+@[^\s@<>",;]+\.[A-Za-z]{2,}$/.test(address)) {
    return `"${address}" is not a single valid email address`;
  }
  if (name && !/^".*"$/.test(name) && /[,;]/.test(name)) {
    return "the display name contains a comma or semicolon";
  }
  return null;
}
