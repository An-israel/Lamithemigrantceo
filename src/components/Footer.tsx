import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import type { SiteSettings } from "@/lib/types";

const EXPLORE = [
  ["/start-here", "Start Here"],
  ["/about", "About Lami"],
  ["/movement", "The Movement"],
  ["/ecosystem", "The Ecosystem"],
  ["/impact", "Impact"],
];

const WORK = [
  ["/work-with-lami", "Work With Lami"],
  ["/speaking", "Speaking"],
  ["/events", "Events"],
  ["/media", "Media"],
  ["/resources", "Resources"],
  ["/journal", "The Build Journal"],
  ["/contact", "Contact"],
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const email = settings.public_email || "hello@lamithemigrantceo.com";
  const wa = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}`
    : "#";
  const ig = settings.instagram_handle
    ? `https://instagram.com/${settings.instagram_handle}`
    : "#";
  const tt = settings.tiktok_handle
    ? `https://tiktok.com/@${settings.tiktok_handle}`
    : "#";

  return (
    <footer className="bg-ink text-shell">
      <div className="mx-auto max-w-content px-5 py-16 md:px-10">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand + mission */}
          <div className="md:col-span-1">
            <span className="block font-display text-[22px] font-bold">LAMI</span>
            <span className="label block text-gold-soft">The Migrant CEO</span>
            <p className="mt-4 max-w-xs text-shell/80">
              Build the Business. Build the Wealth. Build the Legacy. Helping
              African women migrants build businesses and generational wealth.
            </p>
            <ul className="mt-6 flex gap-4">
              <li>
                <a href={ig} target="_blank" rel="noopener noreferrer" className="text-shell no-underline hover:text-gold-soft">
                  Instagram
                </a>
              </li>
              <li>
                <a href={tt} target="_blank" rel="noopener noreferrer" className="text-shell no-underline hover:text-gold-soft">
                  TikTok
                </a>
              </li>
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="text-shell no-underline hover:text-gold-soft">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <p className="label mb-4 text-gold-soft">Explore</p>
            <ul className="space-y-2">
              {EXPLORE.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-shell no-underline hover:text-gold-soft">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Work + more */}
          <div>
            <p className="label mb-4 text-gold-soft">Work &amp; more</p>
            <ul className="space-y-2">
              {WORK.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-shell no-underline hover:text-gold-soft">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The Build Letter */}
          <div>
            <p className="label mb-2 text-gold-soft">The Build Letter</p>
            <p className="mb-4 text-shell/80">
              Practical business, wealth and legacy insights. No fluff.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-shell/15">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-6 text-sm text-shell/70 md:px-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {year} Lami the Migrant CEO. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="text-shell/70 no-underline hover:text-shell">Privacy</Link>
              <Link href="/cookies" className="text-shell/70 no-underline hover:text-shell">Cookies</Link>
              <Link href="/terms" className="text-shell/70 no-underline hover:text-shell">Terms</Link>
              <a href={`mailto:${email}`} className="text-shell/70 no-underline hover:text-shell">{email}</a>
            </div>
          </div>
          {/* TODO(lami): confirm registered company name/number + address for the footer. */}
          <p className="text-shell/50">
            Lami the Migrant CEO is the home of African Women Builds and the GBG
            Wholesale Hub. Company details to be confirmed before launch.
          </p>
          <p className="text-right text-[10px] text-shell/30">
            Built by{" "}
            <a
              href="https://swiftcreator.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shell/30 no-underline hover:text-shell/60"
            >
              Swift Creator
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
