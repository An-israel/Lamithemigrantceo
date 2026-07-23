-- ===========================================================================
-- Seed content. Safe to run once on a fresh project. All figures are
-- placeholders — CONFIRM with Lami before launch (prices, dates, receipt,
-- stats). Update or delete freely from /admin once she is live.
-- ===========================================================================

-- Programs -----------------------------------------------------------------
insert into public.programs
  (slug, name, short_description, full_description, price_gbp, compare_at_gbp,
   format, start_date, duration, who_for, what_you_get, status, sort_order)
values
  ('build-her-empire-2026', 'Build Her Empire 2026 LIVE',
   'The live cohort where you launch a real product business in eight weeks.',
   'An eight-week live cohort. We build your first product line, your pricing, your first wholesale order and your first ten sales together, on calls, with feedback.',
   497, 697, 'live_cohort', '2026-09-15', '8 weeks, live',
   array['You are employed but want your own income','You have tried selling and it stalled','You can commit two evenings a week for eight weeks'],
   array['Eight live group coaching calls','Your first wholesale order placed with you','Pricing and margin worked out for your products','A private cohort community','Templates for listings, labels and packaging','Lifetime access to the recordings'],
   'live', 1),
  ('the-200-starter', 'The £200 Starter',
   'The self-paced route from nothing to your first paid order.',
   'A self-paced programme that walks you from zero to your first order for under £200 in stock. Do it on your own time, in your own order.',
   97, null, 'self_paced', null, 'Self-paced, ~4 hours',
   array['You have £200 and no idea where to put it','You want to test before you commit to a cohort'],
   array['Six recorded modules','The starter stock shopping list','A pricing calculator','Label and packaging templates','The first-order checklist','Email support for 30 days'],
   'live', 2),
  ('gbg-mentorship', 'GBG 1:1 Mentorship',
   'Private mentorship for women scaling past their first £5k month.',
   'One-to-one mentorship for women who are already selling and want to scale. Fortnightly private calls, direct access, and hands-on help with wholesale and systems.',
   1200, null, 'live_cohort', null, '12 weeks, 1:1',
   array['You are already selling and want to scale','You want direct, private access'],
   array['Six fortnightly private calls','Direct messaging access between calls','A scaling plan built for your business','Wholesale sourcing help','Systems and hiring guidance','Priority on new opportunities'],
   'sold_out', 3)
on conflict (slug) do nothing;

-- Testimonials -------------------------------------------------------------
insert into public.testimonials (name, quote, result_figure, sort_order)
values
  ('Amara O.', 'I sold out my first bundle in a weekend. I could not believe it.', '£1,200 in her first month', 1),
  ('Blessing K.', 'Lami showed me the maths. Now I actually know my margins.', '£3,400 in three months', 2),
  ('Ngozi A.', 'I left my agency shift last month. This is my income now.', '£5,100 in her best month', 3)
on conflict do nothing;

-- Wholesale bundles --------------------------------------------------------
insert into public.wholesale_products
  (slug, name, description, whats_inside, unit_count, price_gbp, typical_resale_gbp, stock, category, sort_order)
values
  ('gold-starter-bundle', 'Gold-tone Starter Bundle', 'A tested mix of gold-tone pieces that sell fast.', 'Necklaces, hoops, and stacking rings', 24, 85, 240, 12, 'Jewelry', 1),
  ('everyday-accessories', 'Everyday Accessories Box', 'Hair clips, scrunchies and small accessories with quick turnover.', 'Assorted accessories', 40, 60, 160, 0, 'Accessories', 2),
  ('premium-jewelry-bundle', 'Premium Jewelry Bundle', 'Higher-margin statement pieces for an established shop.', 'Statement necklaces and earrings', 18, 140, 420, 6, 'Jewelry', 3)
on conflict (slug) do nothing;

-- Default settings ---------------------------------------------------------
update public.site_settings set
  whatsapp_number = coalesce(whatsapp_number, '+44 7000 000000'),
  public_email = coalesce(public_email, 'hello@lamithemigrantceo.com'),
  calendly_url = coalesce(calendly_url, 'https://calendly.com/lamithemigrantceo/15min'),
  instagram_handle = coalesce(instagram_handle, 'lamitheglamfairy'),
  tiktok_handle = coalesce(tiktok_handle, 'lamithemigrantceo'),
  hero_headline = coalesce(hero_headline, 'I started with £200.'),
  hero_paragraph = coalesce(hero_paragraph, 'I help African migrant women in the UK start a profitable product business on a small budget — with the exact steps I used, not theory.')
where id = 1;
