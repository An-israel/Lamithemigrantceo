"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CookieConsent } from "@/components/CookieConsent";

/**
 * Wraps the app in the public chrome (announcement bar, header, footer, cart,
 * cookie notice) — but renders NONE of it on /admin routes, which have their
 * own full-screen dashboard layout. Header/footer are passed in as props so
 * this client component can conditionally place server-rendered chrome.
 */
export function SiteFrame({
  header,
  footer,
  children,
  whatsappNumber,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
  whatsappNumber: string | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  // The /start link-in-bio page is intentionally bare too.
  const isBare = isAdmin || pathname === "/start";

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
      <CartDrawer whatsappNumber={whatsappNumber} />
      <CookieConsent />
    </CartProvider>
  );
}
