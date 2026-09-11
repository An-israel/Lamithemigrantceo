"use client";

import { useState } from "react";
import { Section } from "@/components/Section";
import { GallerySlider } from "@/components/GallerySlider";
import { clsx } from "@/lib/clsx";
import type { GalleryImage } from "@/lib/types";

// Every 3rd/7th tile in the archive grid spans two rows, for a loose
// masonry feel without needing separate image-dimension data.
function spanClass(i: number) {
  return i % 5 === 2 || i % 7 === 4 ? "row-span-2" : "";
}

export function GalleryFilter({ images }: { images: GalleryImage[] }) {
  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category)))];
  const [filter, setFilter] = useState("All");

  const shown = filter === "All" ? images : images.filter((i) => i.category === filter);

  return (
    <>
      <Section background="shell">
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
        {shown.length === 0 && (
          <p className="mt-8 text-muted">No photos in this category yet.</p>
        )}
      </Section>

      {shown.length > 0 && (
        <>
          <Section background="ink">
            <GallerySlider images={shown} />
          </Section>

          {/* Always rendered after the ink slider (never skipped), so a dark
              section never sits directly against the site footer's black. */}
          <Section background="clay">
            <h2 className="text-shell">More from the archive.</h2>
            <div className="mt-8 grid auto-rows-[130px] grid-cols-2 gap-4 sm:grid-cols-4">
              {shown.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={img.caption || img.category}
                  className={clsx(
                    "h-full w-full rounded-input object-cover",
                    spanClass(i)
                  )}
                />
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
