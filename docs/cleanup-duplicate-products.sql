-- ===========================================================================
-- One-off cleanup: duplicate products (e.g. two "Launch your Product BIZ"
-- rows), where a bio link is pointed at the one WITHOUT an image instead of
-- the one with it. Run each step in order, in the Supabase SQL editor.
-- Not a migration — nothing here runs automatically, and it's safe to
-- delete this file once you're done with it.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- STEP 1 — Look. Lists every product, grouped so near-duplicates (same
-- name, trimmed and case-insensitive) sit next to each other, along with
-- whether each has a cover image and which bio link (if any) points at it.
-- Run this first and read the output before touching anything else below.
-- ---------------------------------------------------------------------------
select
  p.id,
  p.name,
  p.slug,
  (p.cover_image is not null and p.cover_image <> '') as has_image,
  p.status,
  p.created_at,
  bl.id as linked_bio_link_id,
  bl.label as linked_bio_link_label
from public.products p
left join public.bio_links bl on bl.product_id = p.id
where lower(trim(p.name)) in (
  select lower(trim(name))
  from public.products
  group by lower(trim(name))
  having count(*) > 1
)
order by lower(trim(p.name)), p.created_at;

-- ---------------------------------------------------------------------------
-- STEP 2 — From Step 1's output, decide:
--   KEEP_ID    = the id of the product WITH the image (the real one)
--   DELETE_ID  = the id of the duplicate WITHOUT the image
-- Paste both below, replacing the placeholder text. Do not run Step 3
-- until you've filled these in for real — as written it will error
-- (which is intentional, so it can't run by accident).
-- ---------------------------------------------------------------------------
-- KEEP_ID:   'REPLACE-WITH-THE-ID-TO-KEEP'
-- DELETE_ID: 'REPLACE-WITH-THE-ID-TO-DELETE'

-- ---------------------------------------------------------------------------
-- STEP 3a — Repoint any bio link currently pointing at the duplicate so it
-- points at the real (kept) product instead. Must run BEFORE 3b — deleting
-- the product first would silently null out the bio link's product_id
-- instead of fixing it, and that bio link's card would vanish from /start.
-- ---------------------------------------------------------------------------
update public.bio_links
set product_id = 'REPLACE-WITH-THE-ID-TO-KEEP'
where product_id = 'REPLACE-WITH-THE-ID-TO-DELETE';

-- ---------------------------------------------------------------------------
-- STEP 3b — Now it's safe to delete the duplicate. Past orders/applications
-- that reference it by id are untouched (they store the item's name and
-- price inline, not just a live reference), so old records stay intact.
-- ---------------------------------------------------------------------------
delete from public.products
where id = 'REPLACE-WITH-THE-ID-TO-DELETE';

-- ---------------------------------------------------------------------------
-- STEP 4 — Confirm: re-run Step 1's query (or just check /admin/products
-- and /start) — the duplicate should be gone and the bio link's card
-- should now show the real image.
-- ---------------------------------------------------------------------------
