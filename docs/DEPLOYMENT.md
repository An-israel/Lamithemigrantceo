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

```bash
supabase functions deploy notify-enquiry
supabase secrets set RESEND_API_KEY=re_... \
  RESEND_FROM_EMAIL="Lami <hello@lamithemigrantceo.com>" \
  ENQUIRY_NOTIFY_EMAIL=aniekaneazy@gmail.com \
  SITE_URL=https://YOUR_DOMAIN
```

Then wire the enquiry notifier to the table:

Supabase dashboard → **Database → Webhooks → Create a new hook**:
- Table: `public.enquiries`
- Events: **Insert**
- Type: **HTTP Request** → POST to the `notify-enquiry` function URL.

### DNS — required before real sending works

Resend only sends from a **verified domain**. In Resend → **Domains → Add
domain**, then add the records it shows at Lami's registrar. Typically:

- **SPF** (TXT on root): `v=spf1 include:_spf.resend.com ~all`
- **DKIM** (CNAME records Resend generates, `resend._domainkey…`)
- Optionally a **DMARC** TXT record.

Until the domain is verified, `RESEND_FROM_EMAIL` falls back to Resend's
onboarding sender (`onboarding@resend.dev`) so testing is not blocked.

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

## Launch checklist

- [ ] Migrations run, seed reviewed and real content entered from `/admin`.
- [ ] Receipt numbers, stats band and prices **confirmed true** with Lami.
- [ ] Admin role granted; `/admin` unreachable when logged out / as a student.
- [ ] Magic-link sign-in works on a phone.
- [ ] Stripe test purchase completes and an order appears in `/admin/orders`.
- [ ] Enquiry form sends both emails.
- [ ] Domain verified for Resend; SPF + DKIM live.
- [ ] Privacy / Terms replaced with reviewed copy.
- [ ] Lighthouse mobile performance ≥ 90.
