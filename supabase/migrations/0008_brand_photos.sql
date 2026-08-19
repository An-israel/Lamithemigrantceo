-- ===========================================================================
-- Editable brand photos: founder portrait (About page) and media headshot
-- (Media/press page). Previously hardcoded placeholder boxes with no way to
-- update them without a developer.
-- ===========================================================================

alter table public.site_settings
  add column if not exists founder_portrait_url text,
  add column if not exists media_headshot_url text;
