import type { SupabaseClient } from "@supabase/supabase-js";
import type { LogCategory, LogStatus } from "@/lib/serviceLog";

export type ServiceLogRow = {
  id: string;
  created_at: string;
  category: LogCategory;
  event: string;
  status: LogStatus;
  summary: string;
  ref: string | null;
  detail: Record<string, unknown> | null;
};

export const CATEGORIES: { value: LogCategory; label: string }[] = [
  { value: "payment", label: "Payments" },
  { value: "checkout", label: "Checkouts" },
  { value: "email", label: "Emails" },
  { value: "form", label: "Forms & sign-ups" },
  { value: "order", label: "Orders & fulfilment" },
  { value: "system", label: "System" },
];

export const STATUSES: { value: LogStatus; label: string }[] = [
  { value: "failed", label: "Failed" },
  { value: "skipped", label: "Skipped" },
  { value: "success", label: "Success" },
  { value: "info", label: "Info" },
];

export type ServiceLogFilters = {
  category: LogCategory | "";
  status: LogStatus | "";
  q: string;
  page: number;
};

export function parseFilters(params: Record<string, string | string[] | undefined>): ServiceLogFilters {
  const one = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const category = one("category");
  const status = one("status");
  const page = parseInt(one("page"), 10);
  return {
    category: CATEGORIES.some((c) => c.value === category) ? (category as LogCategory) : "",
    status: STATUSES.some((s) => s.value === status) ? (status as LogStatus) : "",
    // Commas/parens would break the PostgREST or() filter syntax below.
    q: one("q").replace(/[,()*%"\\]/g, " ").trim().slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Builds the filtered, newest-first query. Caller adds .range()/.limit(). */
export function filteredQuery(supabase: SupabaseClient, f: ServiceLogFilters) {
  let query = supabase
    .from("service_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  if (f.category) query = query.eq("category", f.category);
  if (f.status) query = query.eq("status", f.status);
  if (f.q) {
    const v = `"*${f.q}*"`;
    query = query.or(`summary.ilike.${v},ref.ilike.${v},event.ilike.${v}`);
  }
  return query;
}

export function formatLogTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
