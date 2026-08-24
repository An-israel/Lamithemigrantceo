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
    <span className="inline-flex items-center gap-2 text-shell">
      {settings.announcement_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.announcement_image_url}
          alt=""
          className="h-5 w-5 shrink-0 rounded-full object-cover"
        />
      )}
      {settings.announcement_message}
    </span>
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
