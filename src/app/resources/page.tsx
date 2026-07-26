import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getResources } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free guides and The Build Letter — practical business, wealth and legacy insights.",
};

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <Section background="peach">
        <div className="max-w-prose">
          <p className="label text-clay">Resources</p>
          <h1 className="mt-3">Free tools to help you build.</h1>
          <p className="mt-4 text-muted">
            Practical guides you can use today, plus The Build Letter for
            ongoing insights. Grab what you need.
          </p>
        </div>
      </Section>

      <Section background="shell">
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((r) => (
            <div key={r.id} className="card flex flex-col p-6">
              <h3>{r.title}</h3>
              <p className="mt-2 flex-1 text-muted">{r.description}</p>
              {r.file_url ? (
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary mt-4 w-fit text-sm"
                >
                  Download
                </a>
              ) : (
                <span className="mt-4 text-sm text-muted">
                  Sign up below to get this free.
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* The Build Letter */}
      <Section background="ink">
        <div className="mx-auto max-w-prose text-center">
          <p className="label text-gold-soft">The Build Letter</p>
          <h2 className="mt-3 text-shell">Get the guides and the insights.</h2>
          <p className="mt-4 text-shell/80">
            Join The Build Letter and I&rsquo;ll send practical business, wealth
            and legacy insights — and the free resources above.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm cta="Join The Build Letter" />
          </div>
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>Prefer to read?</h2>
          <p className="mt-4 text-muted">
            The Build Journal has longer articles on business, migration and
            wealth.
          </p>
          <div className="mt-6">
            <Link href="/journal" className="font-bold text-clay">
              Read The Build Journal →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
