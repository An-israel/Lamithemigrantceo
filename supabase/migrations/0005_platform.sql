-- ===========================================================================
-- Phase 4 (Platform, brief §11):
--   - events + ticketing (Build Her Empire Live and future events)
--   - community memberships / waitlist (African Women Builds)
--   - programme applications (gated programmes)
--   - future ventures (CMS, launched when ready)
-- ===========================================================================

do $$ begin
  create type event_status as enum ('draft', 'live', 'sold_out', 'past');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('new', 'reviewing', 'accepted', 'declined');
exception when duplicate_object then null; end $$;

-- Events -------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  cover_image text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  price_gbp numeric(10,2) not null default 0,
  compare_at_gbp numeric(10,2),
  capacity int,
  tickets_sold int not null default 0,
  status event_status not null default 'draft',
  sort_order int not null default 0
);

-- Community memberships / waitlist ----------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  whatsapp text,
  reason text,
  status text not null default 'new'
);

-- Programme applications ---------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  program_id uuid references public.programs(id) on delete set null,
  program_name text,
  name text not null,
  email text not null,
  whatsapp text,
  answers jsonb,
  status application_status not null default 'new',
  admin_notes text
);

-- Future ventures ----------------------------------------------------------
create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  summary text not null default '',
  status text not null default 'coming_soon',
  link text,
  published boolean not null default false,
  sort_order int not null default 0
);

-- RLS ----------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.memberships enable row level security;
alter table public.applications enable row level security;
alter table public.ventures enable row level security;

drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select using (status <> 'draft' or public.is_admin());
drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- Memberships + applications: inserts happen via server (service role);
-- reads are admin-only.
drop policy if exists memberships_admin_read on public.memberships;
create policy memberships_admin_read on public.memberships
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists applications_admin_read on public.applications;
create policy applications_admin_read on public.applications
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ventures_public_read on public.ventures;
create policy ventures_public_read on public.ventures
  for select using (published = true or public.is_admin());
drop policy if exists ventures_admin_write on public.ventures;
create policy ventures_admin_write on public.ventures
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed: Build Her Empire Live (brief §4) -----------------------------------
insert into public.events
  (slug, name, tagline, description, location, starts_at, price_gbp, capacity, status, sort_order)
values
  ('build-her-empire-live-2026',
   'Build Her Empire Live',
   'The flagship in-person experience for ambitious African women business owners.',
   'A full day of practical business building, community and momentum with Lami and guests. Come with a business idea or a business — leave with a plan, a network and a next step.',
   'Liverpool, UK',
   '2026-08-15 10:00:00+01',
   47, 150, 'live', 1)
on conflict (slug) do nothing;

-- Safe ticket counter, called from the Stripe webhook (service role).
create or replace function public.increment_tickets_sold(event_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.events set tickets_sold = tickets_sold + 1 where id = event_id;
$$;

create index if not exists idx_events_sort on public.events(sort_order);
create index if not exists idx_applications_status on public.applications(status, created_at desc);
