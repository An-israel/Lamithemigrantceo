"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RepeatableRows } from "@/components/admin/RepeatableRows";
import type { Program, ProgramFormat, ProgramStatus } from "@/lib/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProgramEditor({ program }: { program: Program }) {
  const [form, setForm] = useState<Program>(program);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [slugTouched, setSlugTouched] = useState(true);
  const dirty = useRef(false);
  const firstRun = useRef(true);

  function set<K extends keyof Program>(key: K, value: Program[K]) {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!dirty.current) return;
    setSaveState("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("programs")
      .update({
        name: form.name,
        slug: form.slug || slugify(form.name),
        short_description: form.short_description,
        full_description: form.full_description,
        cover_image: form.cover_image || null,
        price_gbp: Number(form.price_gbp) || 0,
        compare_at_gbp: form.compare_at_gbp ? Number(form.compare_at_gbp) : null,
        format: form.format,
        start_date: form.start_date || null,
        duration: form.duration,
        who_for: form.who_for.filter(Boolean),
        what_you_get: form.what_you_get.filter(Boolean),
        status: form.status,
        sort_order: form.sort_order,
      })
      .eq("id", form.id);
    dirty.current = false;
    setSaveState(error ? "idle" : "saved");
    if (!error) setTimeout(() => setSaveState("idle"), 1500);
  }

  // Autosave every 10 seconds when there are unsaved changes.
  useEffect(() => {
    const t = setInterval(save, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Auto-slug from name until the slug is manually edited.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!slugTouched) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  return (
    <div className="mt-4 max-w-2xl space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <h1>Edit program</h1>
        <div className="flex items-center gap-3">
          {saveState === "saving" && (
            <span className="text-sm text-muted">Saving…</span>
          )}
          {saveState === "saved" && (
            <span className="text-sm text-jade">Saved</span>
          )}
          <a
            href={`/programs/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            Preview
          </a>
          <button onClick={save} className="btn btn-primary text-sm">
            Save now
          </button>
        </div>
      </div>

      <Field label="Name">
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="field"
        />
      </Field>

      <Field label="URL slug">
        <input
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set("slug", slugify(e.target.value));
          }}
          className="field"
        />
      </Field>

      <Field label="Short description (shown on cards)" hint={`${form.short_description.length}/120`}>
        <input
          value={form.short_description}
          maxLength={120}
          onChange={(e) => set("short_description", e.target.value)}
          className="field"
        />
      </Field>

      <Field label="Full description">
        <textarea
          value={form.full_description}
          onChange={(e) => set("full_description", e.target.value)}
          rows={5}
          className="field resize-y"
        />
      </Field>

      <Field label="Cover image (4:3, auto-compressed to WebP)">
        <ImageUploader
          value={form.cover_image}
          onChange={(url) => set("cover_image", url || null)}
          folder="programs"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Price (GBP)">
          <input
            type="number"
            value={form.price_gbp}
            onChange={(e) => set("price_gbp", Number(e.target.value))}
            className="field"
          />
        </Field>
        <Field label="Compare-at price (optional)">
          <input
            type="number"
            value={form.compare_at_gbp ?? ""}
            onChange={(e) =>
              set("compare_at_gbp", e.target.value ? Number(e.target.value) : null)
            }
            className="field"
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Format">
          <select
            value={form.format}
            onChange={(e) => set("format", e.target.value as ProgramFormat)}
            className="field"
          >
            <option value="live_cohort">Live cohort</option>
            <option value="self_paced">Self-paced</option>
          </select>
        </Field>
        <Field label="Duration">
          <input
            value={form.duration ?? ""}
            onChange={(e) => set("duration", e.target.value)}
            className="field"
          />
        </Field>
      </div>

      <Field label="Start date">
        <input
          type="date"
          value={form.start_date ?? ""}
          onChange={(e) => set("start_date", e.target.value || null)}
          className="field max-w-xs"
        />
      </Field>

      <RepeatableRows
        label="Who it is for"
        values={form.who_for}
        onChange={(v) => set("who_for", v)}
        placeholder="e.g. You have £200 and no idea where to start"
      />

      <RepeatableRows
        label="What you get"
        values={form.what_you_get}
        onChange={(v) => set("what_you_get", v)}
        placeholder="e.g. Eight live coaching calls"
        max={6}
      />

      <Field label="Status">
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value as ProgramStatus)}
          className="field max-w-xs"
        >
          <option value="draft">Draft (hidden)</option>
          <option value="live">Live (on the site)</option>
          <option value="sold_out">Sold out</option>
        </select>
      </Field>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label">{label}</label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
