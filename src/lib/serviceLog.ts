import { createServiceClient } from "@/lib/supabase/server";

export type LogCategory = "email" | "payment" | "checkout" | "form" | "order" | "system";
export type LogStatus = "success" | "failed" | "skipped" | "info";

export type LogEntry = {
  category: LogCategory;
  event: string;
  status?: LogStatus;
  summary: string;
  /** Searchable reference: an email address, Stripe session id, order id… */
  ref?: string | null;
  detail?: Record<string, unknown> | null;
};

/**
 * Appends one row to public.service_log (see /admin/service-log). Never
 * throws: logging must not be able to break the payment, email or form
 * submission it is describing. Server-only (uses the service-role key).
 */
export async function logEvent(entry: LogEntry): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("service_log").insert({
      category: entry.category,
      event: entry.event,
      status: entry.status ?? "info",
      summary: entry.summary.slice(0, 500),
      ref: entry.ref ?? null,
      detail: entry.detail ?? null,
    });
    if (error) console.error("service_log insert failed", error.message);
  } catch (e) {
    console.error("service_log insert errored", e);
  }
}

export function errorText(e: unknown): string {
  if (e instanceof Error) return e.message.slice(0, 500);
  if (typeof e === "string") return e.slice(0, 500);
  try {
    return JSON.stringify(e).slice(0, 500);
  } catch {
    return "Unknown error";
  }
}
