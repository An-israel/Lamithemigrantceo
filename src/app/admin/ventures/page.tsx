import { createClient } from "@/lib/supabase/server";
import { VenturesManager } from "@/components/admin/VenturesManager";
import type { Venture } from "@/lib/types";

export default async function AdminVenturesPage() {
  let ventures: Venture[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("ventures")
      .select("*")
      .order("sort_order", { ascending: true });
    ventures = (data as Venture[]) || [];
  } catch {
    /* db not ready */
  }

  return (
    <>
      <h1>Future ventures</h1>
      <p className="mt-2 text-sm text-muted">
        New businesses and projects shown on the Ecosystem page. Keep drafts
        unpublished — don&rsquo;t reveal confidential concepts too early.
      </p>
      <div className="mt-6">
        <VenturesManager initial={ventures} />
      </div>
    </>
  );
}
