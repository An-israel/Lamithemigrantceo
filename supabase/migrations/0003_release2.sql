-- ===========================================================================
-- Release 2 + 3 additions:
--   - storage bucket for uploaded program / product images
--   - editable homepage receipt in site_settings
--   - page_views insert (anon logging) + testimonials already exist
--   - orders shipping/fulfilment columns already exist in 0001
-- ===========================================================================

-- Storage bucket for media (program covers, product photos). Public read.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone can read public media; only admins can write/delete.
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- Editable homepage receipt (falls back to code defaults if null).
alter table public.site_settings
  add column if not exists receipt_items jsonb,
  add column if not exists receipt_resold_gbp numeric(10,2),
  add column if not exists receipt_note text;

update public.site_settings set
  receipt_items = coalesce(receipt_items, '[
    {"label":"Mixed jewelry bundle","value":85},
    {"label":"Packaging and labels","value":22},
    {"label":"Postage float","value":18},
    {"label":"Sample stock","value":45},
    {"label":"Business cards","value":30}
  ]'::jsonb),
  receipt_resold_gbp = coalesce(receipt_resold_gbp, 640),
  receipt_note = coalesce(receipt_note, 'Her actual first order, 2021.')
where id = 1;

-- Analytics: allow anonymous inserts into page_views (no PII stored). Reads
-- remain admin-only (policy from 0001). We deliberately keep this open for
-- insert so the client logger works without the service role.
drop policy if exists page_views_anon_insert on public.page_views;
create policy page_views_anon_insert on public.page_views
  for insert with check (true);

-- Restock alerts: allow anonymous inserts (email capture when sold out).
drop policy if exists restock_anon_insert on public.restock_alerts;
create policy restock_anon_insert on public.restock_alerts
  for insert with check (true);
