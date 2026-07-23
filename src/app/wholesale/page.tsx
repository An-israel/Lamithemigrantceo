import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { formatGBP } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { WholesaleProduct } from "@/lib/types";

export const metadata: Metadata = {
  title: "GBG Wholesale Hub",
  description: "Buy vetted jewelry and accessory bundles at wholesale and resell at a margin you can see.",
};

const SEED_BUNDLES: WholesaleProduct[] = [
  {
    id: "w-seed-1",
    created_at: new Date().toISOString(),
    slug: "gold-starter-bundle",
    name: "Gold-tone Starter Bundle",
    description: "A tested mix of gold-tone pieces that sell fast.",
    whats_inside: "Necklaces, hoops, and stacking rings",
    unit_count: 24,
    price_gbp: 85,
    typical_resale_gbp: 240,
    stock: 12,
    category: "Jewelry",
    images: [],
    archived: false,
    sort_order: 1,
  },
  {
    id: "w-seed-2",
    created_at: new Date().toISOString(),
    slug: "everyday-accessories",
    name: "Everyday Accessories Box",
    description: "Hair clips, scrunchies and small accessories with quick turnover.",
    whats_inside: "Assorted accessories",
    unit_count: 40,
    price_gbp: 60,
    typical_resale_gbp: 160,
    stock: 0,
    category: "Accessories",
    images: [],
    archived: false,
    sort_order: 2,
  },
  {
    id: "w-seed-3",
    created_at: new Date().toISOString(),
    slug: "premium-jewelry-bundle",
    name: "Premium Jewelry Bundle",
    description: "Higher-margin statement pieces for an established shop.",
    whats_inside: "Statement necklaces and earrings",
    unit_count: 18,
    price_gbp: 140,
    typical_resale_gbp: 420,
    stock: 6,
    category: "Jewelry",
    images: [],
    archived: false,
    sort_order: 3,
  },
];

async function getBundles(): Promise<WholesaleProduct[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("wholesale_products")
      .select("*")
      .eq("archived", false)
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) return data as WholesaleProduct[];
  } catch {
    // fall through to seed
  }
  return SEED_BUNDLES;
}

function BundleCard({ b }: { b: WholesaleProduct }) {
  const soldOut = b.stock <= 0;
  const margin =
    b.typical_resale_gbp != null ? b.typical_resale_gbp - b.price_gbp : null;

  return (
    <article
      className={`card overflow-hidden ${soldOut ? "opacity-70" : ""}`}
    >
      <div className="flex aspect-square w-full items-center justify-center bg-peach-deep">
        <span className="font-display text-3xl text-ink/50">{b.name.charAt(0)}</span>
      </div>
      <div className="p-5">
        <h3>{b.name}</h3>
        <p className="mt-1 text-sm text-muted">{b.whats_inside}</p>
        <span className="pill mt-3 bg-peach text-ink">{b.unit_count} pieces</span>

        <div className="mt-4">
          <span className="price">{formatGBP(b.price_gbp)}</span>
          {b.typical_resale_gbp != null && (
            <p className="mt-1 text-[13px] text-muted">
              Typical resale {formatGBP(b.typical_resale_gbp)}
              {margin != null && (
                <span className="font-bold text-jade">
                  {" "}
                  · +{formatGBP(margin)}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="mt-5">
          {soldOut ? (
            <span className="pill bg-line text-muted">Sold out</span>
          ) : (
            <button className="btn btn-primary w-full">Add to order</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function WholesalePage() {
  const bundles = await getBundles();

  return (
    <>
      <Section background="ink">
        <div className="max-w-prose">
          <h1 className="text-shell">Buy the stock. Sell it on.</h1>
          <p className="mt-4 text-shell/80">
            Wholesale bundles of jewelry and accessories, vetted to sell. Every
            bundle shows the typical resale value up front, so you know your
            margin before you buy. Restocked monthly.
          </p>
        </div>
      </Section>

      <Section background="shell">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {bundles.map((b) => (
            <BundleCard key={b.id} b={b} />
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          Cart and checkout for wholesale ships in Release 2. For now, tap{" "}
          <a href="/contact">Contact</a> to place a bundle order.
        </p>
      </Section>
    </>
  );
}
