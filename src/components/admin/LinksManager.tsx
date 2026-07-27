"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BioLink } from "@/lib/types";

export function LinksManager({ initial }: { initial: BioLink[] }) {
  const [rows, setRows] = useState<BioLink[]>(initial);

  function update(id: string, patch: Partial<BioLink>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(link: BioLink) {
    const supabase = createClient();
    await supabase
      .from("bio_links")
      .update({
        label: link.label,
        url: link.url,
        description: link.description,
        active: link.active,
        sort_order: link.sort_order,
      })
      .eq("id", link.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("bio_links")
      .insert({ label: "New link", url: "https://", sort_order: rows.length + 1 })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, data as BioLink]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("bio_links").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <button onClick={add} className="btn btn-primary text-sm">
        Add a link
      </button>

      <div className="mt-6 space-y-4">
        {rows.map((link) => (
          <div key={link.id} className="rounded-card border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label mb-1 block">Label</label>
                <input
                  value={link.label}
                  onChange={(e) => update(link.id, { label: e.target.value })}
                  onBlur={() => persist(link)}
                  className="field"
                />
              </div>
              <div>
                <label className="label mb-1 block">URL</label>
                <input
                  value={link.url}
                  onChange={(e) => update(link.id, { url: e.target.value })}
                  onBlur={() => persist(link)}
                  className="field"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="label mb-1 block">Description (optional)</label>
              <input
                value={link.description || ""}
                onChange={(e) => update(link.id, { description: e.target.value })}
                onBlur={() => persist(link)}
                className="field"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.active}
                  onChange={(e) => {
                    update(link.id, { active: e.target.checked });
                    persist({ ...link, active: e.target.checked });
                  }}
                  className="h-4 w-4 accent-clay"
                />
                Active
              </label>
              <span className="text-sm text-muted">{link.clicks} clicks</span>
              <button onClick={() => remove(link.id)} className="text-sm text-clay underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
