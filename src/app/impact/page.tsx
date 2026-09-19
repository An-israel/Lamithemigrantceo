import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ProofGallery } from "@/components/ProofGallery";
import { getTestimonials, getSiteContent } from "@/lib/data";
import { getImpactStats } from "@/lib/content";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Over 500 people directly supported, impact approaching 1,000. Real numbers and real business stories.",
};

// Copy lives in contentRegistry.ts (impact.outcomes.N)
const OUTCOME_INDEXES = [0, 1, 2, 3];

export default async function ImpactPage() {
  const [stats, testimonials, siteContent] = await Promise.all([
    getImpactStats(),
    getTestimonials(),
    getSiteContent(),
  ]);
  const c = (key: string) => content(siteContent, key);

  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <p className="label text-gold-soft">Impact</p>
          <h1 className="mt-3 text-shell">
            The <span className="text-gold-soft">proof</span> behind the story.
          </h1>
          <p className="mt-4 text-shell/80">{c("impact.subtext")}</p>
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
        <h2>{c("impact.outcomes.heading")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {OUTCOME_INDEXES.map((i) => (
            <div key={i} className="card flex gap-3 p-6">
              <span className="text-clay" aria-hidden>✓</span>
              <p>{c(`impact.outcomes.${i}`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Human stories */}
      <Section background="clay">
        <h2>{c("impact.stories.heading")}</h2>
        <p className="mt-2 text-sm text-shell/70">{c("impact.stories.subtext")}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        <h3 className="mt-14">{c("impact.messages.heading")}</h3>
        <p className="mt-2 text-sm text-shell/70">{c("impact.messages.subtext")}</p>
        <div className="mt-6">
          <ProofGallery />
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>{c("impact.finalcta.heading")}</h2>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/start-here">Start Here</ButtonLink>
            <ButtonLink href="/ecosystem" variant="secondary">See the ecosystem</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
