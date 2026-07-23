import { createClient } from "@/lib/supabase/server";
import { OrdersManager } from "@/components/admin/OrdersManager";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    orders = (data as Order[]) || [];
  } catch {
    orders = [];
  }

  return (
    <>
      <h1>Orders</h1>
      <p className="mt-2 text-sm text-muted">
        Paid orders land here from Stripe. Update fulfilment, add tracking, and
        export a date range for your accountant.
      </p>
      <div className="mt-6">
        <OrdersManager initial={orders} />
      </div>
    </>
  );
}
