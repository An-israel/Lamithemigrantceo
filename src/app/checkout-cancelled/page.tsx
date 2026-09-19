import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false },
};

export default async function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);
  const backHref = searchParams.product
    ? `/products/${searchParams.product}`
    : "/products";

  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose text-center">
        <h1>{c("checkoutcancelled.heading")}</h1>
        <p className="mt-4 text-muted">{c("checkoutcancelled.body")}</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={backHref}>Back to the product</ButtonLink>
        </div>
      </div>
    </Section>
  );
}
