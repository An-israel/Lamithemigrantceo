import type { MetadataRoute } from "next";
import { getPrograms } from "@/lib/data";
import { getBundles } from "@/lib/wholesale";
import { getJournalPosts } from "@/lib/content";
import { getEvents } from "@/lib/events";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [programs, bundles, posts, events] = await Promise.all([
    getPrograms(),
    getBundles(),
    getJournalPosts(),
    getEvents(),
  ]);

  const staticRoutes = [
    "",
    "/start-here",
    "/about",
    "/movement",
    "/ecosystem",
    "/work-with-lami",
    "/speaking",
    "/events",
    "/impact",
    "/resources",
    "/journal",
    "/media",
    "/contact",
    "/start",
    "/wholesale",
    "/programs",
    "/privacy",
    "/cookies",
    "/terms",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  const programRoutes = programs.map((p) => ({
    url: `${base}/programs/${p.slug}`,
    lastModified: new Date(),
  }));
  const bundleRoutes = bundles.map((b) => ({
    url: `${base}/wholesale/${b.slug}`,
    lastModified: new Date(),
  }));
  const journalRoutes = posts.map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(),
  }));
  const eventRoutes = events.map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...programRoutes,
    ...bundleRoutes,
    ...journalRoutes,
    ...eventRoutes,
  ];
}
