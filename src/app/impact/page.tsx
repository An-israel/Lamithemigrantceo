import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ProofGallery } from "@/components/ProofGallery";
import { getTestimonials } from "@/lib/data";
import { getImpactStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Over 500 people directly supported, impact approaching 1,000. Real numbers and real business stories.",
};

const OUTCOMES = [
  "Businesses started after viewers watched Lami's livestreams and educational videos.",
  "Course and mentorship outcomes across starting and scaling.",
  "Wholesale customers who have launched or expanded product businesses.",
  "Community member stories shared inside African Women Builds.",
];

export default async function ImpactPage() {
  const [stats, testimonials] = await Promise.all([
    getImpactStats(),
    getTestimonials(),
  ]);

  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <p className="label text-gold-soft">Impact</p>
          <h1 className="mt-3 text-shell">The proof behind the story.</h1>
          <p className="mt-4 text-shell/80">
            Numbers matter, but so do the people behind them. Over 500 people
            directly supported, with total impact approaching 1,000.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className="text-center">
              <p className="font-display text-3xl font-bold text-gold-soft md:text-4xl">
                {s.figure}
              </p>
              <p className="label mt-1 text-shell/70">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Outcomes */}
      <Section background="shell">
        <h2>What that support turns into.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {OUTCOMES.map((o) => (
            <div key={o} className="card flex gap-3 p-6">
              <span className="text-clay" aria-hidden>✓</span>
              <p>{o}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Human stories */}
      <Section background="peach">
        <h2>In their words.</h2>
        <p className="mt-2 text-sm text-muted">
          Real businesses. Real sales. Real results.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        <h3 className="mt-14">The real messages.</h3>
        <p className="mt-2 text-sm text-muted">
          Unedited proof, straight from the community.
        </p>
        <div className="mt-6">
          <ProofGallery />
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>Be the next story.</h2>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/start-here">Start Here</ButtonLink>
            <ButtonLink href="/ecosystem" variant="secondary">See the ecosystem</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
