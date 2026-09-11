import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ProductFilter } from "@/components/ProductFilter";
import { Accordion } from "@/components/Accordion";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Three ways to work with Lami: live cohorts, self-paced, and 1:1 mentorship.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <Section background="ink">
        <p className="label text-gold-soft">Products</p>
        <h1 className="mt-3">
          Three ways to <span className="text-gold-soft">work with Lami.</span>
        </h1>
        <p className="mt-4 max-w-prose text-shell/80">
          Every product is built for the same person: someone starting a real
          product business in the UK on a small budget.
        </p>
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
            <h3 className="mt-4 text-shell">Built from real experience</h3>
            <p className="mt-2 text-sm text-shell/70">
              Every module comes from what actually worked, not theory.
            </p>
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
            <h3 className="mt-4 text-shell">You work to your budget</h3>
            <p className="mt-2 text-sm text-shell/70">
              Start from around £200. Nothing here assumes deep pockets.
            </p>
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
            <h3 className="mt-4 text-shell">A community, not a course</h3>
            <p className="mt-2 text-sm text-shell/70">
              Every product plugs you into other women building the same thing.
            </p>
          </div>
        </div>
      </Section>

      <Section background="gold">
        <div className="mx-auto max-w-prose">
          <h2>Questions before you join.</h2>
          <div className="mt-8">
            <Accordion
              items={[
                {
                  title: "What if I have never sold anything?",
                  body: "That is exactly who this is built for. We start from your first order.",
                },
                {
                  title: "How much stock money do I need?",
                  body: "You can start from around £200. We work to your budget, not a fixed one.",
                },
                {
                  title: "Do I get access straight away?",
                  body: "Yes. Payment gives instant access by email to your student area.",
                },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
