"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Venture } from "@/lib/types";

export function VenturesManager({ initial }: { initial: Venture[] }) {
  const [rows, setRows] = useState<Venture[]>(initial);

  function update(id: string, patch: Partial<Venture>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(v: Venture) {
    const supabase = createClient();
    await supabase
      .from("ventures")
      .update({
        name: v.name,
        summary: v.summary,
        status: v.status,
        link: v.link,
        published: v.published,
        sort_order: v.sort_order,
      })
      .eq("id", v.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("ventures")
      .insert({ name: "New venture", sort_order: rows.length + 1 })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, data as Venture]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("ventures").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <button onClick={add} className="btn btn-primary text-sm">Add a venture</button>
      <div className="mt-6 space-y-4">
        {rows.map((v) => (
          <div key={v.id} className="rounded-card border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label mb-1 block">Name</label>
                <input value={v.name} onChange={(e) => update(v.id, { name: e.target.value })} onBlur={() => persist(v)} className="field" />
              </div>
              <div>
                <label className="label mb-1 block">Status</label>
                <input value={v.status} onChange={(e) => update(v.id, { status: e.target.value })} onBlur={() => persist(v)} className="field" placeholder="coming_soon" />
              </div>
            </div>
            <div className="mt-3">
              <label className="label mb-1 block">Summary</label>
              <textarea value={v.summary} onChange={(e) => update(v.id, { summary: e.target.value })} onBlur={() => persist(v)} rows={2} className="field resize-y" />
            </div>
            <div className="mt-3">
              <label className="label mb-1 block">Link (optional)</label>
              <input value={v.link || ""} onChange={(e) => update(v.id, { link: e.target.value })} onBlur={() => persist(v)} className="field" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.published}
                  onChange={(e) => {
                    update(v.id, { published: e.target.checked });
                    persist({ ...v, published: e.target.checked });
                  }}
                  className="h-4 w-4 accent-clay"
                />
                Published
              </label>
              <button onClick={() => remove(v.id)} className="text-sm text-clay underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
