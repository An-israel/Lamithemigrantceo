import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Lami the Migrant CEO handles your data.",
};

export default async function PrivacyPage() {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose">
        <h1>Privacy policy</h1>
        <p className="mt-2 text-sm text-muted">{c("privacy.notice")}</p>

        <h3 className="mt-8">What we collect</h3>
        <p className="mt-2 text-muted">{c("privacy.collect")}</p>

        <h3 className="mt-8">How we use it</h3>
        <p className="mt-2 text-muted">{c("privacy.use")}</p>

        <h3 className="mt-8">Analytics</h3>
        <p className="mt-2 text-muted">{c("privacy.analytics")}</p>

        <h3 className="mt-8">Your rights</h3>
        <p className="mt-2 text-muted">{c("privacy.rights")}</p>
      </div>
    </Section>
  );
}
