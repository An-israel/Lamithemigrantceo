import { createClient } from "@/lib/supabase/server";
import { GalleryManager } from "@/components/admin/GalleryManager";
import type { GalleryImage } from "@/lib/types";

export default async function AdminGalleryPage() {
  let images: GalleryImage[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    images = (data as GalleryImage[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Gallery</h1>
      <p className="mt-2 text-sm text-muted">
        Upload photos and categorise them (event, warehouse, behind the
        scenes...). They show on the public <code>/gallery</code> page,
        newest first within each category.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. Run the migrations (see
          docs/DEPLOYMENT.md), then refresh.
        </div>
      )}

      <div className="mt-6">
        <GalleryManager initial={images} />
      </div>
    </>
  );
}
