-- ===========================================================================
-- Client brief additions:
--   - richer enquiries (organisation, event date, budget) for routed contact
--   - journal (blog) posts, bio links (link-in-bio / Beacons replacement),
--     resources (lead magnets), impact stats — all admin-managed
-- ===========================================================================

-- Enquiries: extra fields from the brief's contact form (§6.10).
alter table public.enquiries
  add column if not exists organisation text,
  add column if not exists event_date date,
  add column if not exists budget_range text;

-- The Build Journal -------------------------------------------------------
create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image text,
  category text not null default 'Business',
  author text not null default 'Lami',
  published boolean not null default false,
  published_at timestamptz,
  sort_order int not null default 0
);

-- Link-in-bio (replaces Beacons, §9) --------------------------------------
create table if not exists public.bio_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  label text not null,
  url text not null,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  clicks int not null default 0
);

-- Resources / lead magnets (§6.9) -----------------------------------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text not null default '',
  file_url text,
  requires_email boolean not null default true,
  sort_order int not null default 0,
  active boolean not null default true
);

-- Impact statistics (§6.8, editable) --------------------------------------
create table if not exists public.impact_stats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  figure text not null,
  label text not null,
  sort_order int not null default 0
);

-- RLS ---------------------------------------------------------------------
alter table public.journal_posts enable row level security;
alter table public.bio_links enable row level security;
alter table public.resources enable row level security;
alter table public.impact_stats enable row level security;

-- Journal: public reads published, admins do everything.
drop policy if exists journal_public_read on public.journal_posts;
create policy journal_public_read on public.journal_posts
  for select using (published = true or public.is_admin());
drop policy if exists journal_admin_write on public.journal_posts;
create policy journal_admin_write on public.journal_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Bio links: public reads active, admins manage. Click increment via RPC.
drop policy if exists bio_public_read on public.bio_links;
create policy bio_public_read on public.bio_links
  for select using (active = true or public.is_admin());
drop policy if exists bio_admin_write on public.bio_links;
create policy bio_admin_write on public.bio_links
  for all using (public.is_admin()) with check (public.is_admin());

-- Resources: public reads active, admins manage.
drop policy if exists resources_public_read on public.resources;
create policy resources_public_read on public.resources
  for select using (active = true or public.is_admin());
drop policy if exists resources_admin_write on public.resources;
create policy resources_admin_write on public.resources
  for all using (public.is_admin()) with check (public.is_admin());

-- Impact stats: public reads, admins manage.
drop policy if exists impact_public_read on public.impact_stats;
create policy impact_public_read on public.impact_stats
  for select using (true);
drop policy if exists impact_admin_write on public.impact_stats;
create policy impact_admin_write on public.impact_stats
  for all using (public.is_admin()) with check (public.is_admin());

-- Link click counter (safe increment, callable by anon).
create or replace function public.increment_bio_click(link_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.bio_links set clicks = clicks + 1 where id = link_id;
$$;

-- Seed a couple of impact stats + journal example (brief wording).
insert into public.impact_stats (figure, label, sort_order) values
  ('500+', 'people directly supported', 1),
  ('~24,000', 'combined social followers', 2),
  ('10+ years', 'entrepreneurial experience', 3),
  ('~1,000', 'total impact (approaching)', 4)
on conflict do nothing;

create index if not exists idx_journal_published on public.journal_posts(published, published_at desc);
create index if not exists idx_bio_sort on public.bio_links(sort_order);
