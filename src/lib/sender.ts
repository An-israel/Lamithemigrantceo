/**
 * Builds the "from" header for every email. Resend rejects the whole send
 * (422 "Invalid `from` field") unless it is exactly `email@example.com` or
 * `Name <email@example.com>`, and values pasted into Vercel often carry
 * things that break that: wrapping quotes, invisible characters from
 * WhatsApp/Docs, curly or full-width brackets, punctuation in the name.
 *
 * So the header is never sent as pasted. The email address is extracted
 * from RESEND_FROM_EMAIL, the display name is reduced to plain characters,
 * and a clean `Name <address>` is rebuilt. Only the address itself has to be
 * right (and its domain verified in Resend).
 */
export const DEFAULT_NAME = "Lami the Migrant CEO";
export const TEST_SENDER = "onboarding@resend.dev";

// Zero-width spaces/joiners, word joiner, BOM, soft hyphen, bidi marks.
const INVISIBLE = /[­​-‏‪-‮⁠-⁤﻿]/g;
const ADDRESS = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;

export type Sender = {
  /** The header actually sent to Resend. */
  from: string;
  address: string;
  /** Exactly what is in Vercel, with invisible characters made visible. */
  raw: string;
  /** No usable address in RESEND_FROM_EMAIL — falling back to Resend's test sender. */
  usingTestSender: boolean;
  /** RESEND_FROM_EMAIL had to be tidied to be valid. */
  repaired: boolean;
};

/** Shows what's really in the env var: invisible/non-ASCII chars become \uXXXX. */
function visible(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, (c) => `\\u${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
}

export function resolveSender(rawValue: string | undefined = process.env.RESEND_FROM_EMAIL): Sender {
  const raw = rawValue ?? "";
  const cleaned = raw
    .normalize("NFKC") // full-width ＜＠＞ and similar → plain ASCII
    .replace(INVISIBLE, "")
    .replace(/[‹〈⟨«]/g, "<") // ‹ 〈 ⟨ «
    .replace(/[›〉⟩»]/g, ">") // › 〉 ⟩ »
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[A-Z_]+\s*=\s*/, ""); // whole "RESEND_FROM_EMAIL=..." line pasted as the value

  const match = cleaned.match(ADDRESS);
  if (!match) {
    return {
      from: `${DEFAULT_NAME} <${TEST_SENDER}>`,
      address: TEST_SENDER,
      raw: visible(raw),
      usingTestSender: true,
      repaired: false,
    };
  }

  const address = match[0];
  const before = cleaned.slice(0, match.index).replace(/[<"'`‘’“”\s]+$/, "");
  const name =
    before
      .replace(/[^A-Za-z0-9 -]/g, " ")
      .replace(/\s+/g, " ")
      .trim() || DEFAULT_NAME;
  const from = `${name} <${address}>`;

  return {
    from,
    address,
    raw: visible(raw),
    usingTestSender: false,
    repaired: from !== raw.trim() && address !== raw.trim(),
  };
}
