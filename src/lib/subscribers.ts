import { createServiceClient } from "@/lib/supabase/server";
import { logEvent, errorText } from "@/lib/serviceLog";
import { sendEmail, marketingReplyTo } from "@/lib/resend";
import { welcomeEmail, firstNameOf } from "@/lib/emailTemplates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lamithemigrantceo.uk";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normaliseEmail(value: unknown): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  return EMAIL.test(email) && email.length <= 254 ? email : null;
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/unsubscribe?t=${token}`;
}

/** RFC 8058 one-click unsubscribe headers (Gmail/Yahoo show an Unsubscribe button). */
export function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${SITE_URL}/api/unsubscribe?t=${token}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export type SubscribeResult = "added" | "resubscribed" | "already" | "invalid" | "error";

/**
 * Adds someone who has just asked for The Build Letter. A person who
 * unsubscribed earlier and signs up again is re-subscribed (that sign-up is
 * fresh consent). New and returning subscribers get a welcome email.
 */
export async function subscribe(
  rawEmail: unknown,
  opts: { name?: string | null; source: string; welcome?: boolean }
): Promise<SubscribeResult> {
  const email = normaliseEmail(rawEmail);
  if (!email) return "invalid";
  const name = opts.name?.trim() || null;

  try {
    const supabase = createServiceClient();
    const { data: existing, error: readError } = await supabase
      .from("subscribers")
      .select("id, status, name, unsubscribe_token")
      .eq("email", email)
      .maybeSingle();
    if (readError) throw readError;

    let token: string;
    let result: SubscribeResult;
    let knownName = name;

    if (!existing) {
      const { data, error } = await supabase
        .from("subscribers")
        .insert({ email, name, source: opts.source })
        .select("unsubscribe_token")
        .single();
      if (error?.code === "23505") return "already"; // signed up twice at once
      if (error) throw error;
      token = data.unsubscribe_token;
      result = "added";
    } else if (existing.status === "unsubscribed") {
      const { error } = await supabase
        .from("subscribers")
        .update({
          status: "subscribed",
          consent_at: new Date().toISOString(),
          unsubscribed_at: null,
          source: opts.source,
          ...(name && !existing.name ? { name } : {}),
        })
        .eq("id", existing.id);
      if (error) throw error;
      token = existing.unsubscribe_token;
      knownName = existing.name || name;
      result = "resubscribed";
    } else {
      if (name && !existing.name) {
        await supabase.from("subscribers").update({ name }).eq("id", existing.id);
      }
      return "already";
    }

    await logEvent({
      category: "form",
      event: result === "added" ? "subscriber.added" : "subscriber.resubscribed",
      status: "success",
      summary:
        result === "added"
          ? `New Build Letter subscriber: ${email} (${opts.source})`
          : `${email} re-subscribed to The Build Letter (${opts.source})`,
      ref: email,
    });

    if (opts.welcome !== false) {
      const url = unsubscribeUrl(token);
      const { subject, html, text } = welcomeEmail({ firstName: firstNameOf(knownName), unsubscribeUrl: url });
      await sendEmail({
        to: email,
        subject,
        html,
        text,
        replyTo: marketingReplyTo(),
        headers: unsubscribeHeaders(token),
        kind: "welcome",
        label: "Build Letter welcome email",
      });
    }
    return result;
  } catch (e) {
    await logEvent({
      category: "form",
      event: "subscriber.save_failed",
      status: "failed",
      summary: `${email} asked for The Build Letter but could NOT be added to the mailing list`,
      ref: email,
      detail: { source: opts.source, error: errorText(e) },
    });
    return "error";
  }
}

/** Looks up a subscriber by the token in their unsubscribe link. */
export async function findByToken(token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await createServiceClient()
    .from("subscribers")
    .select("id, email, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  return data as { id: string; email: string; status: "subscribed" | "unsubscribed" } | null;
}

export async function setSubscribedByToken(
  token: string,
  subscribed: boolean,
  via: string
): Promise<{ email: string; status: "subscribed" | "unsubscribed" } | null> {
  const found = await findByToken(token);
  if (!found) return null;
  const target = subscribed ? "subscribed" : "unsubscribed";
  if (found.status !== target) {
    const { error } = await createServiceClient()
      .from("subscribers")
      .update(
        subscribed
          ? { status: target, consent_at: new Date().toISOString(), unsubscribed_at: null }
          : { status: target, unsubscribed_at: new Date().toISOString() }
      )
      .eq("id", found.id);
    if (error) throw error;
    await logEvent({
      category: "form",
      event: subscribed ? "subscriber.resubscribed" : "subscriber.unsubscribed",
      status: "info",
      summary: subscribed
        ? `${found.email} re-subscribed from their unsubscribe page`
        : `${found.email} unsubscribed from The Build Letter (${via})`,
      ref: found.email,
    });
  }
  return { email: found.email, status: target };
}
