import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/format";
import { AddWholesaleButton } from "@/components/admin/AddWholesaleButton";
import type { WholesaleProduct } from "@/lib/types";

export default async function AdminWholesalePage() {
  let products: WholesaleProduct[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("wholesale_products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    products = (data as WholesaleProduct[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1>Wholesale</h1>
        <AddWholesaleButton />
      </div>
      <p className="mt-2 text-sm text-muted">
        Low stock (under 5) is flagged. Archive instead of deleting so old
        orders keep their product reference.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-peach p-6 text-sm text-muted">
          No bundles yet. Use “Add a bundle” to create your first one.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-bold">{p.name}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatGBP(p.price_gbp)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className={p.stock < 5 ? "font-bold text-clay" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="pill bg-peach text-ink text-xs">
                      {p.archived ? "Archived" : "Live"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/wholesale/${p.id}`}
                      className="text-clay no-underline"
                    >
                      Edit →
                    </Link>
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
