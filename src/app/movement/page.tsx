import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = {
  title: "The Movement",
  description:
    "African women build more than businesses. The vision and manifesto behind African Women Builds.",
};

const BELIEFS = [
  {
    h: "Ownership is freedom",
    b: "Business ownership is a route to choice and economic freedom — not just extra income.",
  },
  {
    h: "Build together",
    b: "African women should collaborate rather than build in isolation. Collective effort compounds.",
  },
  {
    h: "Income to ownership",
    b: "Move from earning to owning: businesses, property, investments, gold and other assets.",
  },
  {
    h: "Outlive the founder",
    b: "Build companies and opportunities that keep creating value after the founder steps back.",
  },
  {
    h: "Be a visible example",
    b: "Create proof the next generation can see, so the path is obvious for those coming behind.",
  },
  {
    h: "Migrate without shrinking",
    b: "Starting again in a new country does not mean reducing the size of the dream.",
  },
];

export default function MovementPage() {
  return (
    <>
      <Section background="peach">
        <div className="max-w-3xl">
          <p className="label text-clay">The Movement</p>
          <h1 className="mt-3">African Women Build More Than Businesses</h1>
          <p className="mt-4 text-muted">
            This is the bigger idea behind the brand and African Women Builds. A
            manifesto, not a sales page.
          </p>
        </div>
      </Section>

      <Section background="shell">
        <div className="grid gap-6 md:grid-cols-2">
          {BELIEFS.map((b) => (
            <div key={b.h} className="card p-6">
              <h3>{b.h}</h3>
              <p className="mt-2 text-muted">{b.b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Manifesto banner (§6.4 pull quote) */}
      <Section background="ink">
        <p className="mx-auto max-w-3xl text-center font-display text-2xl font-medium leading-snug text-shell md:text-3xl">
          We are not building businesses simply to survive. We are building
          businesses that create choices, acquire assets, employ people and
          leave legacies.
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink
            href="/movement#join"
            className="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
          >
            Join the Movement
          </ButtonLink>
        </div>
      </Section>

      <Section background="shell" id="join">
        <div className="mx-auto max-w-prose text-center">
          <h2>Build with us.</h2>
          <p className="mt-4 text-muted">
            African Women Builds is where this happens together. Add your name
            and we&rsquo;ll tell you the next step.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/contact?type=general">Join African Women Builds</ButtonLink>
            <ButtonLink href="/ecosystem" variant="secondary">
              See the ecosystem
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
