"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Testimonial, Program } from "@/lib/types";

type Draft = Partial<Testimonial>;

export function TestimonialsManager({
  initial,
  programs,
}: {
  initial: Testimonial[];
  programs: Pick<Program, "id" | "name">[];
}) {
  const [rows, setRows] = useState<Testimonial[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);

  async function saveDraft() {
    if (!draft?.name || !draft?.quote) return;
    const supabase = createClient();
    if (draft.id) {
      const { data } = await supabase
        .from("testimonials")
        .update({
          name: draft.name,
          quote: draft.quote,
          result_figure: draft.result_figure || null,
          photo: draft.photo || null,
          program_id: draft.program_id || null,
        })
        .eq("id", draft.id)
        .select("*")
        .single();
      if (data) setRows((r) => r.map((x) => (x.id === draft.id ? (data as Testimonial) : x)));
    } else {
      const { data } = await supabase
        .from("testimonials")
        .insert({
          name: draft.name,
          quote: draft.quote,
          result_figure: draft.result_figure || null,
          photo: draft.photo || null,
          program_id: draft.program_id || null,
          sort_order: rows.length + 1,
        })
        .select("*")
        .single();
      if (data) setRows((r) => [...r, data as Testimonial]);
    }
    setDraft(null);
  }

  async function toggleArchive(t: Testimonial) {
    const supabase = createClient();
    const { data } = await supabase
      .from("testimonials")
      .update({ archived: !t.archived })
      .eq("id", t.id)
      .select("*")
      .single();
    if (data) setRows((r) => r.map((x) => (x.id === t.id ? (data as Testimonial) : x)));
  }

  return (
    <div>
      <button
        onClick={() => setDraft({ name: "", quote: "" })}
        className="btn btn-primary text-sm"
      >
        Add a testimonial
      </button>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((t) => (
          <div
            key={t.id}
            className={`rounded-card border border-line p-4 ${t.archived ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{t.name}</p>
                {t.result_figure && (
                  <p className="text-sm text-jade">{t.result_figure}</p>
                )}
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => setDraft(t)} className="text-clay underline">
                  Edit
                </button>
                <button onClick={() => toggleArchive(t)} className="text-muted underline">
                  {t.archived ? "Restore" : "Archive"}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm">“{t.quote}”</p>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDraft(null)} />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-shell p-6">
            <div className="flex items-center justify-between">
              <h3>{draft.id ? "Edit" : "Add"} testimonial</h3>
              <button
                onClick={() => setDraft(null)}
                className="text-2xl leading-none text-muted"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label mb-2 block">Name</label>
                <input
                  value={draft.name || ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="label mb-2 block">Quote</label>
                <textarea
                  value={draft.quote || ""}
                  onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                  rows={3}
                  className="field resize-y"
                />
              </div>
              <div>
                <label className="label mb-2 block">Result figure</label>
                <input
                  value={draft.result_figure || ""}
                  onChange={(e) => setDraft({ ...draft, result_figure: e.target.value })}
                  placeholder="£1,200 in her first month"
                  className="field"
                />
              </div>
              <div>
                <label className="label mb-2 block">Which program</label>
                <select
                  value={draft.program_id || ""}
                  onChange={(e) => setDraft({ ...draft, program_id: e.target.value || null })}
                  className="field"
                >
                  <option value="">— None —</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label mb-2 block">Photo</label>
                <ImageUploader
                  value={draft.photo || null}
                  onChange={(url) => setDraft({ ...draft, photo: url || null })}
                  folder="testimonials"
                  aspect="aspect-square"
                />
              </div>
              <button onClick={saveDraft} className="btn btn-primary w-full">
                Save testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
