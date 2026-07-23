import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = {
  title: "You are in",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <Section background="peach">
      <div className="mx-auto max-w-prose text-center">
        <span className="pill bg-jade text-shell">Payment received</span>
        <h1 className="mt-6">You are in.</h1>
        <p className="mt-4 text-muted">
          Your place is confirmed. Check your email for your receipt and joining
          details — if you do not see it in a few minutes, look in your spam
          folder or message Lami on WhatsApp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/my">Go to my programs</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
