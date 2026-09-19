import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getSettings, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Work With Lami",
  description:
    "Speaking, business strategy, brand partnerships, media and institutional partnerships.",
};

// Copy lives in contentRegistry.ts (workwithlami.N.*), only routing stays here.
const WAYS = [
  { href: "/speaking" },
  { href: "/contact?type=consulting" },
  { href: "/contact?type=partnerships" },
  { href: "/contact?type=media" },
  { href: "/contact?type=partnerships" },
];

export default async function WorkWithLamiPage() {
  const [settings, siteContent] = await Promise.all([getSettings(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);
  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <p className="label text-gold-soft">Work With Lami</p>
          <h1 className="mt-3 text-shell">
            Let&rsquo;s build something <span className="text-gold-soft">worth building</span>.
          </h1>
          <p className="mt-4 text-shell/80">{c("workwithlami.subtext")}</p>
        </div>
      </Section>

      <Section background="shell">
        <div className="grid gap-6 md:grid-cols-2">
          {WAYS.map((w, i) => (
            <div key={w.href + i} className="card flex flex-col p-6">
              <h3>{c(`workwithlami.${i}.h`)}</h3>
              <p className="mt-2 flex-1 text-muted">{c(`workwithlami.${i}.b`)}</p>
              <Link href={w.href} className="mt-4 font-bold text-clay no-underline">
                {c(`workwithlami.${i}.cta`)} →
              </Link>
              {i === 1 && settings.calendly_url && (
                <a
                  href={settings.calendly_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-muted underline"
                >
                  Or book a 1:1 call on Calendly →
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section background="gold">
        <div className="mx-auto max-w-prose text-center">
          <h2>{c("workwithlami.finalcta.heading")}</h2>
          <p className="mt-4 text-ink/75">{c("workwithlami.finalcta.subtext")}</p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/contact">Send an enquiry</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
