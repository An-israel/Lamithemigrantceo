import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/data";
import type { Enquiry, Order } from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-shell p-5">
      <p className="label">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  let newEnquiries = 0;
  let ordersThisMonth: Order[] = [];
  let recentEnquiries: Enquiry[] = [];
  let recentOrders: Order[] = [];

  try {
    const [{ count: enqCount }, { data: monthOrders }, { data: enq }, { data: ord }] =
      await Promise.all([
        supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .eq("status", "new")
          .gte("created_at", weekAgo),
        supabase
          .from("orders")
          .select("*")
          .eq("status", "paid")
          .gte("created_at", monthStart),
        supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
    newEnquiries = enqCount || 0;
    ordersThisMonth = (monthOrders as Order[]) || [];
    recentEnquiries = (enq as Enquiry[]) || [];
    recentOrders = (ord as Order[]) || [];
  } catch {
    // Tables not ready — show zeros.
  }

  const revenue = ordersThisMonth.reduce((sum, o) => sum + (o.amount_gbp || 0), 0);

  return (
    <>
      <h1>Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="New enquiries this week" value={String(newEnquiries)} />
        <StatCard label="Orders this month" value={String(ordersThisMonth.length)} />
        <StatCard label="Revenue this month" value={formatGBP(revenue)} />
        <StatCard label="Active students" value="—" />
        <StatCard label="Visitors this week" value="—" />
        <StatCard label="Top page" value="Home" />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h3>Recent enquiries</h3>
          <ul className="mt-4 divide-y divide-line rounded-card border border-line">
            {recentEnquiries.length === 0 && (
              <li className="p-4 text-sm text-muted">No enquiries yet.</li>
            )}
            {recentEnquiries.map((e) => (
              <li key={e.id}>
                <Link
                  href="/admin/enquiries"
                  className="flex items-center justify-between p-4 text-sm no-underline text-ink hover:bg-peach/40"
                >
                  <span>
                    <span className="font-bold">{e.name}</span> · {e.topic}
                  </span>
                  <span className="text-muted">
                    {new Date(e.created_at).toLocaleDateString("en-GB")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Recent orders</h3>
          <ul className="mt-4 divide-y divide-line rounded-card border border-line">
            {recentOrders.length === 0 && (
              <li className="p-4 text-sm text-muted">No orders yet.</li>
            )}
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-4 text-sm no-underline text-ink hover:bg-peach/40"
                >
                  <span className="font-bold">{o.name || o.email}</span>
                  <span className="tabular-nums">{formatGBP(o.amount_gbp)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
