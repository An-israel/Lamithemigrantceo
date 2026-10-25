-- ===========================================================================
-- Email marketing: a mailing list Lami owns (subscribers), campaigns she
-- writes in /admin/campaigns, and a per-recipient send record so a
-- campaign can pause (Resend limits, closed tab) and resume without anyone
-- being emailed twice.
--
-- Only people who actively asked for The Build Letter are subscribers:
-- the newsletter forms and the contact form's opt-in box. Resource
-- downloads and waitlists are NOT marketing consent and are not imported.
--
-- Writes to the send tables happen server-side with the service-role key;
-- the three functions below are not callable from the browser.
-- ===========================================================================

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique
    check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  name text,
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'website',
  consent_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid()
);

create index if not exists subscribers_status_idx on public.subscribers (status);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null default 'Untitled email',
  subject text not null default '',
  preview_text text not null default '',
  body_html text not null default '',
  image_url text,
  cta_label text,
  cta_url text,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent')),
  recipient_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  skipped_count int not null default 0,
  started_at timestamptz,
  sent_at timestamptz,
  last_error text
);

create table if not exists public.email_campaign_recipients (
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  claimed_at timestamptz,
  sent_at timestamptz,
  resend_id text,
  error text,
  primary key (campaign_id, email)
);

create index if not exists email_campaign_recipients_status_idx
  on public.email_campaign_recipients (campaign_id, status);

alter table public.subscribers enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_campaign_recipients enable row level security;

drop policy if exists subscribers_admin_all on public.subscribers;
create policy subscribers_admin_all on public.subscribers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists email_campaigns_admin_all on public.email_campaigns;
create policy email_campaigns_admin_all on public.email_campaigns
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists email_campaign_recipients_admin_read on public.email_campaign_recipients;
create policy email_campaign_recipients_admin_read on public.email_campaign_recipients
  for select using (public.is_admin());

-- Freeze the audience: copy every current subscriber into the send list
-- and move the campaign from draft to sending. Returns the number of
-- recipients, or -1 if the campaign was not a draft (already started).
create or replace function public.start_email_campaign(p_campaign uuid)
returns integer
language plpgsql
set search_path = public
as $$
declare
  n integer;
begin
  update public.email_campaigns
     set status = 'sending', started_at = now(), updated_at = now(), last_error = null
   where id = p_campaign and status = 'draft';
  if not found then
    return -1;
  end if;

  insert into public.email_campaign_recipients (campaign_id, subscriber_id, email)
  select p_campaign, s.id, s.email
    from public.subscribers s
   where s.status = 'subscribed'
  on conflict do nothing;
  get diagnostics n = row_count;

  update public.email_campaigns set recipient_count = n where id = p_campaign;
  return n;
end;
$$;

-- Claim the next slice of recipients for sending. Rows claimed by a
-- request that died more than 10 minutes ago are picked up again.
-- `skip locked` keeps two open tabs from claiming the same people.
create or replace function public.claim_email_batch(p_campaign uuid, p_limit integer)
returns table (email text, subscriber_id uuid, name text, unsubscribe_token uuid, subscribed boolean)
language sql
set search_path = public
as $$
  with picked as (
    select r.campaign_id, r.email
      from public.email_campaign_recipients r
     where r.campaign_id = p_campaign
       and (r.status = 'pending'
            or (r.status = 'sending' and r.claimed_at < now() - interval '10 minutes'))
     order by r.email
     limit p_limit
     for update skip locked
  ), claimed as (
    update public.email_campaign_recipients r
       set status = 'sending', claimed_at = now()
      from picked p
     where r.campaign_id = p.campaign_id and r.email = p.email
    returning r.email, r.subscriber_id
  )
  select c.email, c.subscriber_id, s.name, s.unsubscribe_token,
         coalesce(s.status = 'subscribed', false)
    from claimed c
    left join public.subscribers s on s.id = c.subscriber_id;
$$;

-- Recount a campaign's results and mark it sent once nobody is left to
-- send to. Returns the resulting status, or 'completed' to exactly one
-- caller: the one whose call moved it from sending to sent (the row lock
-- makes concurrent callers queue).
create or replace function public.refresh_email_campaign(p_campaign uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  remaining integer;
  previous text;
  result text;
begin
  select status into previous from public.email_campaigns where id = p_campaign for update;

  select count(*) into remaining
    from public.email_campaign_recipients
   where campaign_id = p_campaign and status in ('pending', 'sending');

  update public.email_campaigns c
     set sent_count = (select count(*) from public.email_campaign_recipients r
                        where r.campaign_id = p_campaign and r.status = 'sent'),
         failed_count = (select count(*) from public.email_campaign_recipients r
                          where r.campaign_id = p_campaign and r.status = 'failed'),
         skipped_count = (select count(*) from public.email_campaign_recipients r
                           where r.campaign_id = p_campaign and r.status = 'skipped'),
         status = case when remaining = 0 then 'sent' else 'sending' end,
         sent_at = case when remaining = 0 then coalesce(c.sent_at, now()) else c.sent_at end,
         updated_at = now()
   where c.id = p_campaign
  returning c.status into result;

  if previous = 'sending' and result = 'sent' then
    return 'completed';
  end if;
  return result;
end;
$$;

revoke all on function public.start_email_campaign(uuid) from public, anon, authenticated;
revoke all on function public.claim_email_batch(uuid, integer) from public, anon, authenticated;
revoke all on function public.refresh_email_campaign(uuid) from public, anon, authenticated;
grant execute on function public.start_email_campaign(uuid) to service_role;
grant execute on function public.claim_email_batch(uuid, integer) to service_role;
grant execute on function public.refresh_email_campaign(uuid) to service_role;

-- Bring in everyone who already asked for The Build Letter.
insert into public.subscribers (email, name, source, consent_at)
select distinct on (lower(trim(e.email)))
       lower(trim(e.email)),
       nullif(nullif(trim(e.name), ''), 'Newsletter signup'),
       case when e.topic = 'Newsletter' then 'newsletter' else 'contact form' end,
       e.created_at
  from public.enquiries e
 where e.marketing_opt_in = true
   and e.topic not in ('Resource', 'Product waitlist', 'Event waitlist')
   and lower(trim(e.email)) ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
 order by lower(trim(e.email)), e.created_at
on conflict (email) do nothing;
