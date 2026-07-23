import type { MetadataRoute } from "next";
import { getPrograms } from "@/lib/data";
import { getBundles } from "@/lib/wholesale";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [programs, bundles] = await Promise.all([getPrograms(), getBundles()]);

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

  const bundleRoutes = bundles.map((b) => ({
    url: `${base}/wholesale/${b.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...programRoutes, ...bundleRoutes];
}
