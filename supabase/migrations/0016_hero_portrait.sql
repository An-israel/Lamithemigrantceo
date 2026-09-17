-- ===========================================================================
-- Separate hero portrait: the homepage hero previously reused
-- founder_portrait_url, which also drives the About and Start Here pages,
-- so all three always showed the identical photo. Give the homepage its own
-- editable photo instead.
-- ===========================================================================

alter table public.site_settings
  add column if not exists hero_portrait_url text;
