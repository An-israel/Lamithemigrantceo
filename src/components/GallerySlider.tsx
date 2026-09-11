"use client";

import { Slider } from "@/components/Slider";
import type { GalleryImage } from "@/lib/types";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Large one-at-a-time photo carousel on a dark (ink) section. */
export function GallerySlider({ images }: { images: GalleryImage[] }) {
  return (
    <Slider
      items={images}
      ariaLabel="Gallery"
      arrowTheme="light"
      gapClassName="gap-0"
      itemClassName="w-full"
      keyFor={(img) => img.id}
      renderItem={(img) => (
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-card bg-shell/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.image_url} alt={img.caption || img.category} className="h-full w-full object-cover" />
          {(img.caption || img.category) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-8">
              <p className="label text-gold-soft">{img.category}</p>
              <p className="mt-1 font-display text-xl text-shell">
                {img.caption}
                {img.caption && img.taken_on ? " · " : ""}
                {formatDate(img.taken_on)}
              </p>
            </div>
          )}
        </div>
      )}
    />
  );
}
