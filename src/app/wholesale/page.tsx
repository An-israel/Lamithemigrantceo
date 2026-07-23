import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { WholesaleFilter } from "@/components/WholesaleFilter";
import { getBundles } from "@/lib/wholesale";

export const metadata: Metadata = {
  title: "GBG Wholesale Hub",
  description:
    "Buy vetted jewelry and accessory bundles at wholesale and resell at a margin you can see.",
};

export default async function WholesalePage() {
  const bundles = await getBundles();

  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <h1 className="text-shell">Buy the stock. Sell it on.</h1>
          <p className="mt-4 text-shell/80">
            Wholesale bundles of jewelry and accessories, vetted to sell. Every
            bundle shows the typical resale value up front, so you know your
            margin before you buy. Restocked monthly.
          </p>
        </div>
      </Section>

      <Section background="shell">
        <WholesaleFilter bundles={bundles} />
      </Section>
    </>
  );
}
