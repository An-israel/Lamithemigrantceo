-- ===========================================================================
-- Admin-controlled tile size for the About page photo gallery. Previously
-- the column count was fixed in code; let the admin choose small/medium/
-- large instead of needing a developer.
-- ===========================================================================

alter table public.site_settings
  add column if not exists founder_gallery_size text not null default 'medium'
    check (founder_gallery_size in ('small', 'medium', 'large'));
