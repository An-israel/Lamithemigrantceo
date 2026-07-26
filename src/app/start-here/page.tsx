import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Start Here",
  description:
    "What are you here to build? Choose your path and get pointed to the right next step.",
};

// §6.3 — six pathways
const PATHS = [
  {
    q: "I want to start a business",
    to: "Beginner resources and the right programme or waitlist.",
    href: "/resources",
    cta: "Explore resources",
  },
  {
    q: "I already run a product business",
    to: "The GBG Wholesale Hub and growth support.",
    href: "/ecosystem#wholesale",
    cta: "Visit the Wholesale Hub",
  },
  {
    q: "I want community and collaboration",
    to: "African Women Builds — build alongside others.",
    href: "/movement",
    cta: "Join the Movement",
  },
  {
    q: "I want to attend an event",
    to: "Build Her Empire Live and future events.",
    href: "/ecosystem#build-her-empire",
    cta: "View the event",
  },
  {
    q: "I want to book Lami",
    to: "Speaking and working with Lami.",
    href: "/speaking",
    cta: "See speaking",
  },
  {
    q: "I want free business resources",
    to: "Free guides and The Build Letter newsletter.",
    href: "/resources",
    cta: "Get resources",
  },
];

export default function StartHerePage() {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-3xl text-center">
        <p className="label text-clay">Start Here</p>
        <h1 className="mt-3">What are you here to build?</h1>
        <p className="mt-4 text-muted">
          One simple question so you never feel lost. Pick what fits you and
          I&rsquo;ll point you to the right next step.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4">
        {PATHS.map((p) => (
          <Link
            key={p.q}
            href={p.href}
            className="card flex items-center justify-between gap-4 p-6 no-underline transition-colors hover:border-clay"
          >
            <div>
              <p className="font-display text-xl text-ink">{p.q}</p>
              <p className="mt-1 text-sm text-muted">{p.to}</p>
            </div>
            <span className="shrink-0 font-bold text-clay">{p.cta} →</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
