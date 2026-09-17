"use client";

import { useEffect } from "react";
import { Section } from "@/components/Section";
import { Button, ButtonLink } from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose text-center">
        <p className="label text-clay">Something went wrong</p>
        <h1 className="mt-3">That didn&rsquo;t load right.</h1>
        <p className="prose-measure mx-auto mt-4 text-muted">
          Sorry about that — an unexpected error happened. Try again, or head
          back home.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} fullWidthMobile>
            Try again
          </Button>
          <ButtonLink href="/" variant="secondary" fullWidthMobile>
            Back to home
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
