-- ===========================================================================
-- LamiTheMigrantCEO — initial schema
-- Run against the Supabase project (mnhpprzuheyowtiuibat) via the SQL editor
-- or `supabase db push`. Idempotent-ish: uses IF NOT EXISTS where possible.
-- ===========================================================================

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------------------
do $$ begin
  create type program_format as enum ('live_cohort', 'self_paced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type program_status as enum ('draft', 'live', 'sold_out');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enquiry_status as enum ('new', 'read', 'replied');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfilment_status as enum ('none', 'new', 'packed', 'shipped', 'delivered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('student', 'admin');
exception when duplicate_object then null; end $$;

-- Users profile (mirrors auth.users) ---------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text not null,
  full_name text,
  role user_role not null default 'student'
);

-- Helper: is the current auth user an admin? Security definer so it can read
-- the users table without tripping RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- Keep public.users in sync when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Programs -----------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  short_description text not null default '',
  full_description text not null default '',
  cover_image text,
  price_gbp numeric(10,2) not null default 0,
  compare_at_gbp numeric(10,2),
  format program_format not null default 'self_paced',
  start_date date,
  duration text,
  who_for text[] not null default '{}',
  what_you_get text[] not null default '{}',
  status program_status not null default 'draft',
  sort_order int not null default 0
);

-- Testimonials -------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  photo text,
  quote text not null,
  result_figure text,
  program_id uuid references public.programs(id) on delete set null,
  sort_order int not null default 0,
  archived boolean not null default false
);

-- Enquiries (contact form + newsletter) ------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  whatsapp text,
  topic text not null default 'Something else',
  message text not null,
  marketing_opt_in boolean not null default false,
  status enquiry_status not null default 'new',
  source_page text,
  admin_notes text
);

-- Wholesale products -------------------------------------------------------
create table if not exists public.wholesale_products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  whats_inside text not null default '',
  unit_count int not null default 0,
  price_gbp numeric(10,2) not null default 0,
  typical_resale_gbp numeric(10,2),
  stock int not null default 0,
  category text not null default 'Jewelry',
  images text[] not null default '{}',
  archived boolean not null default false,
  sort_order int not null default 0
);

-- Restock alerts -----------------------------------------------------------
create table if not exists public.restock_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  product_id uuid references public.wholesale_products(id) on delete cascade,
  notified boolean not null default false
);

-- Orders -------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  stripe_session_id text unique,
  email text not null,
  name text,
  item_type text not null default 'program',
  item_id uuid,
  amount_gbp numeric(10,2) not null default 0,
  status order_status not null default 'pending',
  fulfilment_status fulfilment_status not null default 'none',
  tracking_number text,
  shipping_address jsonb
);

-- Page views (cookieless analytics) ----------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null,
  referrer text,
  country text,
  device_type text,
  session_hash text
);

-- Site settings (single row) -----------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1,
  whatsapp_number text,
  public_email text,
  calendly_url text,
  instagram_handle text,
  tiktok_handle text,
  hero_headline text,
  hero_paragraph text,
  announcement_enabled boolean not null default false,
  announcement_message text,
  announcement_link text,
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;

-- ===========================================================================
-- Row level security
-- ===========================================================================
alter table public.users enable row level security;
alter table public.programs enable row level security;
alter table public.testimonials enable row level security;
alter table public.enquiries enable row level security;
alter table public.wholesale_products enable row level security;
alter table public.restock_alerts enable row level security;
alter table public.orders enable row level security;
alter table public.page_views enable row level security;
alter table public.site_settings enable row level security;

-- USERS: a user sees themself; admins see all.
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- PROGRAMS: public reads live/sold_out; admins do everything.
drop policy if exists programs_public_read on public.programs;
create policy programs_public_read on public.programs
  for select using (status <> 'draft' or public.is_admin());

drop policy if exists programs_admin_write on public.programs;
create policy programs_admin_write on public.programs
  for all using (public.is_admin()) with check (public.is_admin());

-- TESTIMONIALS: public reads non-archived; admins do everything.
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select using (archived = false or public.is_admin());

drop policy if exists testimonials_admin_write on public.testimonials;
create policy testimonials_admin_write on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- WHOLESALE: public reads non-archived; admins do everything.
drop policy if exists wholesale_public_read on public.wholesale_products;
create policy wholesale_public_read on public.wholesale_products
  for select using (archived = false or public.is_admin());

drop policy if exists wholesale_admin_write on public.wholesale_products;
create policy wholesale_admin_write on public.wholesale_products
  for all using (public.is_admin()) with check (public.is_admin());

-- ENQUIRIES: only admins can read/update. Inserts come from the server via
-- the service role (which bypasses RLS), so no public insert policy is needed.
drop policy if exists enquiries_admin_all on public.enquiries;
create policy enquiries_admin_all on public.enquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- RESTOCK ALERTS: admin only for reads. Inserts via service role.
drop policy if exists restock_admin_all on public.restock_alerts;
create policy restock_admin_all on public.restock_alerts
  for all using (public.is_admin()) with check (public.is_admin());

-- ORDERS: a signed-in user sees their own (by email); admins see all.
-- Writes happen via service role from the Stripe webhook.
drop policy if exists orders_own_read on public.orders;
create policy orders_own_read on public.orders
  for select using (
    public.is_admin()
    or email = (select u.email from public.users u where u.id = auth.uid())
  );

drop policy if exists orders_admin_write on public.orders;
create policy orders_admin_write on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- PAGE VIEWS: admin read only. Inserts via service role / edge function.
drop policy if exists page_views_admin_read on public.page_views;
create policy page_views_admin_read on public.page_views
  for select using (public.is_admin());

-- SITE SETTINGS: everyone can read the single row; only admins can update.
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings
  for select using (true);

drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- Indexes ------------------------------------------------------------------
create index if not exists idx_enquiries_status on public.enquiries(status, created_at desc);
create index if not exists idx_orders_email on public.orders(email);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_programs_sort on public.programs(sort_order);
create index if not exists idx_page_views_created on public.page_views(created_at desc);
