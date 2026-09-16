-- ===========================================================================
-- Rich link-in-bio cards: a bio link can now wrap a real Product (price,
-- compare-at price, duration, image all read live from the product) or a
-- free Resource, or stand alone as a plain link / promo banner. Replaces the
-- old Beacons.ai page with cards built from real catalog data.
-- ===========================================================================

do $$ begin
  create type bio_link_style as enum ('simple', 'product', 'resource', 'banner');
exception when duplicate_object then null; end $$;

alter table public.bio_links
  add column if not exists style bio_link_style not null default 'simple',
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists resource_id uuid references public.resources(id) on delete set null,
  add column if not exists button_label text;

alter table public.resources
  add column if not exists image_url text;

create index if not exists idx_bio_links_product on public.bio_links(product_id);
create index if not exists idx_bio_links_resource on public.bio_links(resource_id);

-- ---------------------------------------------------------------------------
-- New catalog items from the old Beacons.ai page, so the bio page can link
-- straight to a real product/resource page instead of a generic shop link.
-- ---------------------------------------------------------------------------

insert into public.products
  (slug, name, short_description, full_description, price_gbp, compare_at_gbp, format, duration, who_for, what_you_get, status, sort_order)
values
  (
    'q4-profit-plan-2026',
    'Q4 Profit Plan 2026',
    'A live product-business Q4 sales, stock and strategy masterclass.',
    'A focused, live masterclass to plan your last quarter properly: what to stock, what to promote, and how to hit your Q4 sales target without guessing.',
    100, 150, 'live_cohort', '90 minutes, live',
    array['Product business owners planning their Q4'],
    array['Live Q4 sales and stock planning session', 'A simple strategy worksheet', 'Replay access'],
    'live', 20
  ),
  (
    'launch-your-biz-uk',
    'Launch Your Biz UK',
    'A 4-week 1:1 support program to launch your online product business.',
    'Launch your business in a 4-week 1:1 support program designed for UK women starting or scaling an online product business, without guesswork, hand-holding, or wasting money on the wrong things.',
    200, null, 'self_paced', '4 weeks',
    array['Women starting or scaling an online product business in the UK'],
    array['4 weeks of 1:1 support', 'A step-by-step launch plan', 'Direct feedback on your setup'],
    'live', 21
  ),
  (
    'start-a-business-with-me',
    'Start a Business With Me',
    '1:1 coaching. Private, hands-on support to get your business moving.',
    'Private 1:1 coaching for someone ready to get real support building their business, from set-up through to your first consistent sales.',
    800, 1000, 'self_paced', 'Ongoing 1:1',
    array['Founders who want direct, hands-on support'],
    array['Fortnightly private calls', 'Direct messaging access between calls', 'A plan built around your business'],
    'live', 22
  ),
  (
    '1-1-consultation',
    '1:1 Consultation',
    'A focused call to work through your specific question.',
    'A single, focused 45-minute call to work through whatever is in your way right now, whether that is a sourcing question, a pricing decision, or where to start.',
    100, null, 'self_paced', '45 min',
    array['Anyone with one specific question to work through'],
    array['A 45-minute 1:1 call', 'Straight answers, no fluff'],
    'live', 23
  ),
  (
    'brand-audit-checklist',
    'Brand Audit Checklist',
    'Check your brand is consistent and customer-ready before you launch.',
    'A practical checklist to review your brand before you spend money promoting it: consistency, clarity, and whether it actually looks customer-ready.',
    1, null, 'self_paced', null,
    array['Anyone about to launch or relaunch their brand'],
    array['A printable brand audit checklist', 'Instant download'],
    'live', 24
  )
on conflict (slug) do nothing;

insert into public.resources (title, description, requires_email, sort_order, active)
select '20 Business Ideas', 'A starter list to find the right product business for you.', true, 10, true
where not exists (select 1 from public.resources where title = '20 Business Ideas');

insert into public.resources (title, description, requires_email, sort_order, active)
select 'The UK Launch Checklist', 'Every step to register and launch your business properly.', true, 11, true
where not exists (select 1 from public.resources where title = 'The UK Launch Checklist');

-- ---------------------------------------------------------------------------
-- Bio page: quick links, the 5 products, the 2 free resources, and the GBL
-- Accessories promo banner. Only inserted the first time (bio_links already
-- has rows from earlier seeding, so this is conditional on the table being
-- otherwise unseeded for these specific labels).
-- ---------------------------------------------------------------------------

insert into public.bio_links (label, url, description, style, product_id, sort_order, active)
select 'Q4 Profit Plan 2026', '/products/q4-profit-plan-2026', null, 'product', p.id, 30, true
from public.products p where p.slug = 'q4-profit-plan-2026'
and not exists (select 1 from public.bio_links where product_id = p.id);

insert into public.bio_links (label, url, description, style, product_id, sort_order, active)
select 'Launch Your Biz UK', '/products/launch-your-biz-uk', null, 'product', p.id, 31, true
from public.products p where p.slug = 'launch-your-biz-uk'
and not exists (select 1 from public.bio_links where product_id = p.id);

insert into public.bio_links (label, url, description, style, product_id, sort_order, active)
select 'Start a Business With Me', '/products/start-a-business-with-me', null, 'product', p.id, 32, true
from public.products p where p.slug = 'start-a-business-with-me'
and not exists (select 1 from public.bio_links where product_id = p.id);

insert into public.bio_links (label, url, description, style, product_id, sort_order, active)
select '1:1 Consultation', '/products/1-1-consultation', null, 'product', p.id, 33, true
from public.products p where p.slug = '1-1-consultation'
and not exists (select 1 from public.bio_links where product_id = p.id);

insert into public.bio_links (label, url, description, style, resource_id, sort_order, active)
select '20 Business Ideas', '/resources', null, 'resource', r.id, 34, true
from public.resources r where r.title = '20 Business Ideas'
and not exists (select 1 from public.bio_links where resource_id = r.id);

insert into public.bio_links (label, url, description, style, resource_id, sort_order, active)
select 'The UK Launch Checklist', '/resources', null, 'resource', r.id, 35, true
from public.resources r where r.title = 'The UK Launch Checklist'
and not exists (select 1 from public.bio_links where resource_id = r.id);

insert into public.bio_links (label, url, description, style, product_id, sort_order, active)
select 'Brand Audit Checklist', '/products/brand-audit-checklist', null, 'product', p.id, 36, true
from public.products p where p.slug = 'brand-audit-checklist'
and not exists (select 1 from public.bio_links where product_id = p.id);

insert into public.bio_links (label, url, description, style, sort_order, active)
select 'GBL Accessories', '/wholesale', 'High-quality, non-tarnish gold-plated jewelry, shipped across the UK.', 'banner', 37, true
where not exists (select 1 from public.bio_links where label = 'GBL Accessories');
