import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { JoinForm } from "@/components/JoinForm";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "The Movement",
  description:
    "African women build more than businesses. The vision and manifesto behind African Women Builds.",
};

// Copy lives in contentRegistry.ts (movement.beliefs.N.*)
const BELIEF_INDEXES = [0, 1, 2, 3, 4, 5];

export default async function MovementPage() {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  return (
    <>
      <Section background="gold">
        <div className="max-w-3xl">
          <p className="label text-clay">The Movement</p>
          <h1 className="mt-3">
            African Women Build <span className="text-clay">More Than Businesses</span>
          </h1>
          <p className="mt-4 text-ink/75">{c("movement.subtext")}</p>
        </div>
      </Section>

      <Section background="shell">
        <div className="grid gap-6 md:grid-cols-2">
          {BELIEF_INDEXES.map((i) => (
            <div key={i} className="card p-6">
              <h3>{c(`movement.beliefs.${i}.h`)}</h3>
              <p className="mt-2 text-muted">{c(`movement.beliefs.${i}.b`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Manifesto banner (§6.4 pull quote) */}
      <Section background="ink">
        <p className="mx-auto max-w-3xl text-center font-display text-2xl font-medium leading-snug text-shell md:text-3xl">
          {c("movement.manifesto")}
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

      <Section background="gold" id="join">
        <div className="mx-auto max-w-prose text-center">
          <h2>{c("movement.join.heading")}</h2>
          <p className="mt-4 text-ink/75">{c("movement.join.subtext")}</p>
        </div>
        <div className="mt-8">
          <JoinForm />
        </div>
      </Section>
    </>
  );
}
