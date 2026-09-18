# Deployment guide

Everything needed to take this from repo to live site. Do the steps in order.

---

## 1. Supabase (project: `mnhpprzuheyowtiuibat`)

### 1a. Run the database migrations

Supabase dashboard → **SQL editor** → paste and run, in order:

1. `supabase/migrations/0001_init.sql` — tables, enums, RLS, triggers.
2. `supabase/migrations/0002_seed.sql` — placeholder content (edit later from
   the admin panel).
3. `supabase/migrations/0003_release2.sql` — `media` storage bucket + policies,
   editable homepage receipt, and anon insert policies for analytics
   (`page_views`) and restock alerts.
4. `supabase/migrations/0004_brief.sql` — routed-enquiry fields (organisation,
   event date, budget), and the CMS tables from the client brief: journal
   posts, bio links (link-in-bio), resources, impact stats, plus the
   `increment_bio_click` RPC. Run this alongside the others.
5. `supabase/migrations/0005_platform.sql` — Phase 4: `events` (+ ticketing),
   `memberships` (African Women Builds join), `applications` (programme
   applications), `ventures` (future ventures), and the
   `increment_tickets_sold` RPC. Seeds Build Her Empire Live.

Running `0003` also creates the image-upload bucket, so the admin editors work
out of the box — you can skip the manual bucket step in section 5.

Or with the CLI:

```bash
supabase link --project-ref mnhpprzuheyowtiuibat
supabase db push
```

### 1b. Get your keys

Dashboard → **Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  (already `https://mnhpprzuheyowtiuibat.supabase.co`)
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server only — keep secret)

### 1c. Auth settings

Dashboard → **Authentication → URL Configuration**:

- **Site URL**: your production URL (e.g. `https://lamithemigrantceo.com`)
- **Redirect URLs**: add `https://YOUR_DOMAIN/auth/callback` and
  `http://localhost:3000/auth/callback`

Email → enable **Magic Link**. (Passwordless is intentional.)

### 1d. Make yourself an admin

After you sign in once (so your `auth.users` row exists), run in the SQL editor:

```sql
update public.users set role = 'admin' where email = 'aniekaneazy@gmail.com';
```

Admin access is enforced in the middleware **and** in Postgres RLS via the
`is_admin()` function — a non-admin gets a 404 at `/admin`, never a login page.

---

## 2. Vercel

1. Import the GitHub repo into Vercel.
2. Framework preset: **Next.js** (auto-detected). No build overrides needed.
3. Add the environment variables from `.env.example` under
   **Settings → Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - Stripe + Resend keys when ready (below).
4. Deploy. Set the custom domain under **Settings → Domains**.

---

## 3. Stripe (GBP)

1. Create products/prices are **not** needed — prices come from the database.
2. Get **test** keys (Dashboard → Developers → API keys):
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Deploy the webhook function and point Stripe at it:

   ```bash
   supabase functions deploy stripe-webhook
   supabase secrets set STRIPE_SECRET_KEY=sk_test_... \
     SUPABASE_URL=https://mnhpprzuheyowtiuibat.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=... \
     SITE_URL=https://YOUR_DOMAIN
   ```

   Stripe dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://mnhpprzuheyowtiuibat.functions.supabase.co/stripe-webhook`
   - Event: `checkout.session.completed`
   - Copy the signing secret → `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

4. Test end-to-end with card `4242 4242 4242 4242`.
5. Only switch to **live** keys once Lami confirms her live, UK-registered
   Stripe account is ready.

> The Next.js `/api/checkout` route returns a friendly "use WhatsApp to enrol"
> message while `STRIPE_SECRET_KEY` is still the placeholder, so the site never
> shows a broken button pre-launch.

---

## 4. Resend (email)

No CLI, no Supabase Edge Function, no Database Webhook — the enquiry-email
sending lives in `src/app/api/enquiries/route.ts` itself, right after it
saves the message, so it just needs the same env vars as everything else.
In Vercel → **Settings → Environment Variables**, add:

- `RESEND_API_KEY` — from Resend dashboard → **API Keys**
- `RESEND_FROM_EMAIL` — e.g. `Lami <hello@lamithemigrantceo.com>`
- `ENQUIRY_NOTIFY_EMAIL` — where new-enquiry notifications land, e.g.
  `aniekaneazy@gmail.com`

Redeploy (or just wait for the next push) and both emails — the notification
to Lami and the "I got your message" confirmation to whoever wrote in — send
automatically on every enquiry, no further setup.

### DNS — required before real sending works

Resend only sends from a **verified domain**. In Resend → **Domains → Add
domain**, then add the records it shows at Lami's registrar. Typically:

- **SPF** (TXT on root): `v=spf1 include:_spf.resend.com ~all`
- **DKIM** (CNAME records Resend generates, `resend._domainkey…`)
- Optionally a **DMARC** TXT record.

Until the domain is verified, `RESEND_FROM_EMAIL` falls back to Resend's
onboarding sender (`onboarding@resend.dev`) so testing is not blocked.

### Newsletter → real mailing list

The footer signup adds subscribers to a Resend Audience so they're an actual
sendable list, not just rows in the enquiries inbox:

1. Resend dashboard → **Audiences → Create audience**.
2. Copy its id → `RESEND_AUDIENCE_ID` (Vercel env vars + `.env.local`).

Optional: without this, signups still work and are still recorded as
enquiries, they just won't be added to a list until it's set.

---

## 5. Storage (for uploaded program/product images, Release 2)

Create a **public** bucket named `media`:

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
```

`next.config.mjs` already whitelists the Supabase storage host for `next/image`.

---

## 6. Backups and staging

**Database backups.** Supabase's free tier keeps no automatic backups beyond
a few hours of PITR — not enough to recover from a bad migration or an admin
mistake. Before launch:

- Upgrade to the **Pro** plan (Project Settings → Billing) to get daily
  backups with 7-day retention, or **Team/Enterprise** for point-in-time
  recovery to any second.
- For an extra manual snapshot before anything risky (a migration, a bulk
  edit), run `supabase db dump --project-ref mnhpprzuheyowtiuibat -f backup.sql`
  and keep the file somewhere safe.

**Staging environment.** Right now every Vercel Preview deployment (every
PR) points at the **same** Supabase project as production — there is no
isolated environment to test against. Before relying on previews for
real testing:

1. Create a second Supabase project (e.g. `lamithemigrantceo-staging`) and
   run the same migrations against it.
2. In Vercel → **Settings → Environment Variables**, scope the
   `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` vars to
   **Production** only, and add a second set scoped to **Preview** pointing
   at the staging project.
3. Use Stripe **test** keys and a second Resend audience for the staging
   project so test traffic never touches real customer data or sends real
   email.

Until this is set up, treat every preview deployment as if it can write to
production data — because it can.

---

## Launch checklist

- [ ] Migrations run, seed reviewed and real content entered from `/admin`.
- [ ] Receipt numbers, stats band and prices **confirmed true** with Lami.
- [ ] Admin role granted; `/admin` unreachable when logged out / as a student.
- [ ] Magic-link sign-in works on a phone.
- [ ] Stripe test purchase completes and an order appears in `/admin/orders`.
- [ ] Enquiry form sends both emails (requires `RESEND_API_KEY`,
      `RESEND_FROM_EMAIL`, `ENQUIRY_NOTIFY_EMAIL` set in Vercel — section 4).
- [ ] Newsletter signups land in the Resend Audience, not just enquiries
      (requires `RESEND_AUDIENCE_ID`, section 4).
- [ ] Domain verified for Resend; SPF + DKIM live.
- [ ] Privacy / Terms replaced with reviewed copy.
- [ ] Lighthouse mobile performance ≥ 90.
- [ ] Supabase Pro (or equivalent) enabled for real backup retention, and a
      staging project set up per section 6, before this stops being a toy.
- [ ] **Next.js major-version upgrade.** `npm audit` currently reports a
      critical unauthenticated RCE (GHSA-2xp9-vwfh-vxw4) in Next's Image
      Optimization API, only patched at `next@>=15.5.24` — 14.2.35 (installed)
      is the latest 14.x release and was never patched for it. AVIF output is
      disabled in `next.config.mjs` as an interim mitigation (the RCE requires
      AVIF), but the only real fix is upgrading past Next 14, which is a
      breaking-change migration (async `cookies()`/`params`/`searchParams`,
      React 19) affecting most routes — plan it as its own tested PR, not a
      quick patch bump.
