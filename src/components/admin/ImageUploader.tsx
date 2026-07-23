"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Drag-and-drop image upload. Accepts any PNG/JPG at any size, resizes and
 * converts to WebP in the browser (so a 4MB PNG never reaches the live site),
 * then uploads to the Supabase `media` bucket and returns the public URL.
 */
async function compressToWebp(
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      "image/webp",
      quality
    );
  });
}

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  aspect = "aspect-[4/3]",
}: {
  value: string | null;
  onChange: (url: string) => void;
  folder?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("That is not an image.");
      return;
    }
    setBusy(true);
    try {
      const webp = await compressToWebp(file);
      const supabase = createClient();
      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, webp, { contentType: "image/webp", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      console.error(e);
      setError("Upload failed. Try a different image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`${aspect} flex w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-card border-2 border-dashed ${
          dragOver ? "border-clay bg-peach/40" : "border-line"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-sm text-muted">
            {busy ? "Uploading…" : "Drag an image here, or click to choose"}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {value && (
        <button
          type="button"
          className="mt-2 text-sm text-muted underline"
          onClick={() => onChange("")}
        >
          Remove image
        </button>
      )}
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
    </div>
  );
}
