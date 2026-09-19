import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/Section";
import { BuyButton } from "@/components/BuyButton";
import { ApplyForm } from "@/components/ApplyForm";
import { Accordion } from "@/components/Accordion";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ProductWaitlist } from "@/components/ProductWaitlist";
import { RichText } from "@/components/RichText";
import {
  getProductBySlug,
  getProducts,
  getTestimonials,
  getSettings,
  formatGBP,
} from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.short_description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: product.cover_image ? [product.cover_image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [testimonials, settings] = await Promise.all([
    getTestimonials(product.id),
    getSettings(),
  ]);
  const soldOut = product.status === "sold_out";
  const formatLabel =
    product.format === "live_cohort" ? "Live cohort" : "Self-paced";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: product.name,
    description: product.short_description,
    provider: {
      "@type": "Organization",
      name: "Lami the Migrant CEO",
      sameAs: siteUrl,
    },
    offers: {
      "@type": "Offer",
      category: formatLabel,
      price: product.price_gbp,
      priceCurrency: "GBP",
      availability: soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: `${siteUrl}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section background="shell" className="!pb-10">
        <Link href="/products" className="text-sm text-muted no-underline hover:text-clay">
          ← All products
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[3fr_2fr]">
          {/* Left: details */}
          <div>
            <h1>{product.name}</h1>
            <RichText html={product.full_description} className="mt-4" />

            <h3 className="mt-10">What you get</h3>
            <ul className="mt-4 space-y-3">
              {product.what_you_get.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-clay" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-10 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="label">Format</dt>
                <dd className="mt-1">{formatLabel}</dd>
              </div>
              <div>
                <dt className="label">Duration</dt>
                <dd className="mt-1">{product.duration || "See details"}</dd>
              </div>
              <div>
                <dt className="label">Starts</dt>
                <dd className="mt-1">
                  {product.start_date
                    ? new Date(product.start_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Anytime"}
                </dd>
              </div>
              <div>
                <dt className="label">Who it is for</dt>
                <dd className="mt-1">{product.who_for[0]}</dd>
              </div>
            </dl>

            {product.gallery_images.length > 0 && (
              <>
                <h3 className="mt-10">Gallery</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {product.gallery_images.map((src) => (
                    <div key={src} className="relative aspect-square w-full">
                      <Image
                        src={src}
                        alt={product.name}
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        className="rounded-input object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: sticky buy card */}
          <div>
            <div className="rounded-card border border-line bg-peach-deep p-6 md:sticky md:top-24">
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-input bg-peach">
                {product.cover_image ? (
                  <Image
                    src={product.cover_image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 768px) 35vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-3xl text-ink/40">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                {product.compare_at_gbp && (
                  <span className="text-muted line-through">
                    {formatGBP(product.compare_at_gbp)}
                  </span>
                )}
                <span className="price !text-[32px]">
                  {formatGBP(product.price_gbp)}
                </span>
              </div>

              {product.start_date && (
                <p className="mt-1 text-sm text-muted">
                  Next start{" "}
                  {new Date(product.start_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              )}

              <div className="mt-5">
                {soldOut ? (
                  <div className="space-y-3">
                    <span className="pill bg-jade text-shell">
                      Next cohort soon
                    </span>
                    <ProductWaitlist
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                ) : (
                  <BuyButton
                    productId={product.id}
                    productName={product.name}
                    label={`Join for ${formatGBP(product.price_gbp)}`}
                    whatsappNumber={settings.whatsapp_number}
                  />
                )}
              </div>
              <p className="mt-3 text-[13px] text-muted">
                Secure card payment. Instant access by email.
              </p>
              <ApplyForm productId={product.id} productName={product.name} />
              {settings.calendly_url && (
                <a
                  href={settings.calendly_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-sm text-clay underline"
                >
                  Or book a 1:1 call to ask questions first →
                </a>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Curriculum */}
      <Section background="clay">
        <h2 className="text-shell">What we cover.</h2>
        <div className="mt-8 max-w-prose">
          <Accordion
            theme="dark"
            items={product.what_you_get.map((w, i) => ({
              title: `Module ${i + 1}`,
              body: w,
            }))}
          />
        </div>
      </Section>

      {/* Testimonials for this product. Conditionally rendered, but the
          curriculum (clay) and FAQ (gold) sections on either side never
          match, so skipping this never creates an adjacent-color repeat. */}
      {testimonials.length > 0 && (
        <Section background="shell">
          <h2>Women who did this.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section background="gold">
        <h2>Questions before you join.</h2>
        <div className="mt-8 max-w-prose">
          <Accordion
            items={[
              {
                title: "What if I have never sold anything?",
                body: "That is exactly who this is built for. We start from your first order.",
              },
              {
                title: "How much stock money do I need?",
                body: "You can start from around £200. We work to your budget, not a fixed one.",
              },
              {
                title: "Do I get access straight away?",
                body: "Yes. Payment gives instant access by email to your student area.",
              },
            ]}
          />
        </div>
      </Section>

      {/* Mobile sticky buy bar */}
      {!soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-shell p-4 md:hidden">
          <div className="flex items-center justify-between gap-4">
            <span className="price">{formatGBP(product.price_gbp)}</span>
            <BuyButton
              productId={product.id}
              productName={product.name}
              label="Join now"
              className="flex-1"
              whatsappNumber={settings.whatsapp_number}
            />
          </div>
        </div>
      )}
    </>
  );
}
