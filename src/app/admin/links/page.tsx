import { createClient } from "@/lib/supabase/server";
import { LinksManager } from "@/components/admin/LinksManager";
import type { BioLink } from "@/lib/types";

export default async function AdminLinksPage() {
  let links: BioLink[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("bio_links")
      .select("*")
      .order("sort_order", { ascending: true });
    links = (data as BioLink[]) || [];
  } catch {
    /* db not ready */
  }

  return (
    <>
      <h1>Links (bio page)</h1>
      <p className="mt-2 text-sm text-muted">
        These appear on your <code>/start</code> link-in-bio page. Clicks are
        tracked. This replaces Beacons as your permanent social-bio landing page.
      </p>
      <div className="mt-6">
        <LinksManager initial={links} />
      </div>
    </>
  );
}
