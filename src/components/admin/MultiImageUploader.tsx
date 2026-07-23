"use client";

import { ImageUploader } from "@/components/admin/ImageUploader";

/**
 * Manages an ordered list of image URLs. The first image is the card image.
 * Each slot reuses the single ImageUploader (compress + WebP + upload).
 */
export function MultiImageUploader({
  images,
  onChange,
  folder = "wholesale",
}: {
  images: string[];
  onChange: (next: string[]) => void;
  folder?: string;
}) {
  function addAt(url: string) {
    if (url) onChange([...images, url]);
  }
  function replaceAt(i: number, url: string) {
    if (!url) {
      onChange(images.filter((_, idx) => idx !== i));
    } else {
      const next = [...images];
      next[i] = url;
      onChange(next);
    }
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((img, i) => (
          <div key={i} className="w-32">
            <ImageUploader
              value={img}
              onChange={(url) => replaceAt(i, url)}
              folder={folder}
              aspect="aspect-square"
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              {i === 0 ? (
                <span className="text-jade">Card image</span>
              ) : (
                <button
                  type="button"
                  className="text-clay underline"
                  onClick={() => move(i, -1)}
                >
                  ← move
                </button>
              )}
              {i < images.length - 1 && (
                <button
                  type="button"
                  className="text-clay underline"
                  onClick={() => move(i, 1)}
                >
                  move →
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="w-32">
          <ImageUploader
            value={null}
            onChange={addAt}
            folder={folder}
            aspect="aspect-square"
          />
          <p className="mt-1 text-xs text-muted">Add image</p>
        </div>
      </div>
    </div>
  );
}
