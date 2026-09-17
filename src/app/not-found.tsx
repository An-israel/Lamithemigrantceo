import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose text-center">
        <p className="label text-clay">404</p>
        <h1 className="mt-3">We can&rsquo;t find that page.</h1>
        <p className="prose-measure mx-auto mt-4 text-muted">
          The page you&rsquo;re looking for may have moved or no longer
          exists. Here are a few places to pick back up.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" fullWidthMobile>
            Back to home
          </ButtonLink>
          <ButtonLink href="/start-here" variant="secondary" fullWidthMobile>
            Start Here
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
