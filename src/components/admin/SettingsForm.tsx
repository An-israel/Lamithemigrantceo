"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { SiteSettings, ReceiptItem } from "@/lib/types";

/** Editable contact details, hero copy and announcement bar. Writes to the
 *  single `site_settings` row (id = 1). */
export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState<SiteSettings>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setState("saving");
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("site_settings")
        .update({
          whatsapp_number: form.whatsapp_number,
          public_email: form.public_email,
          calendly_url: form.calendly_url,
          instagram_handle: form.instagram_handle,
          tiktok_handle: form.tiktok_handle,
          hero_headline: form.hero_headline,
          hero_paragraph: form.hero_paragraph,
          announcement_enabled: form.announcement_enabled,
          announcement_message: form.announcement_message,
          announcement_link: form.announcement_link,
          receipt_items: form.receipt_items,
          receipt_resold_gbp: form.receipt_resold_gbp,
          receipt_note: form.receipt_note,
          founder_portrait_url: form.founder_portrait_url,
          media_headshot_url: form.media_headshot_url,
        })
        .eq("id", 1);
      if (error) throw error;
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  const field = (
    label: string,
    key: keyof SiteSettings,
    type = "text"
  ) => (
    <div>
      <label className="label mb-2 block">{label}</label>
      <input
        type={type}
        value={(form[key] as string) || ""}
        onChange={(e) => set(key, e.target.value as never)}
        className="field"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="rounded-card border border-line p-6">
        <h3>Contact details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("WhatsApp number", "whatsapp_number")}
          {field("Public email", "public_email", "email")}
          {field("Calendly link", "calendly_url", "url")}
          {field("Instagram handle", "instagram_handle")}
          {field("TikTok handle", "tiktok_handle")}
        </div>
      </section>

      <section className="rounded-card border border-line p-6">
        <h3>Brand photos</h3>
        <p className="mt-1 text-sm text-muted">
          Used on the About page and the Media/press page. Upload once here
          and both stay in sync everywhere they appear.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label mb-2 block">Founder portrait (About page, wide 16:9)</label>
            <ImageUploader
              value={form.founder_portrait_url}
              onChange={(url) => set("founder_portrait_url", url || null)}
              folder="brand"
              aspect="aspect-video"
            />
          </div>
          <div>
            <label className="label mb-2 block">Media headshot (press page)</label>
            <ImageUploader
              value={form.media_headshot_url}
              onChange={(url) => set("media_headshot_url", url || null)}
              folder="brand"
              aspect="aspect-square"
            />
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line p-6">
        <h3>Homepage</h3>
        <div className="mt-4 space-y-4">
          {field("Hero headline", "hero_headline")}
          <div>
            <label className="label mb-2 block">Hero paragraph</label>
            <textarea
              value={form.hero_paragraph || ""}
              onChange={(e) => set("hero_paragraph", e.target.value)}
              rows={3}
              className="field resize-y"
            />
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line p-6">
        <h3>Homepage receipt</h3>
        <p className="mt-1 text-sm text-muted">
          The £200 receipt on the homepage. Edit the line items, the resold
          total and the caption. The total and margin calculate automatically.
        </p>
        <div className="mt-4 space-y-2">
          {(form.receipt_items || []).map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.label}
                onChange={(e) => {
                  const next = [...(form.receipt_items || [])];
                  next[i] = { ...next[i], label: e.target.value };
                  set("receipt_items", next);
                }}
                placeholder="Line item"
                className="field"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) => {
                  const next = [...(form.receipt_items || [])];
                  next[i] = { ...next[i], value: Number(e.target.value) };
                  set("receipt_items", next);
                }}
                className="field w-28"
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "receipt_items",
                    (form.receipt_items || []).filter((_, idx) => idx !== i)
                  )
                }
                className="shrink-0 rounded-input border border-line px-3 text-muted hover:border-clay"
                aria-label="Remove line"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set("receipt_items", [
                ...(form.receipt_items || []),
                { label: "", value: 0 } as ReceiptItem,
              ])
            }
            className="text-sm text-clay underline"
          >
            + Add line
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label mb-2 block">Resold for (GBP)</label>
            <input
              type="number"
              value={form.receipt_resold_gbp ?? ""}
              onChange={(e) =>
                set("receipt_resold_gbp", e.target.value ? Number(e.target.value) : null)
              }
              className="field"
            />
          </div>
          {field("Caption", "receipt_note")}
        </div>
      </section>

      <section className="rounded-card border border-line p-6">
        <h3>Announcement bar</h3>
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.announcement_enabled}
            onChange={(e) => set("announcement_enabled", e.target.checked)}
            className="h-4 w-4 accent-clay"
          />
          <span>Show the announcement bar</span>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("Message", "announcement_message")}
          {field("Link (optional)", "announcement_link", "url")}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="btn btn-primary"
        >
          {state === "saving" ? "Saving…" : "Save changes"}
        </button>
        {state === "saved" && <span className="text-jade">Saved.</span>}
        {state === "error" && (
          <span className="text-clay">Could not save. Try again.</span>
        )}
      </div>
    </div>
  );
}
