import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Start Here",
  description:
    "What are you here to build? Choose your path and get pointed to the right next step.",
};

// §6.3 — six pathways. Copy lives in contentRegistry.ts (starthere.N.*),
// only routing stays here.
const PATHS = [
  { href: "/products/the-200-starter" },
  { href: "/ecosystem#wholesale" },
  { href: "/movement" },
  { href: "/events" },
  { href: "/speaking" },
  { href: "/resources" },
];

export default async function StartHerePage() {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  return (
    <Section background="shell">
      <div className="mx-auto max-w-3xl text-center">
        <p className="label text-clay">Start Here</p>
        <h1 className="mt-3">
          What are you here to <span className="text-clay">build</span>?
        </h1>
        <p className="mt-4 text-muted">{c("starthere.subtext")}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4">
        {PATHS.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex items-center justify-between gap-4 rounded-card border border-clay bg-clay p-6 no-underline transition-colors hover:border-gold hover:bg-gold"
          >
            <div>
              <p className="font-display text-xl text-shell group-hover:text-ink">{c(`starthere.${i}.q`)}</p>
              <p className="mt-1 text-sm text-shell/70 group-hover:text-ink/70">{c(`starthere.${i}.to`)}</p>
            </div>
            <span className="shrink-0 font-bold text-gold-soft group-hover:text-clay">
              {c(`starthere.${i}.cta`)} →
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
