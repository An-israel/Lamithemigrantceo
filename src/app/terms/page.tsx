import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service and refund policy.",
};

export default async function TermsPage() {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose">
        <h1>Terms</h1>
        <p className="mt-2 text-sm text-muted">{c("terms.notice")}</p>

        <h3 className="mt-8">Products and access</h3>
        <p className="mt-2 text-muted">{c("terms.access")}</p>

        <h3 className="mt-8">Refund policy</h3>
        <p className="mt-2 text-muted">{c("terms.refund")}</p>

        <h3 className="mt-8">Wholesale orders</h3>
        <p className="mt-2 text-muted">{c("terms.wholesale")}</p>
      </div>
    </Section>
  );
}
