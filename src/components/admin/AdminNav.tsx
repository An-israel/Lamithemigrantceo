"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/links", label: "Links" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/wholesale", label: "Wholesale" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/ventures", label: "Ventures" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/impact", label: "Impact" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

// Five most-used sections for the mobile bottom bar.
const MOBILE = NAV.filter((n) =>
  ["/admin", "/admin/enquiries", "/admin/orders", "/admin/programs", "/admin/settings"].includes(
    n.href
  )
);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 bg-ink text-shell md:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/admin" className="mb-8 no-underline">
            <span className="font-display text-xl font-bold text-shell">
              LAMI
            </span>
            <span className="label block text-peach-deep">Control room</span>
          </Link>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block rounded-input px-3 py-2 text-sm no-underline",
                  isActive(pathname, item.href)
                    ? "border-l-2 border-clay bg-shell/10 text-shell"
                    : "text-shell/70 hover:text-shell"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="mt-auto text-sm text-shell/60 no-underline hover:text-shell"
          >
            ← View site
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-ink md:hidden">
        {MOBILE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex-1 py-3 text-center text-xs no-underline",
              isActive(pathname, item.href) ? "text-clay" : "text-shell/70"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
