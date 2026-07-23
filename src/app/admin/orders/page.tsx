import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/data";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    orders = (data as Order[]) || [];
  } catch {
    orders = [];
  }

  return (
    <>
      <h1>Orders</h1>
      <p className="mt-2 text-sm text-muted">
        Paid orders land here from Stripe. Fulfilment tracking and CSV export
        ship in Release 2.
      </p>

      <div className="mt-6 overflow-hidden rounded-card border border-line">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    {new Date(o.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 font-bold">{o.name || o.email}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatGBP(o.amount_gbp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="pill bg-peach text-ink text-xs capitalize">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
