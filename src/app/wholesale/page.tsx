import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { WholesaleFilter } from "@/components/WholesaleFilter";
import { getBundles } from "@/lib/wholesale";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "GBG Wholesale Hub",
  description:
    "Buy vetted jewelry and accessory bundles at wholesale and resell at a margin you can see.",
};

export default async function WholesalePage() {
  const [bundles, siteContent] = await Promise.all([getBundles(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);

  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <h1 className="text-shell">
            Buy the stock. <span className="text-gold-soft">Sell it on.</span>
          </h1>
          <p className="mt-4 text-shell/80">{c("wholesale.subtext")}</p>
        </div>
      </Section>

      <Section background="shell">
        <WholesaleFilter bundles={bundles} />
      </Section>
    </>
  );
}
