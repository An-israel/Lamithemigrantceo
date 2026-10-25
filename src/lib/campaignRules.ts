import type { EmailCampaign } from "@/lib/types";

type Content = Pick<EmailCampaign, "subject" | "body_html" | "cta_label" | "cta_url">;

/** Why an email can't be sent yet, or null if it's ready. Used by the page and the server. */
export function campaignProblem(c: Content): string | null {
  if (!c.subject.trim()) return "Add a subject line.";
  const bodyText = c.body_html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
  if (!bodyText) return "Write the email before sending it.";
  const label = c.cta_label?.trim() || "";
  const url = c.cta_url?.trim() || "";
  if ((label && !url) || (!label && url)) return "The button needs both a label and a link, or leave both empty.";
  if (url && !/^https?:\/\//i.test(url)) return "The button link must start with https://";
  return null;
}
