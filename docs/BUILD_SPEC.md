# LamiTheMigrantCEO Website Build
## Structured prompt sequence for Lovable

Client: Lami (@lamithemigrantceo / @lamitheglamfairy)
Positioning: helps African migrants in the UK start a profitable product business on a small budget
Stack: Next.js + Tailwind + Supabase + Stripe, deployed on Vercel
Currency: GBP, Stripe Checkout on site

Run these prompts in order. Do not skip ahead. Each one assumes the previous is built and working.

---

## Before you paste anything: three things to settle with Lami

**1. The replica items cannot go on this site.**
Her TikTok grid includes "Replica designer items for sale." Counterfeit and replica branded goods are on Stripe's prohibited business list. If they appear on a site attached to her Stripe account, the realistic outcome is a frozen account and held payouts, which would take down her course revenue too. Keep the site to her own wholesale bundles, her jewelry packages, and her programs. Replica stock stays on WhatsApp or wherever she currently moves it, unlinked from the site. Worth saying to her plainly before you build.

**2. Build it in three releases, not one.**
Everything she asked for is achievable, but shipping all of it at once means nothing goes live for weeks and the admin panel gets tested last. Suggested order:
- Release 1 (prompts 1 to 12): brand site, programs, about, contact, admin for enquiries. She can point her link-in-bio at it immediately.
- Release 2 (prompts 13 to 18): Stripe checkout, wholesale shop, student login, product admin.
- Release 3 (prompts 19 to 22): GBG Hub membership, analytics, polish.

**3. Course video hosting.**
Supabase storage is not built for streaming video. If her programs include recorded modules, host video on Bunny Stream or Mux and store only the playback ID in Supabase. If her programs are live cohorts (which "Build Her Empire 2026 LIVE" suggests), the site only needs to sell the seat and email the joining details, which is far simpler. Confirm which before prompt 8.

---

# Part 1: Design system

## Prompt 1: Brand and design tokens

```
I am building a website for Lami, a UK-based business coach who helps African
migrants start profitable product businesses on a small budget. Her audience is
women, mostly 25 to 45, African migrants living in the UK. The site must feel
warm, bright, expensive and calm. Not girly, not pastel-cute, not corporate.
Think a well-made independent brand, not a template.

Set up the design system first. Create these as CSS custom properties in
globals.css and mirror them in the Tailwind config so I can use them as
utility classes.

COLOUR
--shell:      #FCF4EF   page background, warm off-white with a peach cast
--peach:      #F7DCCB   full-bleed section tint, used as blocks not accents
--peach-deep: #EFC3A8   card backgrounds, hover states on tinted sections
--clay:       #B5502F   primary. buttons, links, active states
--clay-deep:  #8E3C22   button hover and pressed
--ink:        #2A1B14   all body and heading text, a warm near-black brown
--muted:      #8B7469   secondary text, captions, form hints
--jade:       #2F5548   rare accent. only for status: enrolled, paid, verified
--line:       #E8D5C7   hairline borders and dividers

Never use pure black or pure white anywhere. Never use grey. If something needs
to recede, use --muted. If something needs to separate, use --line.

TYPE
Load from Google Fonts:
- Fraunces, with the WONK axis on and optical sizing enabled. This is the
  display face. Use it ONLY for page titles, section titles and pull quotes.
  Weights 500 and 700. Never below 24px.
- Karla for everything else: body copy, buttons, labels, form fields, nav,
  prices, admin panel. Weights 400, 500, 700.

Type scale (mobile / desktop):
h1  36px / 60px   Fraunces 700, line-height 1.05, letter-spacing -0.02em
h2  28px / 40px   Fraunces 500, line-height 1.15
h3  20px / 24px   Karla 700, line-height 1.3
body 16px / 17px  Karla 400, line-height 1.65, max-width 68 characters
label 12px        Karla 700, uppercase, letter-spacing 0.12em, colour --muted
price 20px / 24px Karla 700, font-variant-numeric: tabular-nums

LAYOUT
Max content width 1140px. Gutter 20px on mobile, 40px on desktop.
Vertical rhythm: sections are 72px tall on mobile, 120px on desktop.
Border radius: 4px on inputs and small chips, 12px on cards, 999px on pills.
Never use drop shadows for depth. Use --line borders and --peach fills instead.
One exception: the primary buy button may carry a soft shadow.

BUTTONS
Primary: --clay fill, --shell text, 14px vertical padding, 28px horizontal,
12px radius, Karla 700 at 16px. Hover moves to --clay-deep and lifts 1px.
Full width on mobile, auto width on desktop. Minimum tap target 48px.
Secondary: transparent fill, 1.5px --clay border, --clay text, same sizing.
Every button label must say what happens: "Join Build Her Empire", "Send message",
"Add to order". Never "Submit", never "Click here", never "Learn more".

MOTION
Almost none. A 200ms ease on hover colour and a single fade-and-rise on section
scroll-in at 400ms. Respect prefers-reduced-motion and disable all of it.

ACCESSIBILITY FLOOR
Visible focus rings in --clay on every interactive element. All text on --peach
and --shell must pass WCAG AA. Alt text on every image.

Build only the token layer and a demo page showing every text style, both
buttons, a card, an input and a form error state. I will review before we
build any real pages.
```

## Prompt 2: Layout shell

```
Now build the global layout shell.

HEADER
Sticky, --shell background, 1px --line bottom border, 72px tall.
Left: wordmark "LAMI" in Fraunces 700 at 22px, with "THE MIGRANT CEO" beneath
in the label style. Links to home.
Centre on desktop: Programs, Wholesale, About, Contact.
Right: one primary button, "Book a call".
Mobile: wordmark left, hamburger right. The menu opens as a full-screen --peach
panel with links at h2 size, stacked, with the primary button pinned at the
bottom. Close with an X in the top right.

FOOTER
--ink background, --shell text. Three columns on desktop, stacked on mobile.
Column 1: wordmark, then her one-line positioning: "I help African migrants in
the UK build profitable product businesses."
Column 2: page links.
Column 3: Instagram, TikTok, and a WhatsApp link. Below them, an email capture
with a single field and a "Get the free starter list" button. Store submissions
in Supabase later, for now just build the UI.
Bottom bar: copyright, privacy policy link, terms link.

Also build a reusable Section component that takes a background prop of
"shell" or "peach" or "ink" and applies the correct vertical padding, so the
whole site alternates cleanly.
```

---

# Part 2: Public site

## Prompt 3: Homepage hero

```
Build the homepage hero. This is the most important screen on the site.

Her single strongest asset is the line "I started with £200." Build the hero
around it rather than around a generic headline over a photo.

Layout, desktop: two columns, 55/45.
Left column:
  - Label: "UK product business coach"
  - h1: "I started with £200." then on a second line in --clay:
    "You can start with less than you think."
  - Body: one paragraph, maximum 30 words, on who she helps and what changes.
  - Two buttons side by side: primary "See the programs", secondary "Watch her story"
  - Below them, a thin trust row: "9,500+ on TikTok · 3 live programs · UK wholesale hub"

Right column, THE SIGNATURE ELEMENT:
  A receipt. Styled as an actual paper receipt on a --shell card with a torn
  zigzag bottom edge (use a CSS clip-path, not an image). Header reads
  "STARTING STOCK · RECEIPT". Then line items in tabular figures:
     Mixed jewelry bundle        £  85.00
     Packaging and labels        £  22.00
     Postage float               £  18.00
     Sample stock                £  45.00
     Business cards              £  30.00
     ----------------------------------
     TOTAL                       £ 200.00
     RESOLD FOR                  £ 640.00
     MARGIN                      £ 440.00   (in --jade)
  Below the tear, small --muted text: "Her actual first order, 2021."

  On scroll into view, the line items count up one at a time over 900ms total.
  Disabled under prefers-reduced-motion.

Mobile: single column, receipt below the buttons, full width.

CONFIRM the receipt numbers with Lami before launch. Placeholder them clearly
in the code with a TODO comment. They must be true.
```

## Prompt 4: Homepage body

```
Continue the homepage. Sections in this order, alternating --shell and --peach.

1. WHO THIS IS FOR (--peach)
   h2 "You moved here to build something."
   Three cards, --shell fill, --line border, 12px radius. Each has a short
   heading in Karla 700 and two lines of body. No icons.
   Card 1: "You have a job but not a future"
   Card 2: "You tried selling and it stalled"
   Card 3: "You have £200 and no idea where to put it"

2. PROGRAMS (--shell)
   h2 "Three ways to work with me."
   Three cards pulled from the Supabase programs table (build with mock data
   for now). Each card: cover image at 4:3, program name in Karla 700, one
   line of outcome copy, format chip ("Live cohort" or "Self-paced"), price in
   the price style with GBP symbol, and a primary button "See what is included".
   Price must be visible on the card without hovering or clicking. If a program
   is sold out, replace the button with a --jade pill reading "Next cohort soon".

3. RESULTS (--peach)
   h2 "What they built."
   A horizontally scrolling row of student cards on mobile, three-up grid on
   desktop. Each: photo, name, one sentence in her student's own words, and
   the concrete number ("£1,200 in her first month"). Pull from a Supabase
   testimonials table. Build with three placeholders.

4. WHOLESALE STRIP (--ink)
   h2 in --shell "GBG Wholesale Hub"
   Two lines of copy on what the hub is and a secondary button in --peach
   border, "See this month's bundles".

5. FINAL CTA (--shell)
   h2 "Start with what you have."
   One line of copy, one primary button "Book a free 15 minute call".

Every section heading must be a full sentence with a full stop. No one-word
headings, no "Our Services", no "Why Choose Us".
```

## Prompt 5: About page

```
Build the About page. This page carries her authority, so it must read like a
story and not a CV.

Hero: --peach background. h1 "From a £200 order to a warehouse." Below it a
single wide photo of her, 16:9, rounded 12px.

Then a narrative section, single column, 68 characters wide, centred. Body copy
with three pull quotes in Fraunces 500 at h2 size, --clay coloured, breaking
the column with 40px of space above and below. Structure the writing as:
  - Arriving in the UK and what was hard
  - The first £200 order and what she got wrong
  - What changed when she started teaching it
  - What she is building now

Then a timeline. This is a real sequence so number it 01 to 05, in the label
style, --clay coloured, with a 1px --line rule down the left. Each entry: year,
one line of what happened. End at "Warehouse keys, on my birthday" which is one
of her top-performing videos.

Then a stats band on --ink: three figures in Fraunces 700 at 48px in --peach.
Students taught, orders shipped, years in business. Confirm real numbers with
her, TODO comment them until she supplies them.

End with the standard final CTA block from the homepage.
```

## Prompt 6: Programs index and detail pages

```
Build /programs and /programs/[slug].

INDEX PAGE
h1 "Programs." Then a filter row of pills: All, Live cohort, Self-paced.
Cards in a two-column grid on desktop, one on mobile, same card design as the
homepage but larger, with three bullet outcomes added under the description.
Price always visible. Sold out state as before.

DETAIL PAGE
Above the fold, two columns on desktop:
  Left: program name as h1, one paragraph of outcome copy, then "What you get"
  as a list of six items with a small --clay check mark. Then format, duration,
  start date and who it is for as a definition list with labels in the label
  style.
  Right, sticky on desktop: the buy card. --peach-deep fill, 12px radius,
  --line border. Contains cover image, price in the price style at 32px,
  a strikethrough original price if one exists, the start date, a full-width
  primary button "Join for £X", and beneath it in --muted 13px: "Secure card
  payment. Instant access by email."
  On mobile the buy card becomes a fixed bottom bar with the price on the left
  and the button on the right, always visible while scrolling.

Below: curriculum accordion (module title, one line of description), then
testimonials filtered to this program, then an FAQ accordion, then a final CTA.

All content comes from Supabase. Do not hardcode.
```

## Prompt 7: Contact page

```
Build /contact. The goal is that contacting her takes one tap.

Top: h1 "Talk to Lami." One line of body: "Tell me where you are and I will
tell you the next step."

Two columns on desktop. Left is the form, right is a --peach card with three
direct contact options as large tappable rows, each 64px tall with a --line
divider between them:
  - WhatsApp (opens wa.me link in a new tab)
  - Email (mailto)
  - Book a call (Calendly embed link)
Each row: label on the left, the actual handle or number in --muted beneath,
chevron on the right.

FORM FIELDS
  Full name (required)
  Email (required, validated)
  WhatsApp number (optional)
  What do you need help with? (select: Joining a program, Wholesale bundles,
    Speaking or press, Something else)
  Message (textarea, required, 500 char limit with a live counter)
  A checkbox: "Send me occasional emails about new programs" (unchecked default)

Submit button: "Send message". While sending, the label becomes "Sending...".
On success the form is replaced by a --jade bordered panel: "Message sent.
Lami replies within one working day." with a secondary button "Send another".
On failure: an inline error above the button in --clay that says what went
wrong and tells them to try WhatsApp instead. Errors do not apologise and are
never vague.

Store every submission in a Supabase table called enquiries with columns:
id, created_at, name, email, whatsapp, topic, message, marketing_opt_in,
status (new / read / replied), source_page.
```

## Prompt 8: Email notifications

```
Wire up email so Lami is notified the moment someone contacts her.

Use Resend. Create a Supabase edge function called notify-enquiry that fires
on insert into the enquiries table and sends two emails:

1. To Lami: subject "New enquiry: [topic] from [name]". Body contains every
   field, plainly laid out, plus a direct link to that enquiry in the admin
   panel and a mailto link to reply. Plain text is fine, do not build a fancy
   template.

2. To the person who wrote in: subject "I got your message". Two sentences
   confirming receipt and saying she replies within one working day. Signed
   from Lami. Include her WhatsApp link.

Store the Resend API key as a Supabase secret, never in the client.

IMPORTANT: Resend will only send from a verified domain. Before this works,
her domain needs an SPF and DKIM record added at her DNS provider. Flag this
to me as a manual step with the exact records to add. Until the domain is
verified, fall back to Resend's onboarding sender so testing is not blocked.
```

---

# Part 3: Payments and shop

## Prompt 9: Stripe checkout

```
Add Stripe Checkout for one-off program purchases. Currency GBP.

Create a Supabase edge function create-checkout-session that takes a program
id, looks up the real price from the database (never trust a price sent from
the browser), creates a Stripe Checkout Session in GBP, and returns the URL.

Create a second edge function stripe-webhook that listens for
checkout.session.completed and:
  - inserts a row into an orders table (id, created_at, stripe_session_id,
    email, name, item_type, item_id, amount_gbp, status)
  - creates or finds a user record for that email
  - grants access to the purchased program
  - sends a confirmation email via Resend with what they bought and what
    happens next

Verify the webhook signature. Handle the webhook arriving twice for the same
session without creating duplicate orders.

Success page at /thank-you: --peach background, h1 "You are in.", the order
summary, and clear next steps. Cancel page at /checkout-cancelled with a
sentence explaining nothing was charged and a button back to the program.

Store the Stripe keys as Supabase secrets. Use test keys until Lami confirms
her live account is ready.
```

## Prompt 10: Wholesale shop

```
Build /wholesale, the GBG Wholesale Hub storefront.

Hero: --ink background, h1 in --shell "Buy the stock. Sell it on."
Two lines explaining what wholesale bundles are and who they are for.

Then a product grid: three columns desktop, two on mobile (these are visual
products, small cards work here). Each card:
  - Product image, square, 12px radius. Multiple images become a small
    dot-paginated carousel on the card.
  - Product name, Karla 700
  - One line: what is inside the bundle
  - Unit count chip: "24 pieces"
  - Price in the price style, and directly beneath in --muted 13px:
    "Typical resale £X" with the difference shown in --jade. This is the whole
    reason someone buys, so it must be on the card, not hidden on a detail page.
  - Primary button "Add to order"
  - If stock is zero: card desaturates, button becomes a disabled pill
    "Sold out" and a small "Tell me when it is back" text link that captures
    an email into a restock_alerts table.

Filters along the top as pills: All, Jewelry, Accessories, Under £100.

Product detail page at /wholesale/[slug]: image gallery left, buy panel right,
what is inside as a list, sizing or material notes, shipping and returns
accordion, and three related bundles at the bottom.

Cart: a slide-over panel from the right, --shell background. Line items with
quantity steppers, subtotal, and a "Checkout" primary button. Persist the cart
in localStorage. Checkout goes through the same Stripe function, extended to
accept multiple line items and to collect a UK shipping address.
```

## Prompt 11: Student area

```
Build a simple logged-in area at /my. Supabase Auth, magic link only, no
passwords. Her audience should never have to remember a password.

/my shows: a greeting with their first name, then their purchased programs as
cards, each linking to /my/[program-slug]. Below that, their order history as
a simple table with date, item, amount and a receipt link.

/my/[program-slug]: the module list down the left on desktop, content on the
right. Each module has a title, a description, an optional video embed, and
optional downloadable files from Supabase storage. Mark modules complete with
a checkbox that persists. Show a thin --clay progress bar at the top.

If someone visits a program they have not bought, show a --peach panel:
"You do not have access to this program yet." with a button to the sales page.

Empty state for a new account with no purchases: not an error, an invitation.
"Nothing here yet." plus a button "See the programs".
```

---

# Part 4: Admin panel

## Prompt 12: Admin shell and access

```
Build the admin panel at /admin. This is Lami's control room, so it must be
plain, fast and impossible to misuse. Use the same tokens but a denser layout:
smaller type, tighter spacing, --shell background, no Fraunces except on the
page title.

Access: a role column on the users table. Only role = 'admin' can reach any
/admin route. Enforce this in Supabase row level security, not just in the UI.
Anyone else gets a 404, not a login prompt.

Layout: fixed left sidebar 240px wide on desktop, --ink background, --shell
text. Nav items: Dashboard, Enquiries, Programs, Wholesale, Orders, Students,
Analytics, Settings. Active item gets a --clay left border. On mobile the
sidebar collapses to a bottom tab bar with the five most used sections.

Dashboard page: six stat cards in a grid showing new enquiries this week,
orders this month, revenue this month, active students, site visitors this
week, and top page. Beneath, the five most recent enquiries and the five most
recent orders as compact lists, each linking through.

Everything in the admin panel is named for what Lami controls, never for how
it is built. "Programs" not "content entries". "Enquiries" not "form
submissions table".
```

## Prompt 13: Enquiries inbox

```
Build /admin/enquiries. This is the page she will use most.

A table on desktop, cards on mobile. Columns: status dot, name, topic, first
40 characters of the message, date, and a chevron. Newest first.

Status dots: --clay filled for new, --line hollow for read, --jade for replied.

Filter row: All, New, Read, Replied. Plus a search box that matches name,
email and message text.

Clicking a row opens a slide-over from the right with the full message, all
their details, and three buttons: "Reply by email" (mailto with their address
and a subject prefilled), "Message on WhatsApp" (wa.me link using their number,
only shown if they gave one), and a status selector. Add a private notes field
that only she can see, saved on blur.

Bulk actions: select multiple rows, mark as read, or export selected to CSV.

Empty state: "No enquiries yet. When someone uses the contact form it lands
here." with a link to view the contact page.
```

## Prompt 14: Programs manager

```
Build /admin/programs so Lami can add a new program tomorrow without me.

List view: every program with cover thumbnail, name, price, format, status
(draft / live / sold out), students enrolled, and an edit button. A primary
"Add a program" button top right. Drag to reorder how they appear on the site.

Editor at /admin/programs/[id]: a single scrolling form, autosaving to draft
every 10 seconds with a small "Saved" indicator, not a modal.
Fields:
  - Name, URL slug (auto-generated from name, editable)
  - Short description (the one line used on cards, 120 char limit with counter)
  - Full description (rich text: bold, italic, links, bullets, headings only)
  - Cover image (drag and drop upload to Supabase storage, shows a live preview
    at the exact 4:3 crop the cards use, warns if the file is over 500KB)
  - Price in GBP, and an optional "compare at" price
  - Format: Live cohort or Self-paced
  - Start date and duration
  - Who it is for (list, add and remove rows)
  - What you get (list of six, add and remove rows)
  - Curriculum modules (repeatable rows: title, description, drag to reorder)
  - FAQs (repeatable rows: question, answer)
  - Status toggle: Draft, Live, Sold out
  - A "Preview" button that opens the public page in a new tab

Image uploads must auto-compress and convert to WebP on upload. Lami will be
uploading designs she has made herself, so accept PNG and JPG at any size and
handle the resizing for her. Never let a 4MB PNG reach the live site.

The same editor pattern is reused for wholesale products in the next prompt,
so build the repeatable-row and image-upload pieces as shared components.
```

## Prompt 15: Wholesale and orders admin

```
Build /admin/wholesale and /admin/orders.

WHOLESALE
List view with thumbnail, name, price, stock count, status. Low stock (under 5)
shows the count in --clay. Add, edit, duplicate and archive. Never hard delete,
archive instead, so old orders keep their product reference.

Product editor: name, slug, description, what is inside, unit count, price,
typical resale value, stock quantity, category, and a multi-image uploader with
drag to reorder (the first image is the card image). Same compression rules.

ORDERS
Table: order number, date, customer name, email, items, total, payment status,
fulfilment status. Filter by status and date range. Search by name, email or
order number.

Order detail slide-over: full line items, amounts, the shipping address, the
Stripe payment link, and a fulfilment status selector (New, Packed, Shipped,
Delivered). When she sets it to Shipped, show an optional tracking number field
and send the customer an email with it via Resend.

Export orders to CSV for a date range, because she will need this for her
accountant.
```

## Prompt 16: Analytics

```
Build /admin/analytics showing site traffic.

Create a page_views table: id, created_at, path, referrer, country, device
type, and a hashed session id. Log a row on every page view from a small client
hook. Hash the session id, do not store IP addresses, and do not set any
cookie that would require a consent banner.

The page shows, for a selectable range (7 days, 30 days, 90 days, all time):
  - Visitors and page views as two big figures with the change against the
    previous period, up in --jade and down in --clay
  - A line chart of visitors per day
  - Top pages, as a bar list with counts
  - Where visitors came from, grouped into TikTok, Instagram, Google, Direct
    and Other. This is the one she will care about most, so put it high on the
    page and make the TikTok row prominent.
  - Device split: mobile, desktop, tablet
  - Countries, top ten

Also show a conversion row: visitors, contact form submissions, orders, and the
percentage between each step.

Be honest in the UI about what this does not measure: add one line of --muted
text at the bottom saying figures exclude visitors using ad blockers.
```

## Prompt 17: Settings and content

```
Build /admin/settings so the things Lami will want to change are not buried
in code.

Sections:
  - Contact details: WhatsApp number, public email, Calendly link, social
    handles. These feed the header, footer and contact page everywhere.
  - Homepage: the hero headline, the hero paragraph, and the receipt line items
    with their amounts, all editable. She should be able to update the receipt
    without calling me.
  - Testimonials: add, edit, reorder, archive. Fields: name, photo, quote,
    result figure, which program.
  - Announcement bar: a toggle, a message, and an optional link. When on, it
    shows as a --clay strip above the header sitewide.
  - Team: invite another admin by email, and remove admin access.

Every settings change writes to a single site_settings table and takes effect
immediately, no rebuild.
```

---

# Part 5: Ship

## Prompt 18: SEO, performance and launch checks

```
Final pass before launch.

SEO
  - Unique title and meta description on every page, editable from admin on
    programs and products
  - Open Graph image on every page, defaulting to a branded card if none set
  - Product and course structured data (JSON-LD) so Google shows prices
  - sitemap.xml and robots.txt
  - Canonical URLs

PERFORMANCE
  - All images through next/image with correct sizes attributes
  - Fonts self-hosted with font-display: swap, preload only Fraunces 700 and
    Karla 400
  - No layout shift on load. Reserve space for the hero receipt and all images.
  - Target: Lighthouse mobile performance above 90

LEGAL, since she is selling into the UK
  - Privacy policy and terms pages, with placeholder copy clearly marked TODO
    for her solicitor or a template service to fill
  - Refund policy stated on every checkout page
  - Cookie banner only if we end up adding any non-essential cookie. With the
    analytics built as specified, we do not need one.

CHECKS
  - Every form tested for the failure path, not just the happy path
  - Test the whole checkout with a Stripe test card end to end
  - Keyboard-only navigation through the entire site
  - Test at 320px width
  - Confirm the admin panel is genuinely unreachable when logged out and when
    logged in as a normal student
```

---

## What to hand Lami at the end

A one-page guide covering: how to add a program, how to add a wholesale
bundle, where enquiries arrive, how to mark an order shipped, and how to read
the analytics page. Written for someone who has never used a CMS. Keep it under
600 words with a screenshot per task.

## Open questions to close before you start

1. Does she own a domain already, and who is the registrar?
2. Is her Stripe account live and UK-registered, and under which business name?
3. Are the three programs still current, and what are the real prices?
4. What are the true numbers for the receipt block and the stats band?
5. Does she want the wholesale hub open to everyone, or gated behind an
   application?
6. Recorded course video or live cohorts only?
