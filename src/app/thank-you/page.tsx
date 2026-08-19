import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { createServiceClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "You are in",
  robots: { index: false },
};

const COPY: Record<
  "program" | "wholesale" | "unknown",
  { badge: string; title: string; body: string; primary: { href: string; label: string } }
> = {
  program: {
    badge: "Payment received",
    title: "You are in.",
    body: "Your place is confirmed. Check your email for your receipt and joining details — if you do not see it in a few minutes, look in your spam folder or message Lami on WhatsApp.",
    primary: { href: "/my", label: "Go to my programme" },
  },
  wholesale: {
    badge: "Order confirmed",
    title: "Your order is in.",
    body: "Your payment went through and your bundle is being packed. Check your email for your receipt — tracking details follow once it ships.",
    primary: { href: "/wholesale", label: "Keep browsing" },
  },
  unknown: {
    badge: "Payment received",
    title: "You are in.",
    body: "Your place is confirmed. Check your email for your receipt and joining details — if you do not see it in a few minutes, look in your spam folder or message Lami on WhatsApp.",
    primary: { href: "/my", label: "Go to my programs" },
  },
};

// Event orders share the "program" shape of copy but point back at events.
const EVENT_COPY = {
  badge: "Ticket confirmed",
  title: "Your ticket is booked.",
  body: "Your payment went through and your place is booked. Check your email for your ticket and joining details — if you do not see it in a few minutes, look in your spam folder or message Lami on WhatsApp.",
  primary: { href: "/events", label: "See other events" },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
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
      : itemType === "program" || itemType === "wholesale"
        ? COPY[itemType]
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
