import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How Lami the Migrant CEO uses cookies and storage.",
};

export default async function CookiesPage() {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose">
        <h1>Cookie policy</h1>
        <p className="mt-2 text-sm text-muted">{c("cookies.notice")}</p>

        <h3 className="mt-8">The short version</h3>
        <p className="mt-2 text-muted">{c("cookies.shortversion")}</p>

        <h3 className="mt-8">Essential storage</h3>
        <p className="mt-2 text-muted">{c("cookies.storage")}</p>

        <h3 className="mt-8">Third parties</h3>
        <p className="mt-2 text-muted">{c("cookies.thirdparties")}</p>

        <h3 className="mt-8">Your choice</h3>
        <p className="mt-2 text-muted">{c("cookies.choice")}</p>
      </div>
    </Section>
  );
}
