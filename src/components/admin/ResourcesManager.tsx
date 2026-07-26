"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Resource } from "@/lib/types";

export function ResourcesManager({ initial }: { initial: Resource[] }) {
  const [rows, setRows] = useState<Resource[]>(initial);

  function update(id: string, patch: Partial<Resource>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(r: Resource) {
    const supabase = createClient();
    await supabase
      .from("resources")
      .update({
        title: r.title,
        description: r.description,
        file_url: r.file_url,
        active: r.active,
        sort_order: r.sort_order,
      })
      .eq("id", r.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("resources")
      .insert({ title: "New resource", sort_order: rows.length + 1 })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, data as Resource]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("resources").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <button onClick={add} className="btn btn-primary text-sm">
        Add a resource
      </button>
      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-card border border-line p-4">
            <div>
              <label className="label mb-1 block">Title</label>
              <input
                value={r.title}
                onChange={(e) => update(r.id, { title: e.target.value })}
                onBlur={() => persist(r)}
                className="field"
              />
            </div>
            <div className="mt-3">
              <label className="label mb-1 block">Description</label>
              <textarea
                value={r.description}
                onChange={(e) => update(r.id, { description: e.target.value })}
                onBlur={() => persist(r)}
                rows={2}
                className="field resize-y"
              />
            </div>
            <div className="mt-3">
              <label className="label mb-1 block">File (PDF/image)</label>
              {r.file_url ? (
                <div className="flex items-center gap-3 text-sm">
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="underline">
                    View file
                  </a>
                  <button
                    onClick={() => {
                      update(r.id, { file_url: null });
                      persist({ ...r, file_url: null });
                    }}
                    className="text-clay underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <ImageUploader
                  value={null}
                  onChange={(url) => {
                    update(r.id, { file_url: url });
                    persist({ ...r, file_url: url });
                  }}
                  folder="resources"
                  aspect="aspect-[4/3]"
                />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={r.active}
                  onChange={(e) => {
                    update(r.id, { active: e.target.checked });
                    persist({ ...r, active: e.target.checked });
                  }}
                  className="h-4 w-4 accent-clay"
                />
                Active
              </label>
              <button onClick={() => remove(r.id)} className="text-sm text-clay underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
