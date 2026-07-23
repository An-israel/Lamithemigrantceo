import { createClient } from "@/lib/supabase/server";
import type { WholesaleProduct } from "@/lib/types";

export const SEED_BUNDLES: WholesaleProduct[] = [
  {
    id: "w-seed-1",
    created_at: new Date().toISOString(),
    slug: "gold-starter-bundle",
    name: "Gold-tone Starter Bundle",
    description:
      "A tested mix of gold-tone pieces that sell fast — the bundle most students start with.",
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
    description:
      "Hair clips, scrunchies and small accessories with quick turnover and repeat buyers.",
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
    description:
      "Higher-margin statement pieces for an established shop with a warm audience.",
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

export async function getBundles(): Promise<WholesaleProduct[]> {
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

export async function getBundleBySlug(
  slug: string
): Promise<WholesaleProduct | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("wholesale_products")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) return data as WholesaleProduct;
  } catch {
    // fall through to seed
  }
  return SEED_BUNDLES.find((b) => b.slug === slug) ?? null;
}
