import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/Section";
import { BuyButton } from "@/components/BuyButton";
import { ApplyForm } from "@/components/ApplyForm";
import { Accordion } from "@/components/Accordion";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ProgramWaitlist } from "@/components/ProgramWaitlist";
import {
  getProgramBySlug,
  getPrograms,
  getTestimonials,
  formatGBP,
} from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const program = await getProgramBySlug(params.slug);
  if (!program) return { title: "Program not found" };
  return {
    title: program.name,
    description: program.short_description,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: {
      title: program.name,
      description: program.short_description,
      images: program.cover_image ? [program.cover_image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export default async function ProgramDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const program = await getProgramBySlug(params.slug);
  if (!program) notFound();

  const testimonials = await getTestimonials(program.id);
  const soldOut = program.status === "sold_out";
  const formatLabel =
    program.format === "live_cohort" ? "Live cohort" : "Self-paced";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: program.short_description,
    provider: {
      "@type": "Organization",
      name: "Lami the Migrant CEO",
      sameAs: siteUrl,
    },
    offers: {
      "@type": "Offer",
      category: formatLabel,
      price: program.price_gbp,
      priceCurrency: "GBP",
      availability: soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: `${siteUrl}/programs/${program.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section background="shell" className="!pb-10">
        <Link href="/programs" className="text-sm text-muted no-underline hover:text-clay">
          ← All programs
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[3fr_2fr]">
          {/* Left: details */}
          <div>
            <h1>{program.name}</h1>
            <p className="mt-4 text-muted">{program.full_description}</p>

            <h3 className="mt-10">What you get</h3>
            <ul className="mt-4 space-y-3">
              {program.what_you_get.map((item) => (
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
                <dd className="mt-1">{program.duration || "See details"}</dd>
              </div>
              <div>
                <dt className="label">Starts</dt>
                <dd className="mt-1">
                  {program.start_date
                    ? new Date(program.start_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Anytime"}
                </dd>
              </div>
              <div>
                <dt className="label">Who it is for</dt>
                <dd className="mt-1">{program.who_for[0]}</dd>
              </div>
            </dl>
          </div>

          {/* Right: sticky buy card */}
          <div>
            <div className="rounded-card border border-line bg-peach-deep p-6 md:sticky md:top-24">
              <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-input bg-peach">
                {program.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={program.cover_image}
                    alt={program.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-3xl text-ink/40">
                    {program.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                {program.compare_at_gbp && (
                  <span className="text-muted line-through">
                    {formatGBP(program.compare_at_gbp)}
                  </span>
                )}
                <span className="price !text-[32px]">
                  {formatGBP(program.price_gbp)}
                </span>
              </div>

              {program.start_date && (
                <p className="mt-1 text-sm text-muted">
                  Next start{" "}
                  {new Date(program.start_date).toLocaleDateString("en-GB", {
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
                    <ProgramWaitlist
                      programId={program.id}
                      programName={program.name}
                    />
                  </div>
                ) : (
                  <BuyButton
                    programId={program.id}
                    label={`Join for ${formatGBP(program.price_gbp)}`}
                  />
                )}
              </div>
              <p className="mt-3 text-[13px] text-muted">
                Secure card payment. Instant access by email.
              </p>
              <ApplyForm programId={program.id} programName={program.name} />
            </div>
          </div>
        </div>
      </Section>

      {/* Curriculum */}
      <Section background="peach">
        <h2>What we cover.</h2>
        <div className="mt-8 max-w-prose">
          <Accordion
            items={program.what_you_get.map((w, i) => ({
              title: `Module ${i + 1}`,
              body: w,
            }))}
          />
        </div>
      </Section>

      {/* Testimonials for this program */}
      {testimonials.length > 0 && (
        <Section background="shell">
          <h2>Women who did this program.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section background="peach">
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
            <span className="price">{formatGBP(program.price_gbp)}</span>
            <BuyButton
              programId={program.id}
              label="Join now"
              className="flex-1"
            />
          </div>
        </div>
      )}
    </>
  );
}
