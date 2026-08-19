"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProgramModule } from "@/lib/types";

/**
 * Manages the real module content students see at /my/[slug] once they've
 * paid — title, body copy, an optional video link and an optional
 * downloadable file. While a programme has zero modules, /my/[slug] falls
 * back to a placeholder derived from "What you get" so nothing breaks.
 */
export function ProgramModulesManager({
  programId,
  initial,
}: {
  programId: string;
  initial: ProgramModule[];
}) {
  const [rows, setRows] = useState<ProgramModule[]>(initial);

  function update(id: string, patch: Partial<ProgramModule>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(m: ProgramModule) {
    const supabase = createClient();
    await supabase
      .from("program_modules")
      .update({
        title: m.title,
        body: m.body,
        video_url: m.video_url || null,
        file_url: m.file_url || null,
        sort_order: m.sort_order,
      })
      .eq("id", m.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("program_modules")
      .insert({
        program_id: programId,
        title: `Module ${rows.length + 1}`,
        sort_order: rows.length + 1,
      })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, data as ProgramModule]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("program_modules").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    const withOrder = next.map((m, idx) => ({ ...m, sort_order: idx + 1 }));
    setRows(withOrder);
    const supabase = createClient();
    await Promise.all(
      [withOrder[i], withOrder[j]].map((m) =>
        supabase.from("program_modules").update({ sort_order: m.sort_order }).eq("id", m.id)
      )
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3>Modules</h3>
          <p className="mt-1 text-sm text-muted">
            What a student sees at <code>/my</code> once they&rsquo;ve paid. Leave
            empty and the site falls back to a placeholder built from
            &ldquo;What you get&rdquo; above.
          </p>
        </div>
        <button onClick={add} className="btn btn-secondary text-sm">
          Add a module
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {rows.map((m, i) => (
          <div key={m.id} className="rounded-card border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <input
                value={m.title}
                onChange={(e) => update(m.id, { title: e.target.value })}
                onBlur={() => persist(m)}
                className="field font-bold"
                placeholder="Module title"
              />
              <div className="flex shrink-0 gap-2 text-sm">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="text-clay underline disabled:text-muted disabled:no-underline"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                  className="text-clay underline disabled:text-muted disabled:no-underline"
                >
                  ↓
                </button>
                <button onClick={() => remove(m.id)} className="text-clay underline">
                  Delete
                </button>
              </div>
            </div>

            <textarea
              value={m.body}
              onChange={(e) => update(m.id, { body: e.target.value })}
              onBlur={() => persist(m)}
              rows={3}
              placeholder="What this module covers"
              className="field mt-3 resize-y"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label mb-1 block">Video link (optional)</label>
                <input
                  value={m.video_url || ""}
                  onChange={(e) => update(m.id, { video_url: e.target.value })}
                  onBlur={() => persist(m)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="field"
                />
              </div>
              <div>
                <label className="label mb-1 block">File link (optional)</label>
                <input
                  value={m.file_url || ""}
                  onChange={(e) => update(m.id, { file_url: e.target.value })}
                  onBlur={() => persist(m)}
                  placeholder="https://..."
                  className="field"
                />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-card border border-line bg-peach p-4 text-sm text-muted">
            No modules yet — students see a placeholder until you add some.
          </p>
        )}
      </div>
    </div>
  );
}
