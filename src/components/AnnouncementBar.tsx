import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

/**
 * Sitewide announcement strip. Controlled from /admin/settings. When on it
 * sits above the header in --clay.
 */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  if (!settings.announcement_enabled || !settings.announcement_message) {
    return null;
  }

  const content = (
    <span className="text-shell">{settings.announcement_message}</span>
  );

  return (
    <div className="bg-clay text-center text-sm font-medium">
      <div className="mx-auto max-w-content px-5 py-2 md:px-10">
        {settings.announcement_link ? (
          <Link href={settings.announcement_link} className="text-shell no-underline hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
