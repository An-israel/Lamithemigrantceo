import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ProductFilter } from "@/components/ProductFilter";
import { Accordion } from "@/components/Accordion";
import { getProducts, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Three ways to work with Lami: live cohorts, self-paced, and 1:1 mentorship.",
};

export default async function ProductsPage() {
  const [products, siteContent] = await Promise.all([getProducts(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);

  return (
    <>
      <Section background="ink">
        <p className="label text-gold-soft">Products</p>
        <h1 className="mt-3">
          Three ways to <span className="text-gold-soft">work with Lami.</span>
        </h1>
        <p className="mt-4 max-w-prose text-shell/80">{c("products.subtext")}</p>
      </Section>

      <Section background="shell">
        <ProductFilter products={products} />
      </Section>

      <Section background="clay">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z"
                stroke="var(--gold-soft)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="mt-4 text-shell">{c("products.feature.0.h")}</h3>
            <p className="mt-2 text-sm text-shell/70">{c("products.feature.0.b")}</p>
          </div>
          <div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 3v18h18M7 15l4-5 3 3 5-7"
                stroke="var(--gold-soft)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="mt-4 text-shell">{c("products.feature.1.h")}</h3>
            <p className="mt-2 text-sm text-shell/70">{c("products.feature.1.b")}</p>
          </div>
          <div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="var(--gold-soft)" strokeWidth="1.5" />
              <path
                d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
                stroke="var(--gold-soft)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <h3 className="mt-4 text-shell">{c("products.feature.2.h")}</h3>
            <p className="mt-2 text-sm text-shell/70">{c("products.feature.2.b")}</p>
          </div>
        </div>
      </Section>

      <Section background="gold">
        <div className="mx-auto max-w-prose">
          <h2>{c("products.faq.heading")}</h2>
          <div className="mt-8">
            <Accordion
              items={[
                { title: c("products.faq.0.q"), body: c("products.faq.0.a") },
                { title: c("products.faq.1.q"), body: c("products.faq.1.a") },
                { title: c("products.faq.2.q"), body: c("products.faq.2.a") },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
