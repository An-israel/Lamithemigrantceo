import { createClient } from "@/lib/supabase/server";
import { LinksManager } from "@/components/admin/LinksManager";
import type { BioLink, Product, Resource } from "@/lib/types";

export default async function AdminLinksPage() {
  let links: BioLink[] = [];
  let products: Product[] = [];
  let resources: Resource[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const [linksRes, productsRes, resourcesRes] = await Promise.all([
      supabase
        .from("bio_links")
        .select("*, product:products(*), resource:resources(*)")
        .order("sort_order", { ascending: true }),
      supabase.from("products").select("*").order("sort_order", { ascending: true }),
      supabase.from("resources").select("*").order("sort_order", { ascending: true }),
    ]);
    if (linksRes.error) dbReady = false;
    links = (linksRes.data as unknown as BioLink[]) || [];
    products = (productsRes.data as Product[]) || [];
    resources = (resourcesRes.data as Resource[]) || [];
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
        <LinksManager initial={links} products={products} resources={resources} />
      </div>
    </>
  );
}
