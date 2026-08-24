import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/format";
import { AddProductButton } from "@/components/admin/AddProductButton";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    products = (data as Product[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1>Products</h1>
        <AddProductButton />
      </div>
      <p className="mt-2 text-sm text-muted">
        Edit any product below. Changes autosave. Set status to Live to show it
        on the site.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. Run the migrations and add your
          Supabase keys (see docs/DEPLOYMENT.md), then refresh.
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-peach p-6 text-sm text-muted">
          No products yet. Use “Add a product” to create your first one, or run
          the seed migration for starter content.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Format</th>
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
                  <td className="px-4 py-3 text-muted">
                    {p.format === "live_cohort" ? "Live cohort" : "Self-paced"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="pill bg-peach text-ink text-xs capitalize">
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
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
