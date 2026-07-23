"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { CartButton } from "@/components/cart/CartButton";
import type { SiteSettings } from "@/lib/types";

const NAV = [
  { href: "/programs", label: "Programs" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="no-underline leading-none">
      <span className="block font-display font-bold text-[22px] text-ink">
        LAMI
      </span>
      <span className="label block">The Migrant CEO</span>
    </Link>
  );
}

export function Header({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const bookCall = settings.calendly_url || "/contact";

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-line bg-shell">
      <div className="mx-auto flex h-full max-w-content items-center justify-between px-5 md:px-10">
        <Wordmark />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`no-underline font-medium ${
                pathname.startsWith(item.href) ? "text-clay" : "text-ink"
              } hover:text-clay`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <CartButton />
          <ButtonLink href={bookCall}>Book a call</ButtonLink>
        </div>

        <div className="flex items-center md:hidden">
          <CartButton />
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-input"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
          <span className="sr-only">Open menu</span>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-peach md:hidden">
          <div className="flex h-[72px] items-center justify-between px-5">
            <Wordmark onClick={() => setOpen(false)} />
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-input"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav
            className="flex flex-1 flex-col gap-6 px-5 pt-8"
            aria-label="Mobile"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="h2 no-underline text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-5">
            <ButtonLink href={bookCall} fullWidthMobile>
              Book a call
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
