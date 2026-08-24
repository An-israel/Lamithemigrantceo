import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/format";
import type { Order, Product } from "@/lib/types";

interface StudentRow {
  email: string;
  name: string | null;
  products: string[];
  totalSpend: number;
  lastOrder: string;
}

export default async function AdminStudentsPage() {
  let students: StudentRow[] = [];
  let dbReady = true;

  try {
    const supabase = createClient();
    const [{ data: orderRows, error }, { data: productRows }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("status", "paid")
        .in("item_type", ["product", "program"])
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name"),
    ]);
    if (error) dbReady = false;

    const orders = (orderRows as Order[]) || [];
    const products = (productRows as Pick<Product, "id" | "name">[]) || [];
    const productName = (id: string | null) =>
      products.find((p) => p.id === id)?.name || "Product";

    const byEmail = new Map<string, StudentRow>();
    for (const o of orders) {
      const row = byEmail.get(o.email) || {
        email: o.email,
        name: o.name,
        products: [],
        totalSpend: 0,
        lastOrder: o.created_at,
      };
      const pName = productName(o.item_id);
      if (!row.products.includes(pName)) row.products.push(pName);
      row.totalSpend += o.amount_gbp || 0;
      row.name = row.name || o.name;
      if (o.created_at > row.lastOrder) row.lastOrder = o.created_at;
      byEmail.set(o.email, row);
    }
    students = [...byEmail.values()].sort((a, b) =>
      a.lastOrder < b.lastOrder ? 1 : -1
    );
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Students</h1>
      <p className="mt-2 text-sm text-muted">
        Everyone with at least one paid product, built from order history:
        the same records that grant access at <code>/my</code>.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      {students.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-peach p-6 text-sm text-muted">
          No paid product orders yet.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((s) => (
                <tr key={s.email}>
                  <td className="px-4 py-3">
                    <span className="block font-bold">{s.name || s.email}</span>
                    <a href={`mailto:${s.email}`} className="text-xs text-muted underline">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">{s.products.join(", ")}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGBP(s.totalSpend)}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(s.lastOrder).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
