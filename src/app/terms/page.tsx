import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service and refund policy.",
};

export default function TermsPage() {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose">
        <h1>Terms</h1>
        <p className="mt-2 text-sm text-muted">
          {/* TODO(lami): replace with reviewed copy before launch. */}
          Placeholder — to be reviewed by a solicitor before launch.
        </p>

        <h3 className="mt-8">Programs and access</h3>
        <p className="mt-2 text-muted">
          When you buy a program you get access to its materials as described on
          its page. Live cohort dates are shown before you pay.
        </p>

        <h3 className="mt-8">Refund policy</h3>
        <p className="mt-2 text-muted">
          Because programs give instant digital access, they are non-refundable
          once accessed, except where required by UK consumer law. If something
          is wrong, contact us and we will make it right. This policy is also
          shown at checkout.
        </p>

        <h3 className="mt-8">Wholesale orders</h3>
        <p className="mt-2 text-muted">
          Physical bundles are covered by our shipping and returns terms, shown
          on each product page.
        </p>
      </div>
    </Section>
  );
}
