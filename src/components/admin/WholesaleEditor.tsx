"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import type { WholesaleProduct } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function WholesaleEditor({ product }: { product: WholesaleProduct }) {
  const router = useRouter();
  const [form, setForm] = useState<WholesaleProduct>(product);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const dirty = useRef(false);

  function set<K extends keyof WholesaleProduct>(key: K, value: WholesaleProduct[K]) {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!dirty.current) return;
    setSaveState("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("wholesale_products")
      .update({
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        whats_inside: form.whats_inside,
        unit_count: Number(form.unit_count) || 0,
        price_gbp: Number(form.price_gbp) || 0,
        typical_resale_gbp: form.typical_resale_gbp
          ? Number(form.typical_resale_gbp)
          : null,
        stock: Number(form.stock) || 0,
        category: form.category,
        images: form.images,
        archived: form.archived,
      })
      .eq("id", form.id);
    dirty.current = false;
    setSaveState(error ? "idle" : "saved");
    if (!error) setTimeout(() => setSaveState("idle"), 1500);
  }

  useEffect(() => {
    const t = setInterval(save, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  async function duplicate() {
    await save();
    const supabase = createClient();
    const suffix = Math.random().toString(36).slice(2, 7);
    const { data } = await supabase
      .from("wholesale_products")
      .insert({
        name: `${form.name} (copy)`,
        slug: `${form.slug}-${suffix}`,
        description: form.description,
        whats_inside: form.whats_inside,
        unit_count: form.unit_count,
        price_gbp: form.price_gbp,
        typical_resale_gbp: form.typical_resale_gbp,
        stock: 0,
        category: form.category,
        images: form.images,
        archived: true,
      })
      .select("id")
      .single();
    if (data) router.push(`/admin/wholesale/${(data as { id: string }).id}`);
  }

  return (
    <div className="mt-4 max-w-2xl space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <h1>Edit bundle</h1>
        <div className="flex items-center gap-3">
          {saveState === "saving" && <span className="text-sm text-muted">Saving…</span>}
          {saveState === "saved" && <span className="text-sm text-jade">Saved</span>}
          <button onClick={duplicate} className="btn btn-secondary text-sm">
            Duplicate
          </button>
          <button onClick={save} className="btn btn-primary text-sm">
            Save now
          </button>
        </div>
      </div>

      <Field label="Name">
        <input value={form.name} onChange={(e) => set("name", e.target.value)} className="field" />
      </Field>

      <Field label="URL slug">
        <input
          value={form.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
          className="field"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="field resize-y"
        />
      </Field>

      <Field label="What is inside">
        <input
          value={form.whats_inside}
          onChange={(e) => set("whats_inside", e.target.value)}
          className="field"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Unit count">
          <input
            type="number"
            value={form.unit_count}
            onChange={(e) => set("unit_count", Number(e.target.value))}
            className="field"
          />
        </Field>
        <Field label="Price (GBP)">
          <input
            type="number"
            value={form.price_gbp}
            onChange={(e) => set("price_gbp", Number(e.target.value))}
            className="field"
          />
        </Field>
        <Field label="Typical resale (GBP)">
          <input
            type="number"
            value={form.typical_resale_gbp ?? ""}
            onChange={(e) =>
              set("typical_resale_gbp", e.target.value ? Number(e.target.value) : null)
            }
            className="field"
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Stock">
          <input
            type="number"
            value={form.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
            className="field"
          />
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="field"
          >
            <option>Jewelry</option>
            <option>Accessories</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      <Field label="Images (first is the card image, drag order with move links)">
        <MultiImageUploader
          images={form.images}
          onChange={(imgs) => set("images", imgs)}
        />
      </Field>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!form.archived}
          onChange={(e) => set("archived", !e.target.checked)}
          className="h-4 w-4 accent-clay"
        />
        <span>Show this bundle in the shop</span>
      </label>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label mb-2 block">{label}</label>
      {children}
    </div>
  );
}
