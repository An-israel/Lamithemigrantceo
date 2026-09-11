/**
 * Hand-maintained database types. Keep in sync with
 * supabase/migrations. Regenerate with `supabase gen types typescript`
 * once the CLI is linked to the project if you prefer generated types.
 */

export type ProductFormat = "live_cohort" | "self_paced";
export type ProductStatus = "draft" | "live" | "sold_out";
export type EnquiryStatus = "new" | "read" | "replied";
export type OrderStatus = "pending" | "paid" | "refunded" | "failed";
export type FulfilmentStatus = "none" | "new" | "packed" | "shipped" | "delivered";
export type UserRole = "student" | "admin";

export interface Product {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  cover_image: string | null;
  gallery_images: string[];
  price_gbp: number;
  compare_at_gbp: number | null;
  format: ProductFormat;
  start_date: string | null;
  duration: string | null;
  who_for: string[];
  what_you_get: string[];
  status: ProductStatus;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  created_at: string;
  name: string;
  photo: string | null;
  quote: string;
  result_figure: string | null;
  product_id: string | null;
  sort_order: number;
  archived: boolean;
}

export interface Enquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  whatsapp: string | null;
  topic: string;
  message: string;
  marketing_opt_in: boolean;
  status: EnquiryStatus;
  source_page: string | null;
  admin_notes: string | null;
  organisation: string | null;
  event_date: string | null;
  budget_range: string | null;
}

export interface JournalPost {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string;
  author: string;
  published: boolean;
  published_at: string | null;
  sort_order: number;
}

export interface BioLink {
  id: string;
  created_at: string;
  label: string;
  url: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  clicks: number;
}

export interface Resource {
  id: string;
  created_at: string;
  title: string;
  description: string;
  file_url: string | null;
  video_url: string | null;
  requires_email: boolean;
  sort_order: number;
  active: boolean;
}

export interface ImpactStat {
  id: string;
  created_at: string;
  figure: string;
  label: string;
  sort_order: number;
}

export type EventStatus = "draft" | "live" | "sold_out" | "past";
export type ApplicationStatus = "new" | "reviewing" | "accepted" | "declined";

export interface EventItem {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover_image: string | null;
  gallery_images: string[];
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  price_gbp: number;
  compare_at_gbp: number | null;
  capacity: number | null;
  tickets_sold: number;
  status: EventStatus;
  sort_order: number;
}

export interface Membership {
  id: string;
  created_at: string;
  name: string;
  email: string;
  whatsapp: string | null;
  reason: string | null;
  status: string;
}

export interface Application {
  id: string;
  created_at: string;
  product_id: string | null;
  product_name: string | null;
  name: string;
  email: string;
  whatsapp: string | null;
  answers: Record<string, unknown> | null;
  status: ApplicationStatus;
  admin_notes: string | null;
}

export interface Venture {
  id: string;
  created_at: string;
  name: string;
  summary: string;
  status: string;
  link: string | null;
  published: boolean;
  sort_order: number;
}

export interface WholesaleProduct {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  description: string;
  whats_inside: string;
  unit_count: number;
  price_gbp: number;
  typical_resale_gbp: number | null;
  stock: number;
  category: string;
  images: string[];
  archived: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  created_at: string;
  stripe_session_id: string | null;
  email: string;
  name: string | null;
  item_type: "product" | "program" | "wholesale" | "event";
  item_id: string | null;
  amount_gbp: number;
  status: OrderStatus;
  fulfilment_status: FulfilmentStatus;
  tracking_number: string | null;
  shipping_address: Record<string, unknown> | null;
  items: { id: string; name: string; quantity: number }[] | null;
}

export interface ProductModule {
  id: string;
  created_at: string;
  product_id: string;
  title: string;
  body: string;
  video_url: string | null;
  file_url: string | null;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  created_at: string;
  image_url: string;
  caption: string | null;
  category: string;
  taken_on: string | null;
  sort_order: number;
}

export interface AppUser {
  id: string;
  created_at: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export interface ReceiptItem {
  label: string;
  value: number;
}

export interface SiteSettings {
  id: number;
  whatsapp_number: string | null;
  public_email: string | null;
  calendly_url: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  hero_headline: string | null;
  hero_paragraph: string | null;
  announcement_enabled: boolean;
  announcement_message: string | null;
  announcement_link: string | null;
  announcement_image_url: string | null;
  receipt_items: ReceiptItem[] | null;
  receipt_resold_gbp: number | null;
  receipt_note: string | null;
  founder_portrait_url: string | null;
  founder_gallery_urls: string[];
  media_headshot_url: string | null;
  waitlist_locations: string[];
}

type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

interface TableDef<T> {
  Row: Row<T>;
  Insert: Insert<T>;
  Update: Update<T>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      users: TableDef<AppUser>;
      products: TableDef<Product>;
      testimonials: TableDef<Testimonial>;
      enquiries: TableDef<Enquiry>;
      wholesale_products: TableDef<WholesaleProduct>;
      orders: TableDef<Order>;
      site_settings: TableDef<SiteSettings>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
