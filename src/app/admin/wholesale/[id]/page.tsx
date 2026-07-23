import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WholesaleEditor } from "@/components/admin/WholesaleEditor";
import type { WholesaleProduct } from "@/lib/types";

export default async function WholesaleEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("wholesale_products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  return (
    <>
      <Link
        href="/admin/wholesale"
        className="text-sm text-muted no-underline hover:text-clay"
      >
        ← All bundles
      </Link>
      <WholesaleEditor product={data as WholesaleProduct} />
    </>
  );
}
