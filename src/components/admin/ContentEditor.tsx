"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CONTENT_REGISTRY } from "@/lib/contentRegistry";

/** Editor for every site-wide text field in CONTENT_REGISTRY, grouped by
 *  page. Writes to the single `site_content` table (key/value rows). */
export function ContentEditor({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [openGroup, setOpenGroup] = useState<string>(CONTENT_REGISTRY[0]?.id ?? "");

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    setState("saving");
    try {
      const supabase = createClient();
      const rows = CONTENT_REGISTRY.flatMap((g) => g.fields)
        .map((f) => ({ key: f.key, value: (values[f.key] || "").trim() }))
        .filter((r) => r.value);

      // Anything now blank should stop overriding its default, so delete
      // those keys instead of writing an empty row.
      const blankKeys = CONTENT_REGISTRY.flatMap((g) => g.fields)
        .map((f) => f.key)
        .filter((key) => !(values[key] || "").trim());

      if (rows.length > 0) {
        const { error } = await supabase
          .from("site_content")
          .upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })));
        if (error) throw error;
      }
      if (blankKeys.length > 0) {
        const { error } = await supabase.from("site_content").delete().in("key", blankKeys);
        if (error) throw error;
      }

      setState("saved");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="space-y-4">
      {CONTENT_REGISTRY.map((group) => {
        const isOpen = openGroup === group.id;
        return (
          <section key={group.id} className="rounded-card border border-line">
            <button
              type="button"
              onClick={() => setOpenGroup(isOpen ? "" : group.id)}
              className="flex w-full items-center justify-between p-6 text-left"
              aria-expanded={isOpen}
            >
              <h3>{group.label}</h3>
              <span className="text-muted">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="space-y-5 border-t border-line p-6 pt-5">
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <label className="label mb-2 block">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={values[field.key] ?? ""}
                        onChange={(e) => set(field.key, e.target.value)}
                        placeholder={field.default}
                        rows={3}
                        className="field resize-y"
                      />
                    ) : (
                      <input
                        value={values[field.key] ?? ""}
                        onChange={(e) => set(field.key, e.target.value)}
                        placeholder={field.default}
                        className="field"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="flex items-center gap-4 pt-2">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary">
          {state === "saving" ? "Saving…" : "Save changes"}
        </button>
        {state === "saved" && <span className="text-jade">Saved.</span>}
        {state === "error" && <span className="text-clay">Could not save. Try again.</span>}
      </div>
    </div>
  );
}
