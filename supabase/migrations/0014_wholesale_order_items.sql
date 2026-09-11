-- ===========================================================================
-- Fixes a real gap: wholesale checkout enforced stock at the moment a Stripe
-- session was created, but nothing ever decremented stock after a purchase
-- actually completed, so the "in stock" count never reflected real sales and
-- could allow overselling over time. Also records which bundles/quantities
-- were bought on the order itself, since a wholesale order previously showed
-- only a total amount with no way to know what to pack.
-- ===========================================================================

alter table public.orders
  add column if not exists items jsonb;

create or replace function public.decrement_wholesale_stock(product_id uuid, qty int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.wholesale_products
  set stock = greatest(stock - qty, 0)
  where id = product_id;
$$;
