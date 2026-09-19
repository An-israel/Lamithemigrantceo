import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getTestimonials, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Speaking",
  description:
    "Book Lami to inspire action, not just applause. Keynotes on migration, rebuilding, business, wealth and legacy.",
};

// §6.7 speaking topics — copy lives in contentRegistry.ts (speaking.topics.N)
const TOPIC_INDEXES = [0, 1, 2, 3, 4, 5, 6];

export default async function SpeakingPage() {
  const [testimonials, siteContent] = await Promise.all([getTestimonials(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);

  return (
    <>
      <Section background="ink">
        <div className="max-w-3xl">
          <p className="label text-gold-soft">Speaking</p>
          <h1 className="mt-3 text-shell">
            Book Lami to <span className="text-gold-soft">Inspire Action</span>, not Just Applause.
          </h1>
          <p className="mt-4 text-shell/80">{c("speaking.subtext")}</p>
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
          {TOPIC_INDEXES.map((i) => {
            const t = c(`speaking.topics.${i}`);
            return (
            <div
              key={i}
              className="group flex gap-4 rounded-card border border-clay bg-clay p-6 transition-colors hover:border-gold hover:bg-gold"
            >
              <span className="label text-gold-soft group-hover:text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-display text-lg text-shell group-hover:text-ink">{t}</p>
                <Link
                  href={`/contact?type=speaking&note=${encodeURIComponent(
                    `I'd like to request a recording of a past talk: "${t}".`
                  )}`}
                  className="mt-2 inline-block text-sm text-gold-soft no-underline hover:underline group-hover:text-clay"
                >
                  Request a recording →
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      </Section>

      {/* Experience + audience */}
      <Section background="gold">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2>Experience.</h2>
            <ul className="mt-6 space-y-3 text-ink/75">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-clay" aria-hidden>✓</span>
                  {c(`speaking.experience.${i}`)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Right for audiences of.</h2>
            <ul className="mt-6 space-y-3 text-ink/75">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-clay" aria-hidden>✓</span>
                  {c(`speaking.audience.${i}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section background="shell">
          <h2>What audiences say.</h2>
          <p className="mt-2 text-sm text-muted">
            Real results from the people Lami has taught and mentored.
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
          <h2 className="text-shell">{c("speaking.cta.heading")}</h2>
          <p className="mt-4 text-shell/80">{c("speaking.cta.subtext")}</p>
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
