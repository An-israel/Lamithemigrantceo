-- ===========================================================================
-- Video support for resources, and a thumbnail image per bio link.
-- ===========================================================================

alter table public.resources
  add column if not exists video_url text;

alter table public.bio_links
  add column if not exists image_url text;
