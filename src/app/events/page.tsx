import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { formatGBP } from "@/lib/format";
import { getEvents, isEventOver } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Build Her Empire Live and other in-person experiences for ambitious African women business owners.",
};

function formatWhen(iso: string | null) {
  if (!iso) return "Date to be announced";
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <Section background="shell">
      <p className="label text-clay">Events</p>
      <h1 className="mt-3">Build in the room.</h1>
      <p className="mt-4 max-w-prose text-muted">
        In-person experiences where African women build businesses, wealth and
        community together.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {events.map((e) => {
          const isPast = e.status === "past" || isEventOver(e);
          const soldOut =
            !isPast &&
            (e.status === "sold_out" ||
              (e.capacity != null && e.tickets_sold >= e.capacity));
          return (
            <Link
              key={e.id}
              href={`/events/${e.slug}`}
              className="card overflow-hidden no-underline transition-colors hover:border-clay"
            >
              <div className="flex aspect-[16/9] items-center justify-center bg-peach-deep">
                {e.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.cover_image} alt={e.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-2xl text-ink/40">{e.name}</span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-ink">{e.name}</h3>
                <p className="mt-1 text-sm text-muted">{formatWhen(e.starts_at)}{e.location ? ` · ${e.location}` : ""}</p>
                <p className="mt-3 text-muted">{e.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="price">{formatGBP(e.price_gbp)}</span>
                  {isPast ? (
                    <span className="pill bg-line text-muted">Past event</span>
                  ) : soldOut ? (
                    <span className="pill bg-jade text-shell">Sold out</span>
                  ) : (
                    <span className="font-bold text-clay">Get tickets →</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
