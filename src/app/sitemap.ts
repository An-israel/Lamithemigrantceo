import type { MetadataRoute } from "next";
import { getPrograms } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const programs = await getPrograms();

  const staticRoutes = [
    "",
    "/programs",
    "/wholesale",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const programRoutes = programs.map((p) => ({
    url: `${base}/programs/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...programRoutes];
}
