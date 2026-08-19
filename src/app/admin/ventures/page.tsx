import { createClient } from "@/lib/supabase/server";
import { VenturesManager } from "@/components/admin/VenturesManager";
import type { Venture } from "@/lib/types";

export default async function AdminVenturesPage() {
  let ventures: Venture[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ventures")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    ventures = (data as Venture[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Future ventures</h1>
      <p className="mt-2 text-sm text-muted">
        New businesses and projects shown on the Ecosystem page. Keep drafts
        unpublished — don&rsquo;t reveal confidential concepts too early.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <VenturesManager initial={ventures} />
      </div>
    </>
  );
}
