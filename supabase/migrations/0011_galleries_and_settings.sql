-- ===========================================================================
-- Multi-image galleries for products and events (first image stays the
-- existing cover_image; these are the additional gallery shots), a founder
-- photo gallery for the About page, an announcement-bar image, and the
-- admin-editable list of cities for the event waitlist's location vote.
-- ===========================================================================

alter table public.products
  add column if not exists gallery_images text[] not null default '{}';

alter table public.events
  add column if not exists gallery_images text[] not null default '{}';

alter table public.site_settings
  add column if not exists announcement_image_url text,
  add column if not exists founder_gallery_urls text[] not null default '{}',
  add column if not exists waitlist_locations text[] not null default '{}';

update public.site_settings
set waitlist_locations = '{"Liverpool","London","Manchester","Birmingham"}'
where id = 1 and (waitlist_locations is null or waitlist_locations = '{}');
