import type { Metadata } from "next";
import Image from "next/image";
import { getBioLinks } from "@/lib/content";
import { getSettings, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";
import { BioLinkCard } from "@/components/BioLinkCard";
import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Links",
  description: "Everywhere to find Lami the Migrant CEO.",
  robots: { index: true, follow: true },
};

/**
 * Permanent social-bio landing page (§9). Replaces Beacons. Every link is
 * CMS-managed from /admin/links and click-tracked. Links are grouped by
 * style into fixed sections regardless of sort_order, so the page always
 * reads as a proper storefront rather than a flat list.
 */
export default async function StartLinksPage() {
  const [links, settings, siteContent] = await Promise.all([getBioLinks(), getSettings(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);

  const quickLinks = links.filter((l) => l.style === "simple");
  const products = links.filter((l) => l.style === "product" && l.product);
  const resources = links.filter((l) => l.style === "resource" && l.resource);
  const banners = links.filter((l) => l.style === "banner");

  const ig = settings.instagram_handle
    ? `https://instagram.com/${settings.instagram_handle}`
    : null;
  const tt = settings.tiktok_handle
    ? `https://tiktok.com/@${settings.tiktok_handle}`
    : null;

  return (
    <div className="min-h-screen bg-ink px-5 py-8 text-shell">
      <div className="mx-auto flex max-w-md flex-col gap-9">
        {/* HEADER */}
        <div className="flex flex-col items-center gap-3.5">
          <div className="mt-1.5 h-[108px] w-[108px] rounded-full bg-gradient-to-br from-gold-soft to-gold p-[3px]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-ink">
              {settings.founder_portrait_url ? (
                <Image
                  src={settings.founder_portrait_url}
                  alt="Lami the Migrant CEO"
                  width={108}
                  height={108}
                  priority
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-4xl font-semibold text-gold-soft">L</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-[30px] font-bold tracking-tight">LAMI</span>
            <span className="label text-gold-soft">The Migrant CEO</span>
          </div>

          <p className="max-w-[270px] text-center text-sm leading-relaxed text-shell/80">
            {c("start.tagline")}
          </p>

          {(ig || tt) && (
            <div className="mt-0.5 flex gap-2.5">
              {ig && <SocialIcon href={ig} label="Instagram" icon="instagram" />}
              {tt && <SocialIcon href={tt} label="TikTok" icon="tiktok" />}
            </div>
          )}
        </div>

        {/* QUICK LINKS */}
        {quickLinks.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {quickLinks.map((link) => (
              <BioLinkCard key={link.id} link={link} />
            ))}
          </div>
        )}

        {/* SHOP MY PRODUCTS */}
        {products.length > 0 && (
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Shop" title="My products." />
            <div className="flex flex-col gap-3.5">
              {products.map((link) => (
                <BioLinkCard key={link.id} link={link} />
              ))}
            </div>
          </div>
        )}

        {/* FREE RESOURCES */}
        {resources.length > 0 && (
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Free tools" title="Free resources." />
            <div className="flex flex-col gap-3.5">
              {resources.map((link) => (
                <BioLinkCard key={link.id} link={link} />
              ))}
            </div>
          </div>
        )}

        {/* PROMO BANNERS */}
        {banners.length > 0 && (
          <div className="flex flex-col gap-3">
            {banners.map((link) => (
              <BioLinkCard key={link.id} link={link} />
            ))}
          </div>
        )}

        {/* NEWSLETTER */}
        <div className="flex flex-col gap-3.5 rounded-[20px] border border-shell/10 bg-shell/[0.045] px-5 py-6">
          <div className="text-center">
            <div className="font-display text-lg font-semibold">{c("start.newsletter.heading")}</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-shell/65">
              {c("start.newsletter.subtext")}
            </p>
          </div>
          <NewsletterForm
            theme="dark"
            cta="Subscribe"
            buttonClassName="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
          />
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center gap-4 border-t border-shell/10 pt-6">
          {tt && (
            <a
              href={tt}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-shell/20 px-5 py-2.5 no-underline"
            >
              <TikTokGlyph />
              <span className="text-[13px] font-bold text-shell">Follow on TikTok</span>
            </a>
          )}
          <a href="/" className="label text-gold-soft">
            lamithemigrantceo.uk
          </a>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label text-gold-soft">{eyebrow}</span>
      <span className="font-display text-[22px] font-semibold text-shell">{title}</span>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "instagram" | "tiktok";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-shell/20"
    >
      {icon === "instagram" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f8f6f0" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="#f8f6f0" stroke="none" />
        </svg>
      ) : (
        <TikTokGlyph />
      )}
    </a>
  );
}

function TikTokGlyph() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f8f6f0"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4v10.4a3.6 3.6 0 1 1-3-3.55" />
      <path d="M14 4c.6 2.4 2.2 4 5 4.2" />
    </svg>
  );
}
