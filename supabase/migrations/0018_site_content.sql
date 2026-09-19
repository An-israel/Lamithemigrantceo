-- ===========================================================================
-- Generic, site-wide editable text. Every piece of copy the admin makes
-- editable gets a stable key (e.g. "home.hero.headline") and a value here.
-- Pages read through getContent(key, fallback) — the current hardcoded
-- copy IS the fallback, so a key with no row yet renders exactly as
-- before. Nothing breaks while this table is empty; it only overrides
-- once a key has actually been edited in /admin/content.
-- ===========================================================================

create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Everyone can read (it's rendering public pages); only admins can write.
drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  for select using (true);

drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());
