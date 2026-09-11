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
    <>
      <Section background="gold">
        <p className="label text-ink/60">Gallery</p>
        <h1 className="mt-3">
          Moments <span className="text-clay">from the build</span>.
        </h1>
        <p className="mt-4 max-w-prose text-ink/75">
          Events, the warehouse, and life behind the scenes.
        </p>
      </Section>

      {images.length === 0 ? (
        <Section background="shell">
          <p className="text-muted">Photos are coming soon.</p>
        </Section>
      ) : (
        <GalleryFilter images={images} />
      )}
    </>
  );
}
