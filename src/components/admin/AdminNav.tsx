"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

type Item = { href: string; label: string };
type Group = { id: string; label: string; items: Item[] };

// Grouped by relatedness into 5 collapsible sections.
const GROUPS: Group[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    id: "people",
    label: "People & Enquiries",
    items: [
      { href: "/admin/enquiries", label: "Enquiries" },
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/members", label: "Members" },
      { href: "/admin/students", label: "Students" },
    ],
  },
  {
    id: "content",
    label: "Content & Site",
    items: [
      { href: "/admin/journal", label: "Journal" },
      { href: "/admin/resources", label: "Resources" },
      { href: "/admin/links", label: "Links" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/impact", label: "Impact" },
    ],
  },
  {
    id: "sell",
    label: "Sell & Events",
    items: [
      { href: "/admin/programs", label: "Programs" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/wholesale", label: "Wholesale" },
      { href: "/admin/orders", label: "Orders" },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem & Settings",
    items: [
      { href: "/admin/ventures", label: "Ventures" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

// Five most-used sections for the mobile bottom bar.
const MOBILE: Item[] = [
  { href: "/admin", label: "Home" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function activeGroupId(pathname: string): string {
  const g = GROUPS.find((grp) => grp.items.some((i) => isActive(pathname, i.href)));
  return g?.id ?? "overview";
}

export function AdminNav() {
  const pathname = usePathname();
  // Start with the group containing the current page open.
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({
    [activeGroupId(pathname)]: true,
  }));

  // Keep the active group expanded as you navigate between sections.
  useEffect(() => {
    const id = activeGroupId(pathname);
    setOpen((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, [pathname]);

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink text-shell md:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/admin" className="mb-6 no-underline">
            <span className="font-display text-xl font-bold text-shell">LAMI</span>
            <span className="label block text-gold-soft">Control room</span>
          </Link>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {GROUPS.map((group) => {
              const isOpen = !!open[group.id];
              const groupActive = group.items.some((i) => isActive(pathname, i.href));
              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggle(group.id)}
                    aria-expanded={isOpen}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-input px-3 py-2 text-left text-sm font-bold transition-colors",
                      groupActive ? "text-shell" : "text-shell/70 hover:text-shell"
                    )}
                  >
                    <span>{group.label}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className={clsx(
                        "transition-transform duration-300",
                        isOpen ? "rotate-90" : "rotate-0"
                      )}
                    >
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Smoothly collapsing content via the grid-rows 0fr→1fr trick */}
                  <div
                    className={clsx(
                      "grid transition-all duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="mb-1 ml-2 space-y-0.5 border-l border-shell/15 pl-2 pt-0.5">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                              "block rounded-input px-3 py-2 text-sm no-underline",
                              isActive(pathname, item.href)
                                ? "border-l-2 border-clay bg-shell/10 text-shell"
                                : "text-shell/60 hover:text-shell"
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <Link
            href="/"
            className="mt-4 shrink-0 text-sm text-shell/60 no-underline hover:text-shell"
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
