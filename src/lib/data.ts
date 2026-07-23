import { createClient } from "@/lib/supabase/server";
import type { Program, Testimonial, SiteSettings } from "@/lib/types";

/**
 * Seed content. These render the site meaningfully before the Supabase tables
 * are populated, and double as the exact shape the DB returns. Real data from
 * Supabase always wins; these are the fallback only.
 *
 * TODO(lami): confirm the receipt figures, prices, dates and stats are true
 * before launch. See supabase/migrations/0002_seed.sql for the DB copies.
 */

export const SEED_PROGRAMS: Program[] = [
  {
    id: "seed-build-her-empire",
    created_at: new Date().toISOString(),
    slug: "build-her-empire-2026",
    name: "Build Her Empire 2026 LIVE",
    short_description:
      "The live cohort where you launch a real product business in eight weeks.",
    full_description:
      "An eight-week live cohort. We build your first product line, your pricing, your first wholesale order and your first ten sales together, on calls, with feedback.",
    cover_image: null,
    price_gbp: 497,
    compare_at_gbp: 697,
    format: "live_cohort",
    start_date: "2026-09-15",
    duration: "8 weeks, live",
    who_for: [
      "You are employed but want your own income",
      "You have tried selling and it stalled",
      "You can commit two evenings a week for eight weeks",
    ],
    what_you_get: [
      "Eight live group coaching calls",
      "Your first wholesale order placed with you",
      "Pricing and margin worked out for your products",
      "A private cohort community",
      "Templates for listings, labels and packaging",
      "Lifetime access to the recordings",
    ],
    status: "live",
    sort_order: 1,
  },
  {
    id: "seed-200-starter",
    created_at: new Date().toISOString(),
    slug: "the-200-starter",
    name: "The £200 Starter",
    short_description:
      "The self-paced route from nothing to your first paid order.",
    full_description:
      "A self-paced programme that walks you from zero to your first order for under £200 in stock. Do it on your own time, in your own order.",
    cover_image: null,
    price_gbp: 97,
    compare_at_gbp: null,
    format: "self_paced",
    start_date: null,
    duration: "Self-paced, ~4 hours",
    who_for: [
      "You have £200 and no idea where to put it",
      "You want to test before you commit to a cohort",
    ],
    what_you_get: [
      "Six recorded modules",
      "The starter stock shopping list",
      "A pricing calculator",
      "Label and packaging templates",
      "The first-order checklist",
      "Email support for 30 days",
    ],
    status: "live",
    sort_order: 2,
  },
  {
    id: "seed-gbg-mentorship",
    created_at: new Date().toISOString(),
    slug: "gbg-mentorship",
    name: "GBG 1:1 Mentorship",
    short_description:
      "Private mentorship for women scaling past their first £5k month.",
    full_description:
      "One-to-one mentorship for women who are already selling and want to scale. Fortnightly private calls, direct access, and hands-on help with wholesale and systems.",
    cover_image: null,
    price_gbp: 1200,
    compare_at_gbp: null,
    format: "live_cohort",
    start_date: null,
    duration: "12 weeks, 1:1",
    who_for: [
      "You are already selling and want to scale",
      "You want direct, private access",
    ],
    what_you_get: [
      "Six fortnightly private calls",
      "Direct messaging access between calls",
      "A scaling plan built for your business",
      "Wholesale sourcing help",
      "Systems and hiring guidance",
      "Priority on new opportunities",
    ],
    status: "sold_out",
    sort_order: 3,
  },
];

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "seed-t1",
    created_at: new Date().toISOString(),
    name: "Amara O.",
    photo: null,
    quote: "I sold out my first bundle in a weekend. I could not believe it.",
    result_figure: "£1,200 in her first month",
    program_id: "seed-200-starter",
    sort_order: 1,
    archived: false,
  },
  {
    id: "seed-t2",
    created_at: new Date().toISOString(),
    name: "Blessing K.",
    photo: null,
    quote: "Lami showed me the maths. Now I actually know my margins.",
    result_figure: "£3,400 in three months",
    program_id: "seed-build-her-empire",
    sort_order: 2,
    archived: false,
  },
  {
    id: "seed-t3",
    created_at: new Date().toISOString(),
    name: "Ngozi A.",
    photo: null,
    quote: "I left my agency shift last month. This is my income now.",
    result_figure: "£5,100 in her best month",
    program_id: "seed-build-her-empire",
    sort_order: 3,
    archived: false,
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  whatsapp_number: "+44 7000 000000",
  public_email: "hello@lamithemigrantceo.com",
  calendly_url: "https://calendly.com/lamithemigrantceo/15min",
  instagram_handle: "lamitheglamfairy",
  tiktok_handle: "lamithemigrantceo",
  hero_headline: "I started with £200.",
  hero_paragraph:
    "I help African migrant women in the UK start a profitable product business on a small budget — with the exact steps I used, not theory.",
  announcement_enabled: false,
  announcement_message: null,
  announcement_link: null,
};

// --- Query helpers ---------------------------------------------------------

export async function getPrograms(): Promise<Program[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("programs")
      .select("*")
      .neq("status", "draft")
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) return data as Program[];
  } catch {
    // fall through to seed
  }
  return SEED_PROGRAMS;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) return data as Program;
  } catch {
    // fall through to seed
  }
  return SEED_PROGRAMS.find((p) => p.slug === slug) ?? null;
}

export async function getTestimonials(programId?: string): Promise<Testimonial[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("testimonials")
      .select("*")
      .eq("archived", false)
      .order("sort_order", { ascending: true });
    if (programId) query = query.eq("program_id", programId);
    const { data } = await query;
    if (data && data.length > 0) return data as Testimonial[];
  } catch {
    // fall through to seed
  }
  return programId
    ? SEED_TESTIMONIALS.filter((t) => t.program_id === programId)
    : SEED_TESTIMONIALS;
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) return { ...DEFAULT_SETTINGS, ...data } as SiteSettings;
  } catch {
    // fall through to defaults
  }
  return DEFAULT_SETTINGS;
}

// Re-exported for existing server-side callers. Client components should
// import from "@/lib/format" directly to avoid pulling in server-only code.
export { formatGBP } from "@/lib/format";
