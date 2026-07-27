import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = {
  title: "The Story Behind The Migrant CEO",
  description:
    "Temitope Olamide Oni Mole — known publicly as Lami the Migrant CEO — entrepreneur, educator, speaker and community builder.",
};

// §6.2 timeline
const TIMELINE = [
  {
    year: "Nigeria",
    text: "Built and ran businesses; developed experience in sales, sourcing, marketing and customer service.",
  },
  { year: "2022", text: "Moved to the United Kingdom and began rebuilding." },
  { year: "The restart", text: "Started a UK business journey with less than £200." },
  { year: "Growth", text: "Expanded into education, wholesale, content and community." },
  { year: "Warehouse era", text: "Established a physical wholesale operation in Liverpool." },
  { year: "2026", text: "Launched African Women Builds and Build Her Empire Live." },
  {
    year: "The future",
    text: "Building a global movement around business ownership, assets and legacy.",
  },
];

const PULL_QUOTES = [
  "I rebuilt my life, so you can build yours.",
  "Migrants do not have to abandon their ambition when they move countries.",
  "Business ownership is the beginning. Wealth and legacy are the destination.",
];

export default function AboutPage() {
  return (
    <>
      <Section background="peach" className="!pb-10 md:!pb-16">
        <p className="label text-clay">About Lami</p>
        <h1 className="mt-3">The Story Behind The Migrant CEO</h1>
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-card bg-peach-deep">
          {/* TODO(lami): wide 16:9 founder portrait. */}
          <div className="flex h-full items-center justify-center text-ink/50">
            Founder portrait
          </div>
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose">
          <p className="text-lg">
            Temitope Olamide Oni Mole, known publicly as Lami the Migrant CEO, is
            an entrepreneur, educator, speaker and community builder.
          </p>

          <p className="mt-6 text-muted">
            Her entrepreneurial life began in Nigeria, where she built and ran
            businesses and learned the real work of sales, sourcing, marketing
            and looking after customers. It was hands-on, practical experience —
            not theory.
          </p>

          <PullQuote>{PULL_QUOTES[0]}</PullQuote>

          <p className="text-muted">
            In 2022 she moved to the United Kingdom. Migration meant rebuilding
            identity, income and opportunity from the ground up. She started her
            UK business journey with less than £200 — and treated that
            constraint as a starting line, not a ceiling.
          </p>

          <p className="mt-4 text-muted">
            From there she built product businesses, taught other entrepreneurs,
            formed communities and moved into a physical warehouse operation in
            Liverpool. Along the way, helping African women build wealth became
            bigger than business coaching.
          </p>

          <PullQuote>{PULL_QUOTES[1]}</PullQuote>

          <p className="text-muted">
            Her belief is simple: migrants do not have to shrink their dream to
            fit a new country. The long-term vision is to become the leading
            global voice helping African women migrants build businesses and
            generational wealth.
          </p>

          <PullQuote>{PULL_QUOTES[2]}</PullQuote>
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-16 max-w-prose border-l border-line pl-6">
          {TIMELINE.map((entry, i) => (
            <div key={entry.year} className="relative pb-8 last:pb-0">
              <span className="label text-clay">
                {String(i + 1).padStart(2, "0")} · {entry.year}
              </span>
              <p className="mt-1 font-medium">{entry.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats band — §4 verified facts, brief wording */}
      <Section background="ink">
        <div className="grid gap-10 text-center md:grid-cols-3">
          {[
            ["500+", "directly supported"],
            ["~24,000", "combined followers"],
            ["10+ years", "in business"],
          ].map(([figure, label]) => (
            <div key={label}>
              <p className="font-display text-5xl font-bold text-gold-soft">{figure}</p>
              <p className="label mt-2 text-shell/70">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-shell/50">
          Over 500 people directly supported; total impact approaching 1,000.
        </p>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>Your next chapter can start here.</h2>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/start-here">Start Here</ButtonLink>
            <ButtonLink href="/work-with-lami" variant="secondary">
              Work With Me
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-10 font-display text-2xl font-medium leading-snug text-clay md:text-[32px]">
      {children}
    </p>
  );
}
