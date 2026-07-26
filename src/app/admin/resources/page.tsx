import { createClient } from "@/lib/supabase/server";
import { ResourcesManager } from "@/components/admin/ResourcesManager";
import type { Resource } from "@/lib/types";

export default async function AdminResourcesPage() {
  let resources: Resource[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("sort_order", { ascending: true });
    resources = (data as Resource[]) || [];
  } catch {
    /* db not ready */
  }

  return (
    <>
      <h1>Resources</h1>
      <p className="mt-2 text-sm text-muted">
        Free guides and lead magnets shown on the Resources page. Upload a file
        or leave it email-gated.
      </p>
      <div className="mt-6">
        <ResourcesManager initial={resources} />
      </div>
    </>
  );
}
