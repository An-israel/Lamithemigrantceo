import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { GalleryFilter } from "@/components/GalleryFilter";
import { getGalleryImages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos from Build Her Empire Live, the warehouse, and life behind the scenes.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <Section background="shell">
      <p className="label text-clay">Gallery</p>
      <h1 className="mt-3">Moments from the build.</h1>
      <p className="mt-4 max-w-prose text-muted">
        Events, the warehouse, and life behind the scenes.
      </p>

      <div className="mt-10">
        {images.length === 0 ? (
          <p className="text-muted">Photos are coming soon.</p>
        ) : (
          <GalleryFilter images={images} />
        )}
      </div>
    </Section>
  );
}
