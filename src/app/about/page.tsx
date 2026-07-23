import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Lami",
  description:
    "From a £200 order to a warehouse. The story behind Lami the Migrant CEO.",
};

const TIMELINE = [
  { year: "2019", text: "Arrived in the UK. Agency shifts, no plan." },
  { year: "2021", text: "First £200 jewelry order. Sold out in a weekend." },
  { year: "2022", text: "Started teaching what worked to five women." },
  { year: "2024", text: "GBG Wholesale Hub opens to students." },
  { year: "2025", text: "Warehouse keys, on my birthday." },
];

const PULL_QUOTES = [
  "I did not have a network. I had £200 and a lot of stubbornness.",
  "The first order taught me more than a year of watching other people.",
  "Teaching it made me better at doing it.",
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <Section background="peach" className="!pb-10 md:!pb-16">
        <h1>From a £200 order to a warehouse.</h1>
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-card bg-peach-deep">
          {/* TODO(lami): replace with a wide 16:9 photo of Lami. */}
          <div className="flex h-full items-center justify-center text-ink/50">
            Photo of Lami
          </div>
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose">
          <p>
            When I moved to the UK, the plan was simple and it was wrong: work
            hard, save, and one day things would open up. The shifts paid the
            rent. They did not build anything that was mine.
          </p>

          <PullQuote>{PULL_QUOTES[0]}</PullQuote>

          <p>
            My first order was £200 of mixed jewelry. I got the pricing wrong, I
            got the packaging wrong, and I still made my money back in a
            weekend. That weekend told me everything. The gap between me and the
            people I admired was not money or luck. It was a first order.
          </p>

          <PullQuote>{PULL_QUOTES[1]}</PullQuote>

          <p>
            Women started asking how I did it. I showed five of them. They sold
            out too. That is when it clicked that the thing I actually had was
            not a jewelry business — it was a way in for people who were told to
            wait their turn.
          </p>

          <PullQuote>{PULL_QUOTES[2]}</PullQuote>

          <p>
            Now I run programs, a wholesale hub, and a community of women who are
            building the same way. This is what I am building next, and I would
            like you in it.
          </p>
        </div>

        {/* TIMELINE */}
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

      {/* STATS BAND — TODO(lami): confirm real numbers */}
      <Section background="ink">
        <div className="grid gap-10 text-center md:grid-cols-3">
          {[
            ["120+", "Students taught"],
            ["4,000+", "Orders shipped"],
            ["5", "Years in business"],
          ].map(([figure, label]) => (
            <div key={label}>
              <p className="font-display text-5xl font-bold text-peach">
                {figure}
              </p>
              <p className="label mt-2 text-shell/70">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>Start with what you have.</h2>
          <p className="mt-4 text-muted">
            One honest conversation about where you are and what to do next.
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

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-10 font-display text-2xl font-medium leading-snug text-clay md:text-[32px]">
      {children}
    </p>
  );
}
