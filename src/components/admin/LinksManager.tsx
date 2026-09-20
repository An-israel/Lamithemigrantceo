"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { BioLink, BioLinkStyle, Product, Resource } from "@/lib/types";

const STYLES: { value: BioLinkStyle; label: string }[] = [
  { value: "simple", label: "Simple link" },
  { value: "product", label: "Product (price + Buy now)" },
  { value: "resource", label: "Free resource (Get for free)" },
  { value: "banner", label: "Promo banner" },
];

export function LinksManager({
  initial,
  products,
  resources,
}: {
  initial: BioLink[];
  products: Product[];
  resources: Resource[];
}) {
  const [rows, setRows] = useState<BioLink[]>(initial);

  function update(id: string, patch: Partial<BioLink>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function persist(link: BioLink) {
    const supabase = createClient();
    await supabase
      .from("bio_links")
      .update({
        label: link.label,
        url: link.url,
        description: link.description,
        image_url: link.image_url,
        active: link.active,
        sort_order: link.sort_order,
        style: link.style,
        product_id: link.product_id,
        resource_id: link.resource_id,
        button_label: link.button_label,
      })
      .eq("id", link.id);
  }

  async function add() {
    const supabase = createClient();
    const { data } = await supabase
      .from("bio_links")
      .insert({ label: "New link", url: "https://", sort_order: rows.length + 1 })
      .select("*")
      .single();
    if (data) setRows((r) => [...r, { ...(data as BioLink), product: null, resource: null }]);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("bio_links").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  function onStyleChange(link: BioLink, style: BioLinkStyle) {
    const patch: Partial<BioLink> = { style };
    if (style !== "product") patch.product_id = null;
    if (style !== "resource") patch.resource_id = null;
    update(link.id, patch);
    persist({ ...link, ...patch });
  }

  function onProductChange(link: BioLink, productId: string) {
    const p = products.find((x) => x.id === productId) || null;
    const patch: Partial<BioLink> = {
      product_id: productId || null,
      label: p ? p.name : link.label,
      url: p ? `/products/${p.slug}` : link.url,
    };
    update(link.id, patch);
    persist({ ...link, ...patch });
  }

  function onResourceChange(link: BioLink, resourceId: string) {
    const r = resources.find((x) => x.id === resourceId) || null;
    const patch: Partial<BioLink> = {
      resource_id: resourceId || null,
      label: r ? r.title : link.label,
      url: "/resources",
    };
    update(link.id, patch);
    persist({ ...link, ...patch });
  }

  return (
    <div>
      <button onClick={add} className="btn btn-primary text-sm">
        Add a link
      </button>

      <div className="mt-6 space-y-4">
        {rows.map((link) => {
          const catalogStyle = link.style === "product" || link.style === "resource";
          return (
            <div key={link.id} className="rounded-card border border-line p-4">
              <div>
                <label className="label mb-1 block">Card type</label>
                <select
                  value={link.style}
                  onChange={(e) => onStyleChange(link, e.target.value as BioLinkStyle)}
                  className="field"
                >
                  {STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {link.style === "product" && (
                <div className="mt-3">
                  <label className="label mb-1 block">Product</label>
                  <select
                    value={link.product_id || ""}
                    onChange={(e) => onProductChange(link, e.target.value)}
                    className="field"
                  >
                    <option value="">Choose a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — £{p.price_gbp}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted">
                    Price, compare-at price, duration and image come straight from
                    the product and update automatically if you change them there.
                    Edit the product&rsquo;s cover image in{" "}
                    <Link href="/admin/products" className="underline">
                      Products
                    </Link>
                    .
                  </p>
                </div>
              )}

              {link.style === "resource" && (
                <div className="mt-3">
                  <label className="label mb-1 block">Resource</label>
                  <select
                    value={link.resource_id || ""}
                    onChange={(e) => onResourceChange(link, e.target.value)}
                    className="field"
                  >
                    <option value="">Choose a resource…</option>
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted">
                    Image and description come straight from the resource. Add
                    or change the cover image in{" "}
                    <Link href="/admin/resources" className="underline">
                      Resources
                    </Link>{" "}
                    (each resource has a &ldquo;Card image&rdquo; field).
                  </p>
                </div>
              )}

              {!catalogStyle && (
                <>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label mb-1 block">Label</label>
                      <input
                        value={link.label}
                        onChange={(e) => update(link.id, { label: e.target.value })}
                        onBlur={() => persist(link)}
                        className="field"
                      />
                    </div>
                    <div>
                      <label className="label mb-1 block">URL</label>
                      <input
                        value={link.url}
                        onChange={(e) => update(link.id, { url: e.target.value })}
                        onBlur={() => persist(link)}
                        className="field"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="label mb-1 block">Image (optional)</label>
                    <ImageUploader
                      value={link.image_url}
                      onChange={(url) => {
                        update(link.id, { image_url: url || null });
                        persist({ ...link, image_url: url || null });
                      }}
                      folder="bio-links"
                      aspect="aspect-square"
                    />
                  </div>
                </>
              )}

              <div className="mt-3">
                <label className="label mb-1 block">
                  {link.style === "banner" ? "Description" : "Description (optional)"}
                </label>
                <input
                  value={link.description || ""}
                  onChange={(e) => update(link.id, { description: e.target.value })}
                  onBlur={() => persist(link)}
                  placeholder={catalogStyle ? "Overrides the catalog description" : undefined}
                  className="field"
                />
              </div>

              {catalogStyle && (
                <div className="mt-3">
                  <label className="label mb-1 block">Button text (optional)</label>
                  <input
                    value={link.button_label || ""}
                    onChange={(e) => update(link.id, { button_label: e.target.value || null })}
                    onBlur={() => persist(link)}
                    placeholder={link.style === "product" ? "Buy now" : "Get for free"}
                    className="field"
                  />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={link.active}
                    onChange={(e) => {
                      update(link.id, { active: e.target.checked });
                      persist({ ...link, active: e.target.checked });
                    }}
                    className="h-4 w-4 accent-clay"
                  />
                  Active
                </label>
                <span className="text-sm text-muted">{link.clicks} clicks</span>
                <button onClick={() => remove(link.id)} className="text-sm text-clay underline">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
