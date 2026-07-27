import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = {
  title: "Work With Lami",
  description:
    "Speaking, business strategy, brand partnerships, media and institutional partnerships.",
};

const WAYS = [
  {
    h: "Speaking",
    b: "Keynotes, panels, workshops and fireside conversations.",
    href: "/speaking",
    cta: "See speaking topics",
  },
  {
    h: "Business strategy",
    b: "Selected private sessions, VIP days or advisory work, subject to availability.",
    href: "/contact?type=consulting",
    cta: "Enquire about strategy",
  },
  {
    h: "Brand partnerships",
    b: "Relevant partnerships across business, finance, migration, technology, e-commerce and women's empowerment.",
    href: "/contact?type=partnerships",
    cta: "Partnership enquiry",
  },
  {
    h: "Media and podcasts",
    b: "Interviews, commentary and founder-story features.",
    href: "/contact?type=media",
    cta: "Media enquiry",
  },
  {
    h: "Community & institutional partnerships",
    b: "Universities, councils, charities, migrant organisations and entrepreneurship programmes.",
    href: "/contact?type=partnerships",
    cta: "Institutional enquiry",
  },
];

export default function WorkWithLamiPage() {
  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <p className="label text-gold-soft">Work With Lami</p>
          <h1 className="mt-3 text-shell">Let&rsquo;s build something worth building.</h1>
          <p className="mt-4 text-shell/80">
            Founder-level experience across business, migration and community —
            available for the right speaking, advisory and partnership work.
          </p>
        </div>
      </Section>

      <Section background="shell">
        <div className="grid gap-6 md:grid-cols-2">
          {WAYS.map((w) => (
            <div key={w.h} className="card flex flex-col p-6">
              <h3>{w.h}</h3>
              <p className="mt-2 flex-1 text-muted">{w.b}</p>
              <Link href={w.href} className="mt-4 font-bold text-clay no-underline">
                {w.cta} →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section background="peach">
        <div className="mx-auto max-w-prose text-center">
          <h2>Have something specific in mind?</h2>
          <p className="mt-4 text-muted">
            Tell me what you&rsquo;re planning and I&rsquo;ll come back with the
            right next step.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/contact">Send an enquiry</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
