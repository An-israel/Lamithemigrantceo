import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types";

/**
 * True once the event's end (or start, if no end time is set) has passed —
 * independent of the manually-set `status` field, so a live event stops
 * selling tickets on its own the moment it's over instead of relying on an
 * admin remembering to flip it to "past".
 */
export function isEventOver(event: Pick<EventItem, "starts_at" | "ends_at">) {
  const end = event.ends_at || event.starts_at;
  if (!end) return false;
  return new Date(end).getTime() < Date.now();
}

export const SEED_EVENTS: EventItem[] = [
  {
    id: "e-seed-1",
    created_at: new Date().toISOString(),
    slug: "build-her-empire-live-2026",
    name: "Build Her Empire Live",
    tagline:
      "The flagship in-person experience for ambitious African women business owners.",
    description:
      "A full day of practical business building, community and momentum with Lami and guests. Come with a business idea or a business — leave with a plan, a network and a next step.",
    cover_image: null,
    location: "Liverpool, UK",
    starts_at: "2026-08-15T09:00:00.000Z",
    ends_at: null,
    price_gbp: 47,
    compare_at_gbp: null,
    capacity: 150,
    tickets_sold: 0,
    status: "live",
    sort_order: 1,
  },
];

export async function getEvents(): Promise<EventItem[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .neq("status", "draft")
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) return data as EventItem[];
  } catch {
    /* fall through */
  }
  return SEED_EVENTS;
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) return data as EventItem;
  } catch {
    /* fall through */
  }
  return SEED_EVENTS.find((e) => e.slug === slug) ?? null;
}
