"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { GalleryImage } from "@/lib/types";

const CATEGORIES = ["Event", "Warehouse", "Behind the scenes", "Community", "Brand"];

export function GalleryManager({ initial }: { initial: GalleryImage[] }) {
  const [rows, setRows] = useState<GalleryImage[]>(initial);

  function update(id: string, patch: Partial<GalleryImage>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(img: GalleryImage) {
    const supabase = createClient();
    await supabase
      .from("gallery_images")
      .update({
        image_url: img.image_url,
        caption: img.caption,
        category: img.category,
        taken_on: img.taken_on,
        sort_order: img.sort_order,
      })
      .eq("id", img.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("gallery_images")
      .insert({ image_url: "", category: "Event", sort_order: rows.length + 1 })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, data as GalleryImage]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("gallery_images").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <button onClick={add} className="btn btn-primary text-sm">
        Add a photo
      </button>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((img) => (
          <div key={img.id} className="rounded-card border border-line p-4">
            <ImageUploader
              value={img.image_url || null}
              onChange={(url) => {
                update(img.id, { image_url: url });
                persist({ ...img, image_url: url });
              }}
              folder="gallery"
              aspect="aspect-square"
            />
            <div className="mt-3">
              <label className="label mb-1 block">Caption (optional)</label>
              <input
                value={img.caption || ""}
                onChange={(e) => update(img.id, { caption: e.target.value })}
                onBlur={() => persist(img)}
                className="field"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="label mb-1 block">Category</label>
                <select
                  value={img.category}
                  onChange={(e) => {
                    update(img.id, { category: e.target.value });
                    persist({ ...img, category: e.target.value });
                  }}
                  className="field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label mb-1 block">Date</label>
                <input
                  type="date"
                  value={img.taken_on || ""}
                  onChange={(e) => update(img.id, { taken_on: e.target.value || null })}
                  onBlur={() => persist(img)}
                  className="field"
                />
              </div>
            </div>
            <button
              onClick={() => remove(img.id)}
              className="mt-3 text-sm text-clay underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
