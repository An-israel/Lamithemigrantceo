import { createClient } from "@/lib/supabase/server";
import { RangePicker } from "@/components/admin/RangePicker";
import type { Order } from "@/lib/types";

interface PageView {
  created_at: string;
  path: string;
  referrer: string | null;
  country: string | null;
  device_type: string | null;
  session_hash: string | null;
}

const RANGES: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: 3650,
};

function countBy<T>(rows: T[], key: (r: T) => string | null) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function BarList({ rows, total }: { rows: [string, number][]; total: number }) {
  if (rows.length === 0) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map(([label, n]) => (
        <li key={label}>
          <div className="flex justify-between text-sm">
            <span className="truncate">{label}</span>
            <span className="tabular-nums text-muted">{n}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-pill bg-line">
            <div
              className="h-full bg-clay"
              style={{ width: `${total ? (n / total) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const range = searchParams.range && RANGES[searchParams.range] ? searchParams.range : "30d";
  const days = RANGES[range];
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const prevSince = new Date(Date.now() - days * 2 * 864e5).toISOString();

  let views: PageView[] = [];
  let prevViews: PageView[] = [];
  let enquiryCount = 0;
  let orders: Order[] = [];
  let dbReady = true;

  try {
    const supabase = createClient();
    const [{ data: v, error }, { data: pv }, { count: ec }, { data: od }] =
      await Promise.all([
        supabase.from("page_views").select("*").gte("created_at", since),
        supabase
          .from("page_views")
          .select("*")
          .gte("created_at", prevSince)
          .lt("created_at", since),
        supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since),
        supabase.from("orders").select("*").eq("status", "paid").gte("created_at", since),
      ]);
    if (error) dbReady = false;
    views = (v as PageView[]) || [];
    prevViews = (pv as PageView[]) || [];
    enquiryCount = ec || 0;
    orders = (od as Order[]) || [];
  } catch {
    dbReady = false;
  }

  const visitors = new Set(views.map((v) => v.session_hash).filter(Boolean)).size;
  const prevVisitors = new Set(prevViews.map((v) => v.session_hash).filter(Boolean)).size;
  const pageViews = views.length;
  const prevPageViews = prevViews.length;

  const visitorDelta = prevVisitors ? Math.round(((visitors - prevVisitors) / prevVisitors) * 100) : null;
  const viewDelta = prevPageViews ? Math.round(((pageViews - prevPageViews) / prevPageViews) * 100) : null;

  const topPages = countBy(views, (v) => v.path).slice(0, 8);
  const sources = countBy(views, (v) => v.referrer || "Direct");
  const devices = countBy(views, (v) => v.device_type);
  const countries = countBy(views, (v) => v.country).slice(0, 10);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Analytics</h1>
        <RangePicker current={range} />
      </div>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Stat label="Visitors" value={visitors} delta={visitorDelta} />
        <Stat label="Page views" value={pageViews} delta={viewDelta} />
      </div>

      {/* Sources — highest priority, TikTok first */}
      <section className="mt-10">
        <h3>Where visitors came from</h3>
        <div className="mt-4 rounded-card border border-line p-5">
          <BarList rows={sources} total={pageViews} />
        </div>
      </section>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h3>Top pages</h3>
          <div className="mt-4 rounded-card border border-line p-5">
            <BarList rows={topPages} total={pageViews} />
          </div>
        </section>
        <section>
          <h3>Devices</h3>
          <div className="mt-4 rounded-card border border-line p-5">
            <BarList rows={devices} total={pageViews} />
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h3>Countries</h3>
        <div className="mt-4 rounded-card border border-line p-5">
          <BarList rows={countries} total={pageViews} />
        </div>
      </section>

      {/* Conversion funnel */}
      <section className="mt-10">
        <h3>Conversion</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Funnel label="Visitors" value={visitors} />
          <Funnel
            label="Enquiries"
            value={enquiryCount}
            pct={visitors ? (enquiryCount / visitors) * 100 : 0}
          />
          <Funnel
            label="Orders"
            value={orders.length}
            pct={visitors ? (orders.length / visitors) * 100 : 0}
          />
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">
        Figures exclude visitors using ad blockers.
      </p>
    </>
  );
}

function Stat({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta: number | null;
}) {
  return (
    <div className="rounded-card border border-line p-5">
      <p className="label">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums">{value}</p>
      {delta !== null && (
        <p className={`mt-1 text-sm ${delta >= 0 ? "text-jade" : "text-clay"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs previous period
        </p>
      )}
    </div>
  );
}

function Funnel({ label, value, pct }: { label: string; value: number; pct?: number }) {
  return (
    <div className="rounded-card border border-line p-4 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="label mt-1">{label}</p>
      {pct !== undefined && (
        <p className="mt-1 text-xs text-muted">{pct.toFixed(1)}%</p>
      )}
    </div>
  );
}
