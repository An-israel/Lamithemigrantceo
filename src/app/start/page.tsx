import type { Metadata } from "next";
import { getBioLinks } from "@/lib/content";
import { getSettings } from "@/lib/data";
import { BioLinkButton } from "@/components/BioLinkButton";

export const metadata: Metadata = {
  title: "Links",
  description: "Everywhere to find Lami the Migrant CEO.",
  robots: { index: true, follow: true },
};

/**
 * Permanent social-bio landing page (§9). Replaces Beacons. Every link is
 * CMS-managed from /admin/links and click-tracked.
 */
export default async function StartLinksPage() {
  const [links, settings] = await Promise.all([getBioLinks(), getSettings()]);

  const ig = settings.instagram_handle
    ? `https://instagram.com/${settings.instagram_handle}`
    : null;
  const tt = settings.tiktok_handle
    ? `https://tiktok.com/@${settings.tiktok_handle}`
    : null;

  return (
    <div className="min-h-screen bg-ink px-5 py-16 text-shell">
      <div className="mx-auto max-w-md text-center">
        <span className="font-display text-3xl font-bold">LAMI</span>
        <span className="label mt-1 block text-gold-soft">The Migrant CEO</span>
        <p className="mt-4 text-shell/80">
          Build the Business. Build the Wealth. Build the Legacy.
        </p>

        <div className="mt-10 space-y-3">
          {links.map((link) => (
            <BioLinkButton key={link.id} link={link} />
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-5 text-sm">
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" className="text-shell/70 no-underline hover:text-gold-soft">
              Instagram
            </a>
          )}
          {tt && (
            <a href={tt} target="_blank" rel="noopener noreferrer" className="text-shell/70 no-underline hover:text-gold-soft">
              TikTok
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
