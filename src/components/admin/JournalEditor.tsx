"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { JournalPost } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function JournalEditor({ post }: { post: JournalPost }) {
  const [form, setForm] = useState<JournalPost>(post);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const dirty = useRef(false);

  function set<K extends keyof JournalPost>(key: K, value: JournalPost[K]) {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(publishToggle?: boolean) {
    const publish = publishToggle ?? form.published;
    setSaveState("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("journal_posts")
      .update({
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        body: form.body,
        cover_image: form.cover_image || null,
        category: form.category,
        author: form.author,
        published: publish,
        published_at: publish && !form.published_at ? new Date().toISOString() : form.published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", form.id);
    dirty.current = false;
    if (!error) {
      setForm((f) => ({
        ...f,
        published: publish,
        published_at: publish && !f.published_at ? new Date().toISOString() : f.published_at,
      }));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } else {
      setSaveState("idle");
    }
  }

  useEffect(() => {
    const t = setInterval(() => {
      if (dirty.current) save();
    }, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  return (
    <div className="mt-4 max-w-2xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1>Edit article</h1>
        <div className="flex items-center gap-3">
          {saveState === "saving" && <span className="text-sm text-muted">Saving…</span>}
          {saveState === "saved" && <span className="text-sm text-jade">Saved</span>}
          <button onClick={() => save(!form.published)} className="btn btn-secondary text-sm">
            {form.published ? "Unpublish" : "Publish"}
          </button>
          <button onClick={() => save()} className="btn btn-primary text-sm">
            Save
          </button>
        </div>
      </div>

      <div>
        <label className="label mb-2 block">Title</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className="field" />
      </div>
      <div>
        <label className="label mb-2 block">URL slug</label>
        <input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} className="field" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label mb-2 block">Category</label>
          <input value={form.category} onChange={(e) => set("category", e.target.value)} className="field" />
        </div>
        <div>
          <label className="label mb-2 block">Author</label>
          <input value={form.author} onChange={(e) => set("author", e.target.value)} className="field" />
        </div>
      </div>
      <div>
        <label className="label mb-2 block">Excerpt (shown on cards)</label>
        <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className="field resize-y" />
      </div>
      <div>
        <label className="label mb-2 block">Cover image</label>
        <ImageUploader value={form.cover_image} onChange={(url) => set("cover_image", url || null)} folder="journal" aspect="aspect-[16/9]" />
      </div>
      <div>
        <label className="label mb-2 block">Body (one paragraph per line)</label>
        <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={16} className="field resize-y font-sans" />
      </div>
    </div>
  );
}
