"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ImpactStat } from "@/lib/types";

export function ImpactManager({ initial }: { initial: ImpactStat[] }) {
  const [rows, setRows] = useState<ImpactStat[]>(initial);

  function update(id: string, patch: Partial<ImpactStat>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(s: ImpactStat) {
    const supabase = createClient();
    await supabase
      .from("impact_stats")
      .update({ figure: s.figure, label: s.label, sort_order: s.sort_order })
      .eq("id", s.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("impact_stats")
      .insert({ figure: "0", label: "new stat", sort_order: rows.length + 1 })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, data as ImpactStat]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("impact_stats").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div>
      <button onClick={add} className="btn btn-primary text-sm">
        Add a statistic
      </button>
      <div className="mt-6 space-y-3">
        {rows.map((s) => (
          <div key={s.id} className="flex items-end gap-3 rounded-card border border-line p-4">
            <div className="w-40">
              <label className="label mb-1 block">Figure</label>
              <input
                value={s.figure}
                onChange={(e) => update(s.id, { figure: e.target.value })}
                onBlur={() => persist(s)}
                className="field"
              />
            </div>
            <div className="flex-1">
              <label className="label mb-1 block">Label</label>
              <input
                value={s.label}
                onChange={(e) => update(s.id, { label: e.target.value })}
                onBlur={() => persist(s)}
                className="field"
              />
            </div>
            <button onClick={() => remove(s.id)} className="pb-3 text-sm text-clay underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
