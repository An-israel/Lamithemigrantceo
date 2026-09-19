import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getVentures } from "@/lib/ventures";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "The Ecosystem",
  description:
    "GBG Wholesale Hub, African Women Builds, GBG Academy, Build Her Empire Live and future ventures.",
};

// Copy lives in contentRegistry.ts (ecosystem.N.*), only routing stays here.
const PARTS = [
  { id: "wholesale", href: "/wholesale" },
  { id: "movement", href: "/movement" },
  { id: "academy", href: "/products" },
  { id: "build-her-empire", href: "/events/build-her-empire-live-2026" },
];

export default async function EcosystemPage() {
  const [ventures, siteContent] = await Promise.all([getVentures(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);
  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <p className="label text-gold-soft">The Ecosystem</p>
          <h1 className="mt-3 text-shell">
            One founder. <span className="text-gold-soft">A whole ecosystem.</span>
          </h1>
          <p className="mt-4 text-shell/80">{c("ecosystem.subtext")}</p>
        </div>
      </Section>

      {PARTS.map((part, i) => {
        const rowBg = (["shell", "clay", "shell", "gold"] as const)[i % 4];
        const dark = rowBg === "clay";
        const bodyClass =
          rowBg === "clay" ? "mt-4 text-shell/70" : rowBg === "gold" ? "mt-4 text-ink/75" : "mt-4 text-muted";
        return (
        <Section key={part.id} id={part.id} background={rowBg}>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className={i % 2 === 0 ? "" : "md:order-2"}>
              <h2>{c(`ecosystem.${i}.name`)}</h2>
              <p className={bodyClass}>{c(`ecosystem.${i}.body`)}</p>
              <ButtonLink
                href={part.href}
                className={dark ? "mt-6 border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft" : "mt-6"}
              >
                {c(`ecosystem.${i}.cta`)}
              </ButtonLink>
            </div>
            <div
              className={`aspect-[4/3] w-full overflow-hidden rounded-card bg-peach-deep ${
                i % 2 === 0 ? "" : "md:order-1"
              }`}
            >
              {/* TODO(lami): image for {part}. */}
              <div className="flex h-full items-center justify-center font-display text-2xl text-ink/40">
                {c(`ecosystem.${i}.name`)}
              </div>
            </div>
          </div>
        </Section>
        );
      })}

      {/* Future ventures — do not publish confidential concepts early (§6.5) */}
      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <p className="label text-clay">Future Ventures</p>
          <h2 className="mt-3">{c("ecosystem.futureventures.heading")}</h2>
          <p className="mt-4 text-muted">{c("ecosystem.futureventures.subtext")}</p>
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
