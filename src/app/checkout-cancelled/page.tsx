import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false },
};

export default function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const backHref = searchParams.product
    ? `/products/${searchParams.product}`
    : "/products";

  return (
    <Section background="shell">
      <div className="mx-auto max-w-prose text-center">
        <h1>Nothing was charged.</h1>
        <p className="mt-4 text-muted">
          You closed the checkout before paying, so your card was not touched.
          Whenever you are ready, your place is still here.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={backHref}>Back to the product</ButtonLink>
        </div>
      </div>
    </Section>
  );
}
