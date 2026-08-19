-- ===========================================================================
-- Real success-story testimonials, sourced from the "Lami The Migrant CEO —
-- Success Stories & Impact Report (2026 EDITION)". Copy matches the report's
-- own "Website-ready testimonial bank" (page 12) verbatim — already reviewed
-- and edited for public publication, with attribution levels the report
-- itself chose per student (full first name only where the report names one,
-- otherwise a generic role so no one is identified beyond what was already
-- approved).
-- ===========================================================================

insert into public.testimonials (name, quote, result_figure, sort_order, archived) values
  ('Community reseller',
   'I started small, sold my tote bags at £10 each and sold out the full batch. My jewellery is also doing well on Vinted. Thank you for the good deals.',
   'Sold out her full batch', 10, false),
  ('Community member',
   'I sourced 30 fans from 1688, sold 12 during the week and sold the remaining 18 in one afternoon on Vinted.',
   '30 fans sold in a week', 11, false),
  ('TikTok Live viewer',
   'I bought products for £200 and sold them for £450, giving me £250 profit.',
   '£250 profit from £200 stock', 12, false),
  ('Anonymous academy member',
   'I made and surpassed my first £1,000 within four months and officially registered my business.',
   '£1,000 in her first four months', 13, false),
  ('Jamilah',
   'My coach, thank you. All 50 products are gone.',
   'All 50 products sold', 14, false),
  ('Academy member',
   'I remembered you said I would teach. I have now got my first student.',
   'Now teaching her first student', 15, false),
  ('Class participant',
   'I paid £20 and received value for a lifetime. I genuinely gained far more than the cost.',
   null, 16, false),
  ('Community member',
   'Thank you for all you have done for me. You woke me up and brought me hope again.',
   null, 17, false)
on conflict do nothing;
