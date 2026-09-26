import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/data";
import { configurationChecks, type HealthLevel } from "@/lib/serviceHealth";
import {
  CATEGORIES,
  STATUSES,
  filteredQuery,
  formatLogTime,
  parseFilters,
  type ServiceLogFilters,
  type ServiceLogRow,
} from "@/lib/serviceLogQuery";
import { ServiceLogClearButton } from "@/components/admin/ServiceLogClearButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const STATUS_PILL: Record<string, string> = {
  success: "bg-jade text-shell",
  failed: "bg-[#9b2c1f] text-shell",
  skipped: "bg-gold/25 text-ink",
  info: "bg-peach-deep text-ink",
};

const HEALTH_DOT: Record<HealthLevel, string> = {
  ok: "bg-jade",
  warn: "bg-gold",
  missing: "bg-[#9b2c1f]",
};

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

function hrefWith(f: ServiceLogFilters, patch: Partial<ServiceLogFilters>) {
  const next = { ...f, ...patch };
  const p = new URLSearchParams();
  if (next.category) p.set("category", next.category);
  if (next.status) p.set("status", next.status);
  if (next.q) p.set("q", next.q);
  if (next.page > 1) p.set("page", String(next.page));
  const s = p.toString();
  return `/admin/service-log${s ? `?${s}` : ""}`;
}

function Tile({ label, value, hint, alert }: { label: string; value: string; hint?: string; alert?: boolean }) {
  return (
    <div className={`rounded-card border p-4 ${alert ? "border-[#9b2c1f] bg-[#9b2c1f]/5" : "border-line bg-shell"}`}>
      <p className="label">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function ServiceLogPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFilters(searchParams);
  const checks = configurationChecks();
  const supabase = createClient();

  let rows: ServiceLogRow[] = [];
  let total = 0;
  let recent: Pick<ServiceLogRow, "category" | "status" | "event" | "detail">[] = [];
  let tableReady = true;

  try {
    const from = (filters.page - 1) * PAGE_SIZE;
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const [list, week] = await Promise.all([
      filteredQuery(supabase, filters).range(from, from + PAGE_SIZE - 1),
      supabase
        .from("service_log")
        .select("category, status, event, detail")
        .gte("created_at", weekAgo)
        .limit(5000),
    ]);
    if (list.error) tableReady = false;
    rows = (list.data as ServiceLogRow[]) || [];
    total = list.count || 0;
    recent = (week.data as typeof recent) || [];
  } catch {
    tableReady = false;
  }

  const count = (pred: (r: (typeof recent)[number]) => boolean) => recent.filter(pred).length;
  const payments = recent.filter((r) => r.event === "payment.received");
  const revenue = payments.reduce((sum, r) => sum + (Number(r.detail?.amount_gbp) || 0), 0);
  const emailsSent = count((r) => r.category === "email" && r.status === "success");
  const emailsFailed = count((r) => r.category === "email" && r.status === "failed");
  const emailsSkipped = count((r) => r.category === "email" && r.status === "skipped");
  const abandoned = count((r) => r.event === "checkout.abandoned");
  const started = count((r) => r.event === "checkout.started");
  const forms = count((r) => r.category === "form" && r.status === "success");
  const problems = count((r) => r.status === "failed");

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtering = !!(filters.category || filters.status || filters.q);
  const exportParams = new URLSearchParams();
  if (filters.category) exportParams.set("category", filters.category);
  if (filters.status) exportParams.set("status", filters.status);
  if (filters.q) exportParams.set("q", filters.q);

  return (
    <>
      <h1>Service log</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Everything the site does on its own: payments from Stripe, checkouts
        started and abandoned, every email sent (or not, and why), form
        submissions, order updates and errors. Use it to answer &ldquo;did
        they get their email?&rdquo; or &ldquo;did that payment go
        through?&rdquo; without opening Stripe or Vercel. Times are UK time.
      </p>

      {!tableReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The service log table doesn&rsquo;t exist yet. Run{" "}
          <code>supabase/migrations/0019_service_log.sql</code> in the Supabase SQL
          editor, then reload this page. Nothing is recorded until then.
        </div>
      )}

      {/* Configuration health */}
      <section className="mt-8">
        <h3>Setup health</h3>
        <ul className="mt-3 divide-y divide-line rounded-card border border-line">
          {checks.map((c) => (
            <li key={c.name} className="flex gap-3 p-3 text-sm">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${HEALTH_DOT[c.level]}`} aria-hidden />
              <span>
                <span className="font-bold">{c.name}</span>
                <span className="sr-only"> ({c.level})</span>
                <span className="block text-muted">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Last 7 days */}
      <section className="mt-8">
        <h3>Last 7 days</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Payments" value={String(payments.length)} hint={formatGBP(revenue)} />
          <Tile
            label="Checkouts"
            value={String(started)}
            hint={`${abandoned} abandoned`}
          />
          <Tile
            label="Emails sent"
            value={String(emailsSent)}
            hint={`${emailsFailed} failed · ${emailsSkipped} skipped`}
            alert={emailsFailed > 0}
          />
          <Tile label="Form submissions" value={String(forms)} />
        </div>
        {problems > 0 && (
          <p className="mt-3 text-sm">
            <Link href={hrefWith(filters, { status: "failed", category: "", q: "", page: 1 })} className="font-bold text-[#9b2c1f]">
              {problems} problem{problems === 1 ? "" : "s"} this week — show them →
            </Link>
          </p>
        )}
      </section>

      {/* Filters */}
      <section className="mt-10">
        <h3>Activity</h3>
        <form method="get" className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select name="category" defaultValue={filters.category} className="field sm:w-48" aria-label="Category">
            <option value="">All activity</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status} className="field sm:w-40" aria-label="Status">
            <option value="">Any status</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Search email, name, item, Stripe ID…"
            className="field flex-1"
            aria-label="Search"
          />
          <button type="submit" className="btn btn-primary text-sm">
            Filter
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-muted">
            {total} entr{total === 1 ? "y" : "ies"}
            {filtering ? " match" : ""}
          </span>
          {filtering && (
            <Link href="/admin/service-log" className="underline">
              Clear filters
            </Link>
          )}
          <a href={`/admin/service-log/export${exportParams.toString() ? `?${exportParams}` : ""}`} className="underline">
            Download CSV
          </a>
          <span className="ml-auto">
            <ServiceLogClearButton />
          </span>
        </div>

        <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-shell">
          {rows.length === 0 && (
            <li className="p-4 text-sm text-muted">
              {filtering ? "Nothing matches these filters." : "Nothing recorded yet. Activity appears here as soon as someone pays, submits a form or an email goes out."}
            </li>
          )}
          {rows.map((r) => (
            <li key={r.id} className="p-3 text-sm">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-start gap-x-3 gap-y-1">
                  <span className={`pill shrink-0 text-xs ${STATUS_PILL[r.status] ?? STATUS_PILL.info}`}>
                    {r.status}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-ink">{r.summary}</span>
                    <span className="block text-xs text-muted">
                      {formatLogTime(r.created_at)} · {CATEGORY_LABEL[r.category] ?? r.category}
                    </span>
                  </span>
                </summary>
                <dl className="mt-3 grid gap-x-4 gap-y-1 rounded-input bg-peach/50 p-3 text-xs sm:grid-cols-[8rem_1fr]">
                  <dt className="font-bold">Event</dt>
                  <dd className="break-all font-mono">{r.event}</dd>
                  {r.ref && (
                    <>
                      <dt className="font-bold">Reference</dt>
                      <dd className="break-all font-mono">{r.ref}</dd>
                    </>
                  )}
                  {r.detail &&
                    Object.entries(r.detail).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="font-bold">{k.replace(/_/g, " ")}</dt>
                        <dd className="break-all font-mono">
                          {v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </dd>
                      </div>
                    ))}
                  <dt className="font-bold">Log ID</dt>
                  <dd className="break-all font-mono text-muted">{r.id}</dd>
                </dl>
              </details>
            </li>
          ))}
        </ul>

        {pages > 1 && (
          <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
            {filters.page > 1 ? (
              <Link href={hrefWith(filters, { page: filters.page - 1 })} className="underline">
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted">
              Page {filters.page} of {pages}
            </span>
            {filters.page < pages ? (
              <Link href={hrefWith(filters, { page: filters.page + 1 })} className="underline">
                Older →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <p className="mt-6 text-xs text-muted">
          Not recorded here: sign-in links (sent by Supabase itself — see
          Supabase → Authentication → Logs) and anything done directly in the
          Stripe or Resend dashboards.
        </p>
      </section>
    </>
  );
}
