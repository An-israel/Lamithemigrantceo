import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Lami the Migrant CEO handles your data.",
};

export default function PrivacyPage() {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose">
        <h1>Privacy policy</h1>
        <p className="mt-2 text-sm text-muted">
          {/* TODO(lami): replace this placeholder with copy from a solicitor
              or a UK-compliant template service before launch. */}
          Placeholder — to be reviewed by a solicitor before launch.
        </p>

        <h3 className="mt-8">What we collect</h3>
        <p className="mt-2 text-muted">
          When you contact us or buy a program we collect your name, email, and
          any details you choose to share. Payments are handled by Stripe; we do
          not store your card details.
        </p>

        <h3 className="mt-8">How we use it</h3>
        <p className="mt-2 text-muted">
          To reply to you, deliver what you bought, and — only if you opt in —
          send occasional emails about new programs. You can unsubscribe at any
          time.
        </p>

        <h3 className="mt-8">Analytics</h3>
        <p className="mt-2 text-muted">
          We measure page visits without cookies and without storing your IP
          address, so there is no tracking that would require a consent banner.
        </p>

        <h3 className="mt-8">Your rights</h3>
        <p className="mt-2 text-muted">
          You can ask us to show, correct, or delete the data we hold about you.
          Email the address on our contact page.
        </p>
      </div>
    </Section>
  );
}
