import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { createServiceClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "You are in",
  robots: { index: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const siteContent = await getSiteContent();
  const c = (key: string) => content(siteContent, key);

  const COPY: Record<
    "product" | "wholesale" | "unknown",
    { badge: string; title: string; body: string; primary: { href: string; label: string } }
  > = {
    product: {
      badge: "Payment received",
      title: "You are in.",
      body: c("thankyou.product.body"),
      primary: { href: "/my", label: "Go to my product" },
    },
    wholesale: {
      badge: "Order confirmed",
      title: "Your order is in.",
      body: c("thankyou.wholesale.body"),
      primary: { href: "/wholesale", label: "Keep browsing" },
    },
    unknown: {
      badge: "Payment received",
      title: "You are in.",
      body: c("thankyou.product.body"),
      primary: { href: "/my", label: "Go to my products" },
    },
  };

  // Event orders share the "product" shape of copy but point back at events.
  const EVENT_COPY = {
    badge: "Ticket confirmed",
    title: "Your ticket is booked.",
    body: c("thankyou.event.body"),
    primary: { href: "/events", label: "See other events" },
  };

  let order: Order | null = null;
  if (searchParams.session_id) {
    try {
      // Service role: an anonymous wholesale/event buyer has no session for
      // RLS to match, but the Stripe session id itself only ever reaches
      // someone who just completed that exact checkout.
      const supabase = createServiceClient();
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_session_id", searchParams.session_id)
        .maybeSingle();
      order = (data as Order) || null;
    } catch {
      order = null;
    }
  }

  const itemType = order?.item_type;
  const copy =
    itemType === "event"
      ? EVENT_COPY
      : itemType === "product" || itemType === "program"
        ? COPY.product
        : itemType === "wholesale"
          ? COPY.wholesale
          : COPY.unknown;

  return (
    <Section background="peach">
      <div className="mx-auto max-w-prose text-center">
        <span className="pill bg-jade text-shell">{copy.badge}</span>
        <h1 className="mt-6">{copy.title}</h1>
        <p className="mt-4 text-muted">{copy.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={copy.primary.href}>{copy.primary.label}</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
