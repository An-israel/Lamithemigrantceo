import { createClient } from "@/lib/supabase/server";
import type { JournalPost, BioLink, Resource, ImpactStat } from "@/lib/types";

// --- Impact stats ----------------------------------------------------------
export const SEED_IMPACT: ImpactStat[] = [
  { id: "s1", created_at: "", figure: "500+", label: "people directly supported", sort_order: 1 },
  { id: "s2", created_at: "", figure: "~24,000", label: "combined social followers", sort_order: 2 },
  { id: "s3", created_at: "", figure: "10+ years", label: "entrepreneurial experience", sort_order: 3 },
  { id: "s4", created_at: "", figure: "~1,000", label: "total impact (approaching)", sort_order: 4 },
];

export async function getImpactStats(): Promise<ImpactStat[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("impact_stats")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) return data as ImpactStat[];
  } catch {
    /* fall through */
  }
  return SEED_IMPACT;
}

// --- Resources / lead magnets ---------------------------------------------
export const SEED_RESOURCES: Resource[] = [
  { id: "r1", created_at: "", title: "UK product-business starter checklist", description: "The first steps to launch a product business in the UK.", file_url: null, requires_email: true, sort_order: 1, active: true },
  { id: "r2", created_at: "", title: "Product sourcing checklist", description: "How to find and vet suppliers without getting burned.", file_url: null, requires_email: true, sort_order: 2, active: true },
  { id: "r3", created_at: "", title: "How to validate a product before buying stock", description: "Test demand before you spend money on inventory.", file_url: null, requires_email: true, sort_order: 3, active: true },
  { id: "r4", created_at: "", title: "Business systems starter guide", description: "Simple systems so your business runs without you.", file_url: null, requires_email: true, sort_order: 4, active: true },
  { id: "r5", created_at: "", title: "Migration and business reinvention guide", description: "Rebuilding your business identity in a new country.", file_url: null, requires_email: true, sort_order: 5, active: true },
];

export async function getResources(): Promise<Resource[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) return data as Resource[];
  } catch {
    /* fall through */
  }
  return SEED_RESOURCES;
}

// --- The Build Journal (blog) ---------------------------------------------
export const SEED_JOURNAL: JournalPost[] = [
  {
    id: "j1",
    created_at: "",
    updated_at: "",
    slug: "starting-again-with-less-than-200",
    title: "Starting again with less than £200",
    excerpt: "What I learned rebuilding a business from almost nothing in a new country.",
    body: "When I moved to the UK in 2022, I had less than £200 to start with. Here is what I did first, what I got wrong, and what I would tell anyone starting again.\n\nThis is placeholder content — replace it from the admin Journal editor.",
    cover_image: null,
    category: "Migration",
    author: "Lami",
    published: true,
    published_at: new Date().toISOString(),
    sort_order: 1,
  },
  {
    id: "j2",
    created_at: "",
    updated_at: "",
    slug: "from-income-to-ownership",
    title: "From income to ownership",
    excerpt: "Why earning is only the beginning, and how to move toward assets.",
    body: "Income pays the bills. Ownership changes your family's future. Here is how I think about the move from one to the other.\n\nThis is placeholder content — replace it from the admin Journal editor.",
    cover_image: null,
    category: "Wealth",
    author: "Lami",
    published: true,
    published_at: new Date().toISOString(),
    sort_order: 2,
  },
];

export async function getJournalPosts(): Promise<JournalPost[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("journal_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (data && data.length > 0) return data as JournalPost[];
  } catch {
    /* fall through */
  }
  return SEED_JOURNAL;
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("journal_posts")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) return data as JournalPost;
  } catch {
    /* fall through */
  }
  return SEED_JOURNAL.find((p) => p.slug === slug) ?? null;
}

// --- Bio links (link-in-bio) ----------------------------------------------
export const SEED_BIO_LINKS: BioLink[] = [
  { id: "b1", created_at: "", label: "Start Here", url: "/start-here", description: "Find your path", sort_order: 1, active: true, clicks: 0 },
  { id: "b2", created_at: "", label: "GBG Wholesale Hub", url: "/wholesale", description: "Buy stock, sell it on", sort_order: 2, active: true, clicks: 0 },
  { id: "b3", created_at: "", label: "Join African Women Builds", url: "/movement", description: "The community", sort_order: 3, active: true, clicks: 0 },
  { id: "b4", created_at: "", label: "Book Lami to speak", url: "/speaking", description: "Speaking enquiries", sort_order: 4, active: true, clicks: 0 },
  { id: "b5", created_at: "", label: "The Build Letter", url: "/resources", description: "Free insights + guides", sort_order: 5, active: true, clicks: 0 },
];

export async function getBioLinks(): Promise<BioLink[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("bio_links")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) return data as BioLink[];
  } catch {
    /* fall through */
  }
  return SEED_BIO_LINKS;
}
