import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { ProductModulesManager } from "@/components/admin/ProductModulesManager";
import type { Product, ProductModule } from "@/lib/types";

export default async function ProductEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data }, { data: moduleRows }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).single(),
    supabase
      .from("product_modules")
      .select("*")
      .eq("product_id", params.id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!data) notFound();

  return (
    <>
      <Link
        href="/admin/products"
        className="text-sm text-muted no-underline hover:text-clay"
      >
        ← All products
      </Link>
      <ProductEditor product={data as Product} />
      <div className="mt-4 max-w-2xl border-t border-line pt-8 pb-16">
        <ProductModulesManager
          productId={params.id}
          initial={(moduleRows as ProductModule[]) || []}
        />
      </div>
    </>
  );
}
