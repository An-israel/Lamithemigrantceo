import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Speaking",
  description:
    "Book Lami to inspire action — not just applause. Keynotes on migration, rebuilding, business, wealth and legacy.",
};

// §6.7 speaking topics
const TOPICS = [
  "Starting Again Without Starting Small: Rebuilding After Migration",
  "From Less Than £200 to a Business Ecosystem",
  "The Truth About Building a Product-Based Business in the UK",
  "How African Women Can Build Businesses, Wealth and Legacy",
  "Community, Collaboration and the Power of Collective Buying",
  "Building a Personal Brand That Creates Business Opportunities",
  "From Business Income to Asset Ownership",
];

export default async function SpeakingPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Section background="ink">
        <div className="max-w-3xl">
          <p className="label text-gold-soft">Speaking</p>
          <h1 className="mt-3 text-shell">
            Book Lami to Inspire Action — not Just Applause.
          </h1>
          <p className="mt-4 text-shell/80">
            A credible speaker with a real story and practical expertise, for
            audiences of ambitious founders, migrants and women building
            businesses.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/contact?type=speaking"
              className="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
            >
              Enquire about speaking
            </ButtonLink>
            <ButtonLink
              href="/media"
              variant="secondary"
              className="border-shell text-shell hover:bg-shell hover:text-ink"
            >
              Download headshot &amp; bio
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Topics */}
      <Section background="shell">
        <h2>Signature talks.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {TOPICS.map((t, i) => (
            <div key={t} className="card flex gap-4 p-6">
              <span className="label text-clay">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-display text-lg">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Experience + audience */}
      <Section background="peach">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2>Experience.</h2>
            <ul className="mt-6 space-y-3 text-muted">
              <li className="flex gap-3">
                <span className="text-clay" aria-hidden>✓</span>
                Speaker at Enry Live and Direct in Birmingham, organised by OREP Limited.
              </li>
              <li className="flex gap-3">
                <span className="text-clay" aria-hidden>✓</span>
                Founder and host of Build Her Empire Live, Liverpool, 15 August 2026.
              </li>
              <li className="flex gap-3">
                <span className="text-clay" aria-hidden>✓</span>
                10+ years building and running businesses across Nigeria and the UK.
              </li>
            </ul>
          </div>
          <div>
            <h2>Right for audiences of.</h2>
            <ul className="mt-6 space-y-3 text-muted">
              <li className="flex gap-3"><span className="text-clay" aria-hidden>✓</span>African women migrants and diaspora communities</li>
              <li className="flex gap-3"><span className="text-clay" aria-hidden>✓</span>Aspiring and early-stage founders</li>
              <li className="flex gap-3"><span className="text-clay" aria-hidden>✓</span>Universities, councils and entrepreneurship programmes</li>
              <li className="flex gap-3"><span className="text-clay" aria-hidden>✓</span>Women&rsquo;s empowerment and enterprise events</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section background="shell">
          <h2>What audiences say.</h2>
          <p className="mt-2 text-sm text-muted">
            {/* TODO(lami): replace with real event testimonials + video clips. */}
            Placeholder testimonials — swap for real event feedback before launch.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <blockquote key={t.id} className="card p-6">
                <p>&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 font-bold">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Booking CTA */}
      <Section background="ink">
        <div className="mx-auto max-w-prose text-center">
          <h2 className="text-shell">Bring Lami to your stage.</h2>
          <p className="mt-4 text-shell/80">
            Tell me about your event, audience and date and I&rsquo;ll come back
            with availability and options.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink
              href="/contact?type=speaking"
              className="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
            >
              Enquire about speaking
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
