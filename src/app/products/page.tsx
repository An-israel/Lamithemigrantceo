import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ProductFilter } from "@/components/ProductFilter";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Three ways to work with Lami: live cohorts, self-paced, and 1:1 mentorship.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <Section background="shell">
      <h1>Products.</h1>
      <p className="mt-4 max-w-prose text-muted">
        Every product is built for the same person: someone starting a real
        product business in the UK on a small budget.
      </p>
      <div className="mt-10">
        <ProductFilter products={products} />
      </div>
    </Section>
  );
}
