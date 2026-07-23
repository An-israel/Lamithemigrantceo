import { ButtonLink } from "@/components/Button";
import { Section } from "@/components/Section";
import { Receipt } from "@/components/Receipt";
import { ProgramCard } from "@/components/ProgramCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { getPrograms, getTestimonials, getSettings } from "@/lib/data";

export default async function HomePage() {
  const [programs, testimonials, settings] = await Promise.all([
    getPrograms(),
    getTestimonials(),
    getSettings(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="bg-shell">
        <div className="mx-auto grid max-w-content items-center gap-12 px-5 py-16 md:grid-cols-[55fr_45fr] md:px-10 md:py-24">
          <div>
            <p className="label">UK product business coach</p>
            <h1 className="mt-4">
              {settings.hero_headline || "I started with £200."}
              <span className="mt-2 block text-clay">
                You can start with less than you think.
              </span>
            </h1>
            <p className="prose-measure mt-6 text-muted">
              {settings.hero_paragraph}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/programs" fullWidthMobile>
                See the programs
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary" fullWidthMobile>
                Watch her story
              </ButtonLink>
            </div>
            <p className="mt-8 text-sm text-muted">
              9,500+ on TikTok · 3 live programs · UK wholesale hub
            </p>
          </div>

          <div className="pb-8">
            <Receipt
              items={settings.receipt_items ?? undefined}
              resold={settings.receipt_resold_gbp ?? undefined}
              note={settings.receipt_note ?? undefined}
            />
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <Section background="peach">
        <h2>You moved here to build something.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              h: "You have a job but not a future",
              b: "The shifts pay the bills. They do not build anything that is yours.",
            },
            {
              h: "You tried selling and it stalled",
              b: "You posted, you bought stock, and then it went quiet. You are not sure why.",
            },
            {
              h: "You have £200 and no idea where to put it",
              b: "You are ready to start. You just need the exact next step, not more theory.",
            },
          ].map((c) => (
            <div key={c.h} className="card p-6">
              <h3>{c.h}</h3>
              <p className="mt-2 text-muted">{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* PROGRAMS */}
      <Section background="shell">
        <div className="flex items-end justify-between gap-4">
          <h2>Three ways to work with me.</h2>
          <ButtonLink href="/programs" variant="secondary" className="hidden sm:inline-flex">
            See all programs
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {programs.slice(0, 3).map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </Section>

      {/* RESULTS */}
      <Section background="peach">
        <h2>What they built.</h2>
        <div className="mt-10 flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </Section>

      {/* WHOLESALE STRIP */}
      <Section background="ink">
        <div className="max-w-prose">
          <h2 className="text-shell">GBG Wholesale Hub</h2>
          <p className="mt-4 text-shell/80">
            Buy vetted jewelry and accessory bundles at wholesale, then resell
            them at a margin you can see before you buy. Restocked monthly.
          </p>
          <div className="mt-8">
            <ButtonLink
              href="/wholesale"
              variant="secondary"
              className="border-peach text-peach hover:bg-peach hover:text-ink"
            >
              See this month&rsquo;s bundles
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>Start with what you have.</h2>
          <p className="mt-4 text-muted">
            One honest conversation about where you are and what to do next. No
            pressure, no pitch.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href={settings.calendly_url || "/contact"}>
              Book a free 15 minute call
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
