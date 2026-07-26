import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getVentures } from "@/lib/ventures";

export const metadata: Metadata = {
  title: "The Ecosystem",
  description:
    "GBG Wholesale Hub, African Women Builds, GBG Academy, Build Her Empire Live and future ventures.",
};

const PARTS = [
  {
    id: "wholesale",
    name: "GBG Wholesale Hub",
    body: "Wholesale inventory and product opportunities for resellers and product-business owners. Buy stock, know your margin, and sell it on.",
    cta: "Visit the Wholesale Hub",
    href: "/wholesale",
  },
  {
    id: "movement",
    name: "African Women Builds",
    body: "A community and movement helping African women build businesses, wealth and legacy — together, not in isolation.",
    cta: "Join the Movement",
    href: "/movement",
  },
  {
    id: "academy",
    name: "GBG Academy",
    body: "Practical business education for people starting and growing product businesses. Real steps from someone who has done it.",
    cta: "Explore Programmes",
    href: "/programs",
  },
  {
    id: "build-her-empire",
    name: "Build Her Empire Live",
    body: "The flagship in-person experience for ambitious African women business owners. Liverpool, 15 August 2026.",
    cta: "View the Event",
    href: "/events/build-her-empire-live-2026",
  },
];

export default async function EcosystemPage() {
  const ventures = await getVentures();
  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <p className="label text-gold-soft">The Ecosystem</p>
          <h1 className="mt-3 text-shell">One founder. A whole ecosystem.</h1>
          <p className="mt-4 text-shell/80">
            Education, wholesale, community and live events — connected pieces
            built to move African women from income to ownership.
          </p>
        </div>
      </Section>

      {PARTS.map((part, i) => (
        <Section key={part.id} id={part.id} background={i % 2 === 0 ? "shell" : "peach"}>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className={i % 2 === 0 ? "" : "md:order-2"}>
              <h2>{part.name}</h2>
              <p className="mt-4 text-muted">{part.body}</p>
              <ButtonLink href={part.href} className="mt-6">
                {part.cta}
              </ButtonLink>
            </div>
            <div
              className={`aspect-[4/3] w-full overflow-hidden rounded-card bg-peach-deep ${
                i % 2 === 0 ? "" : "md:order-1"
              }`}
            >
              {/* TODO(lami): image for {part.name}. */}
              <div className="flex h-full items-center justify-center font-display text-2xl text-ink/40">
                {part.name}
              </div>
            </div>
          </div>
        </Section>
      ))}

      {/* Future ventures — do not publish confidential concepts early (§6.5) */}
      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <p className="label text-clay">Future Ventures</p>
          <h2 className="mt-3">More is being built.</h2>
          <p className="mt-4 text-muted">
            New businesses and innovation projects will appear here when they are
            ready for public launch.
          </p>
        </div>
        {ventures.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {ventures.map((v) => (
              <div key={v.id} className="card p-6">
                <div className="flex items-center justify-between">
                  <h3>{v.name}</h3>
                  <span className="pill bg-peach text-ink text-xs capitalize">
                    {v.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-muted">{v.summary}</p>
                {v.link && (
                  <a href={v.link} className="mt-3 inline-block font-bold text-clay">
                    Learn more →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
