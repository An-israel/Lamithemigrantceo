import { createClient } from "@/lib/supabase/server";
import { OrdersManager } from "@/components/admin/OrdersManager";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) dbReady = false;
    orders = (data as Order[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Orders</h1>
      <p className="mt-2 text-sm text-muted">
        Paid orders land here from Stripe. Update fulfilment, add tracking, and
        export a date range for your accountant.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <OrdersManager initial={orders} />
      </div>
    </>
  );
}
