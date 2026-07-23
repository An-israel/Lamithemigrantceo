# Lami the Migrant CEO

The website for Lami — a UK-based coach who helps African migrant women start a
profitable product business on a small budget. Programs, a wholesale hub, 1:1
mentorship, a student area and an admin control room.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres + Auth + Storage + Edge Functions) · Stripe (GBP) · Resend · Vercel.

> **Compliance note:** replica / counterfeit designer goods are on Stripe's
> prohibited list and must **not** appear anywhere on this site. Keep the shop
> to Lami's own wholesale bundles, jewelry packages and programs.

---

## What's built

| Area | Status |
| --- | --- |
| Design system (tokens, type, buttons, motion) | ✅ Release 1 |
| Layout shell (header, mobile menu, footer, sections) | ✅ Release 1 |
| Homepage (hero + animated receipt, body sections) | ✅ Release 1 |
| About, Programs index + detail, Contact | ✅ Release 1 |
| Contact form → Supabase `enquiries` + email notify | ✅ Release 1 |
| Admin shell, dashboard, enquiries inbox, settings | ✅ Release 1 |
| Auth (magic link), student area `/my` | ✅ Release 1/2 |
| Stripe checkout for programs + webhook | ✅ scaffolded |
| Wholesale storefront (cart/checkout) | 🚧 Release 2 |
| Programs & wholesale editors, orders fulfilment | 🚧 Release 2 |
| Analytics, announcement/testimonials admin | 🚧 Release 3 |
| SEO (sitemap, robots, OG, JSON-LD), legal pages | ✅ / 🚧 |

See `docs/lamiwebsitebuildprompts.md`-style spec was the source of truth; the
three-release plan is preserved in the roadmap above.

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
#    then fill in the Supabase anon key + service role key (and Stripe/Resend
#    when you're ready). See docs/DEPLOYMENT.md for exactly where to find each.

# 3. Database — run the SQL in supabase/migrations against the project
#    (Supabase dashboard → SQL editor, or `supabase db push`).

# 4. Run
npm run dev        # http://localhost:3000
npm run typecheck  # type safety
npm run build      # production build
```

The site renders with built-in seed content even before the database is
populated, so you can develop the UI immediately. Real Supabase data always
takes precedence over the seed.

---

## Project structure

```
src/
  app/            App Router pages, API routes, sitemap/robots
    api/          enquiries, newsletter, checkout (Stripe)
    admin/        control room (guarded by middleware + RLS)
    my/           student area (auth-gated)
  components/     UI + admin components
  lib/            supabase clients, types, data layer, helpers
  middleware.ts   session refresh + /admin & /my guards
supabase/
  migrations/     schema (0001) + seed (0002), with full RLS
  functions/      notify-enquiry, create-checkout-session, stripe-webhook
docs/             deployment guide + Lami's plain-English guide
```

---

## Deploying

Full step-by-step (Supabase, Vercel, Stripe, Resend, DNS) lives in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## For Lami

A no-jargon guide to running the site — adding a program, reading enquiries,
marking orders shipped — is in [`docs/LAMI_GUIDE.md`](docs/LAMI_GUIDE.md).
