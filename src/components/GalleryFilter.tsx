"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import type { GalleryImage } from "@/lib/types";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GalleryFilter({ images }: { images: GalleryImage[] }) {
  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category)))];
  const [filter, setFilter] = useState("All");

  const shown = filter === "All" ? images : images.filter((i) => i.category === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={clsx(
              "pill border",
              filter === c
                ? "bg-clay text-shell border-clay"
                : "bg-transparent text-ink border-line hover:border-clay"
            )}
            aria-pressed={filter === c}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 text-muted">No photos in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {shown.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={img.caption || img.category}
                className="aspect-square w-full object-cover"
              />
              {(img.caption || img.taken_on) && (
                <figcaption className="mt-1 text-xs text-muted">
                  {img.caption}
                  {img.caption && img.taken_on ? " · " : ""}
                  {formatDate(img.taken_on)}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
