import { createClient } from "@/lib/supabase/server";
import { ImpactManager } from "@/components/admin/ImpactManager";
import type { ImpactStat } from "@/lib/types";

export default async function AdminImpactPage() {
  let stats: ImpactStat[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("impact_stats")
      .select("*")
      .order("sort_order", { ascending: true });
    stats = (data as ImpactStat[]) || [];
  } catch {
    /* db not ready */
  }

  return (
    <>
      <h1>Impact statistics</h1>
      <p className="mt-2 text-sm text-muted">
        The figures shown on the Impact page and authority strips. Keep to the
        brief&rsquo;s wording — &ldquo;over 500 directly supported&rdquo;,
        &ldquo;impact approaching 1,000&rdquo;.
      </p>
      <div className="mt-6">
        <ImpactManager initial={stats} />
      </div>
    </>
  );
}
