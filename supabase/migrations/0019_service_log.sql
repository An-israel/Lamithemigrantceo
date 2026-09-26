-- ===========================================================================
-- Service log: an append-only record of what the site does automatically —
-- emails sent/failed/skipped, Stripe payments and webhooks, checkouts
-- started and abandoned, form submissions, order status changes, and
-- errors. Shown in /admin/service-log so problems (e.g. "the buyer never
-- got an email") can be traced without opening Vercel or Stripe logs.
--
-- Rows are written server-side with the service-role key only (which
-- bypasses RLS), so there is deliberately no insert policy: nobody can
-- write to this table from a browser.
-- ===========================================================================

create table if not exists public.service_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null
    check (category in ('email', 'payment', 'checkout', 'form', 'order', 'system')),
  event text not null,
  status text not null default 'info'
    check (status in ('success', 'failed', 'skipped', 'info')),
  summary text not null,
  ref text,
  detail jsonb
);

create index if not exists service_log_created_at_idx
  on public.service_log (created_at desc);
create index if not exists service_log_category_idx
  on public.service_log (category, created_at desc);
create index if not exists service_log_status_idx
  on public.service_log (status, created_at desc);

alter table public.service_log enable row level security;

drop policy if exists service_log_admin_read on public.service_log;
create policy service_log_admin_read on public.service_log
  for select using (public.is_admin());

-- Admins can clear old entries from the Service log page.
drop policy if exists service_log_admin_delete on public.service_log;
create policy service_log_admin_delete on public.service_log
  for delete using (public.is_admin());
