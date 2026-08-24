-- ===========================================================================
-- Standalone photo gallery, categorised (event, warehouse, behind-the-scenes,
-- etc.), manually curated from /admin/gallery.
-- ===========================================================================

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  caption text,
  category text not null default 'Event',
  taken_on date,
  sort_order int not null default 0
);

alter table public.gallery_images enable row level security;

drop policy if exists gallery_public_read on public.gallery_images;
create policy gallery_public_read on public.gallery_images
  for select using (true);

drop policy if exists gallery_admin_write on public.gallery_images;
create policy gallery_admin_write on public.gallery_images
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_gallery_category on public.gallery_images(category, sort_order);
