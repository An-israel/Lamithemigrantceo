import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageViewTracker } from "@/components/PageViewTracker";
import { CookieConsent } from "@/components/CookieConsent";
import { getSettings } from "@/lib/data";

// Variable font: when `axes` are set, `weight` must not be pinned — the wght
// axis stays variable and we pick 500 / 700 in CSS.
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-karla",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lami the Migrant CEO — Build the Business. Build the Wealth. Build the Legacy.",
    template: "%s · Lami the Migrant CEO",
  },
  description:
    "Helping African women migrants transform ambition into thriving businesses, financial freedom and generational wealth. Founder, educator, speaker and founder of African Women Builds.",
  openGraph: {
    title: "Lami the Migrant CEO",
    description:
      "Build the Business. Build the Wealth. Build the Legacy.",
    type: "website",
    locale: "en_GB",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="en-GB" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <AnnouncementBar settings={settings} />
          <Header settings={settings} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
        </CartProvider>
        <CookieConsent />
        <PageViewTracker />
      </body>
    </html>
  );
}
