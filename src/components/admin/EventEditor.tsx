"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { EventItem, EventStatus } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// datetime-local wants "YYYY-MM-DDTHH:mm"
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventEditor({ event }: { event: EventItem }) {
  const [form, setForm] = useState<EventItem>(event);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const dirty = useRef(false);

  function set<K extends keyof EventItem>(key: K, value: EventItem[K]) {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!dirty.current) return;
    setSaveState("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("events")
      .update({
        name: form.name,
        slug: form.slug || slugify(form.name),
        tagline: form.tagline,
        description: form.description,
        cover_image: form.cover_image || null,
        location: form.location,
        starts_at: form.starts_at,
        price_gbp: Number(form.price_gbp) || 0,
        compare_at_gbp: form.compare_at_gbp ? Number(form.compare_at_gbp) : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
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

  return (
    <div className="mt-4 max-w-2xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1>Edit event</h1>
        <div className="flex items-center gap-3">
          {saveState === "saving" && <span className="text-sm text-muted">Saving…</span>}
          {saveState === "saved" && <span className="text-sm text-jade">Saved</span>}
          <a href={`/events/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">
            Preview
          </a>
          <button onClick={save} className="btn btn-primary text-sm">Save</button>
        </div>
      </div>

      <div>
        <label className="label mb-2 block">Name</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} className="field" />
      </div>
      <div>
        <label className="label mb-2 block">Slug</label>
        <input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} className="field" />
      </div>
      <div>
        <label className="label mb-2 block">Tagline</label>
        <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="field" />
      </div>
      <div>
        <label className="label mb-2 block">Description (one paragraph per line)</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className="field resize-y" />
      </div>
      <div>
        <label className="label mb-2 block">Cover image</label>
        <ImageUploader value={form.cover_image} onChange={(url) => set("cover_image", url || null)} folder="events" aspect="aspect-[16/9]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label mb-2 block">Location</label>
          <input value={form.location || ""} onChange={(e) => set("location", e.target.value)} className="field" />
        </div>
        <div>
          <label className="label mb-2 block">Starts</label>
          <input
            type="datetime-local"
            value={toLocalInput(form.starts_at)}
            onChange={(e) => set("starts_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="field"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label mb-2 block">Price (GBP)</label>
          <input type="number" value={form.price_gbp} onChange={(e) => set("price_gbp", Number(e.target.value))} className="field" />
        </div>
        <div>
          <label className="label mb-2 block">Compare-at (opt)</label>
          <input type="number" value={form.compare_at_gbp ?? ""} onChange={(e) => set("compare_at_gbp", e.target.value ? Number(e.target.value) : null)} className="field" />
        </div>
        <div>
          <label className="label mb-2 block">Capacity</label>
          <input type="number" value={form.capacity ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)} className="field" />
        </div>
      </div>
      <div>
        <label className="label mb-2 block">Status</label>
        <select value={form.status} onChange={(e) => set("status", e.target.value as EventStatus)} className="field max-w-xs">
          <option value="draft">Draft (hidden)</option>
          <option value="live">Live (on sale)</option>
          <option value="sold_out">Sold out</option>
          <option value="past">Past</option>
        </select>
      </div>
      <p className="text-sm text-muted">Tickets sold: {form.tickets_sold}</p>
    </div>
  );
}
