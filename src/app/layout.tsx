import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
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
    default: "Lami the Migrant CEO — Start a profitable product business",
    template: "%s · Lami the Migrant CEO",
  },
  description:
    "I help African migrant women in the UK start a profitable product business on a small budget. Programs, wholesale bundles and 1:1 mentorship.",
  openGraph: {
    title: "Lami the Migrant CEO",
    description:
      "Start a profitable product business in the UK on a small budget.",
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
        <AnnouncementBar settings={settings} />
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
