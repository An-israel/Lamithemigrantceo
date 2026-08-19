import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/Section";
import { TicketButton } from "@/components/TicketButton";
import { formatGBP } from "@/lib/format";
import { getEventBySlug, getEvents, isEventOver } from "@/lib/events";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const e = await getEventBySlug(params.slug);
  if (!e) return { title: "Event not found" };
  return {
    title: e.name,
    description: e.tagline,
    alternates: { canonical: `/events/${e.slug}` },
    openGraph: {
      title: e.name,
      description: e.tagline,
      images: e.cover_image ? [e.cover_image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

function formatWhen(iso: string | null) {
  if (!iso) return "Date to be announced";
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();

  const isPast = event.status === "past" || isEventOver(event);
  const soldOut =
    !isPast &&
    (event.status === "sold_out" ||
      (event.capacity != null && event.tickets_sold >= event.capacity));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.tagline,
    startDate: event.starts_at,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? { "@type": "Place", name: event.location }
      : undefined,
    offers: {
      "@type": "Offer",
      price: event.price_gbp,
      priceCurrency: "GBP",
      availability: soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section background="ink" className="!pb-12">
        <Link href="/events" className="text-sm text-shell/60 no-underline hover:text-gold-soft">
          ← All events
        </Link>
        <p className="label mt-6 text-gold-soft">{formatWhen(event.starts_at)}</p>
        <h1 className="mt-2 text-shell">{event.name}</h1>
        <p className="mt-4 max-w-prose text-shell/80">{event.tagline}</p>
        {event.location && (
          <p className="mt-2 text-shell/60">📍 {event.location}</p>
        )}
      </Section>

      <Section background="shell">
        <div className="grid gap-10 md:grid-cols-[3fr_2fr]">
          <div className="max-w-prose">
            <h2>About the day.</h2>
            <div className="mt-4 space-y-4 text-muted">
              {event.description.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-card border border-line bg-peach-deep p-6 md:sticky md:top-24">
              <div className="flex items-baseline gap-3">
                {event.compare_at_gbp && (
                  <span className="text-muted line-through">
                    {formatGBP(event.compare_at_gbp)}
                  </span>
                )}
                <span className="price !text-[32px]">{formatGBP(event.price_gbp)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">per ticket</p>

              <div className="mt-5">
                {isPast ? (
                  <span className="pill bg-line text-muted">This event has passed</span>
                ) : soldOut ? (
                  <span className="pill bg-jade text-shell">Sold out</span>
                ) : (
                  <TicketButton eventId={event.id} label={`Get your ticket · ${formatGBP(event.price_gbp)}`} />
                )}
              </div>
              <p className="mt-3 text-[13px] text-muted">
                Secure card payment. Your ticket and joining details arrive by email.
              </p>
              {event.capacity != null && !soldOut && !isPast && (
                <p className="mt-2 text-[13px] text-muted">
                  {Math.max(0, event.capacity - event.tickets_sold)} of {event.capacity} places left
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
