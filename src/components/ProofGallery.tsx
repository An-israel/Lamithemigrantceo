import Image from "next/image";

/**
 * Real, unedited proof from the community — sourced from the 2026 Success
 * Stories & Impact Report. Sits beneath the polished testimonial cards, per
 * the report's own recommended structure ("real message gallery"). Every
 * image here has been checked for third-party names or photos and only kept
 * if none were visible.
 */
const PROOF = [
  {
    src: "/proof/tote-bags-sold-out.jpg",
    alt: "WhatsApp message: a student reporting her tote bags sold out at £10 each",
    caption: "Sold out her full tote-bag batch",
  },
  {
    src: "/proof/fans-sold-out.jpg",
    alt: "Photo of portable fans with a caption about selling 30 of them",
    caption: "30 fans sourced — sold out within a week",
  },
  {
    src: "/proof/first-1000.jpg",
    alt: "WhatsApp message: a student sharing she made her first £1,000 and registered her business",
    caption: "Her first £1,000, four months in",
  },
  {
    src: "/proof/warehouse-growth.jpg",
    alt: "Photo of packed stock pallets in a garden",
    caption: "From bedroom stock to needing a warehouse",
  },
];

export function ProofGallery() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {PROOF.map((p) => (
        <figure
          key={p.src}
          className="overflow-hidden rounded-card border border-line bg-shell"
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <figcaption className="p-3 text-[13px] text-muted">
            {p.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
