import { createClient } from "@/lib/supabase/server";
import { LinksManager } from "@/components/admin/LinksManager";
import type { BioLink } from "@/lib/types";

export default async function AdminLinksPage() {
  let links: BioLink[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bio_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    links = (data as BioLink[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Links (bio page)</h1>
      <p className="mt-2 text-sm text-muted">
        These appear on your <code>/start</code> link-in-bio page. Clicks are
        tracked. This replaces Beacons as your permanent social-bio landing page.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <LinksManager initial={links} />
      </div>
    </>
  );
}
