import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How Lami the Migrant CEO uses cookies and storage.",
};

export default function CookiesPage() {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose">
        <h1>Cookie policy</h1>
        <p className="mt-2 text-sm text-muted">
          {/* TODO(lami): have this reviewed against your final analytics/marketing
              tools before launch. */}
          Last updated on launch. Placeholder pending final review.
        </p>

        <h3 className="mt-8">The short version</h3>
        <p className="mt-2 text-muted">
          This website does not use advertising or cross-site tracking cookies.
          We use privacy-friendly, cookieless analytics that never store your IP
          address, so there is nothing that would require an intrusive consent
          gate.
        </p>

        <h3 className="mt-8">Essential storage</h3>
        <p className="mt-2 text-muted">
          We use small amounts of local storage in your browser to remember
          things like your cookie acknowledgement and the contents of your
          wholesale order. This information stays on your device.
        </p>

        <h3 className="mt-8">Third parties</h3>
        <p className="mt-2 text-muted">
          Payments are processed by Stripe and email by our newsletter provider;
          each has its own privacy and cookie policies. Embedded videos may set
          cookies from their host (for example YouTube) only when you play them.
        </p>

        <h3 className="mt-8">Your choice</h3>
        <p className="mt-2 text-muted">
          You can clear site storage at any time from your browser settings.
        </p>
      </div>
    </Section>
  );
}
