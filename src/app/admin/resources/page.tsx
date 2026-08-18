import { createClient } from "@/lib/supabase/server";
import { ResourcesManager } from "@/components/admin/ResourcesManager";
import type { Resource } from "@/lib/types";

export default async function AdminResourcesPage() {
  let resources: Resource[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    resources = (data as Resource[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Resources</h1>
      <p className="mt-2 text-sm text-muted">
        Free guides and lead magnets shown on the Resources page. Upload a file
        or leave it email-gated.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <ResourcesManager initial={resources} />
      </div>
    </>
  );
}
