import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
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
      <div className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
        <div>
          <span className="block font-display text-[22px] font-bold">LAMI</span>
          <span className="label block text-peach-deep">The Migrant CEO</span>
          <p className="mt-4 max-w-xs text-shell/80">
            I help African migrants in the UK build profitable product
            businesses.
          </p>
        </div>

        <div>
          <p className="label mb-4 text-peach-deep">Explore</p>
          <ul className="space-y-2">
            {[
              ["/programs", "Programs"],
              ["/wholesale", "Wholesale"],
              ["/about", "About"],
              ["/contact", "Contact"],
              ["/my", "Student login"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-shell no-underline hover:text-peach-deep">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label mb-4 text-peach-deep">Stay close</p>
          <ul className="mb-6 flex gap-4">
            <li>
              <a href={ig} target="_blank" rel="noopener noreferrer" className="text-shell no-underline hover:text-peach-deep">
                Instagram
              </a>
            </li>
            <li>
              <a href={tt} target="_blank" rel="noopener noreferrer" className="text-shell no-underline hover:text-peach-deep">
                TikTok
              </a>
            </li>
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="text-shell no-underline hover:text-peach-deep">
                WhatsApp
              </a>
            </li>
          </ul>
          <p className="mb-2 text-shell/80">Get the free starter list</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-shell/15">
        <div className="mx-auto flex max-w-content flex-col gap-2 px-5 py-6 text-sm text-shell/70 md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {year} Lami the Migrant CEO. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-shell/70 no-underline hover:text-shell">
              Privacy
            </Link>
            <Link href="/terms" className="text-shell/70 no-underline hover:text-shell">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
