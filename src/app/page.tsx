import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Section } from "@/components/Section";
import { TestimonialCard } from "@/components/TestimonialCard";
import { AuthorityStrip } from "@/components/AuthorityStrip";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Receipt } from "@/components/Receipt";
import { getTestimonials, getSettings } from "@/lib/data";

// §6.1 Choose your path
const PATHS = [
  {
    title: "Start a business",
    body: "You have ambition and a little to start with. Get the first steps.",
    href: "/start-here",
    cta: "Start Here",
  },
  {
    title: "Grow a product business",
    body: "You are selling already and need stock, systems and scale.",
    href: "/ecosystem#wholesale",
    cta: "Visit the Wholesale Hub",
  },
  {
    title: "Join the community",
    body: "Build alongside other African women, not in isolation.",
    href: "/movement",
    cta: "Join the Movement",
  },
  {
    title: "Book Lami",
    body: "A speaker who moves an audience to action, not just applause.",
    href: "/speaking",
    cta: "See Speaking",
  },
  {
    title: "Explore resources",
    body: "Free guides and The Build Letter to get moving today.",
    href: "/resources",
    cta: "Get Resources",
  },
];

// §6.5 The ecosystem
const ECOSYSTEM = [
  {
    name: "GBG Wholesale Hub",
    body: "Wholesale inventory and product opportunities for resellers and product-business owners.",
    href: "/ecosystem#wholesale",
    cta: "Visit the Wholesale Hub",
  },
  {
    name: "African Women Builds",
    body: "A community and movement helping African women build businesses, wealth and legacy.",
    href: "/movement",
    cta: "Join the Movement",
  },
  {
    name: "GBG Academy",
    body: "Practical business education for people starting and growing product businesses.",
    href: "/ecosystem#academy",
    cta: "Explore Programmes",
  },
  {
    name: "Build Her Empire Live",
    body: "The flagship in-person experience for ambitious African women business owners.",
    href: "/ecosystem#build-her-empire",
    cta: "View the Event",
  },
];

export default async function HomePage() {
  const [testimonials, settings] = await Promise.all([
    getTestimonials(),
    getSettings(),
  ]);

  return (
    <>
      {/* 1. HERO */}
      <section className="bg-shell">
        <div className="mx-auto max-w-content px-5 py-16 md:px-10 md:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[3fr_2fr]">
            <div>
              <p className="label text-clay">Lami — The Migrant CEO</p>
              <h1 className="mt-4 max-w-4xl">
                Build the Business.{" "}
                <span className="text-clay">Build the Wealth.</span>{" "}
                Build the Legacy.
              </h1>
              <p className="prose-measure mt-6 text-lg text-muted">
                Helping African women transform ambition into thriving businesses,
                financial freedom and generational wealth.
              </p>
              <p className="prose-measure mt-4 text-muted">
                I&rsquo;m Lami, The Migrant CEO — entrepreneur, educator, speaker and
                founder of African Women Builds. After rebuilding my life and
                businesses in the UK, I&rsquo;ve dedicated my work to helping African
                women create businesses that change not only their income, but their
                family&rsquo;s future.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/start-here" fullWidthMobile>
                  Start Here
                </ButtonLink>
                <ButtonLink href="/work-with-lami" variant="secondary" fullWidthMobile>
                  Work With Me
                </ButtonLink>
              </div>
              <p className="mt-6">
                <Link href="/about" className="text-clay underline underline-offset-4">
                  Watch my story →
                </Link>
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm pb-6 lg:pb-0">
              <Receipt
                items={settings.receipt_items ?? undefined}
                resold={settings.receipt_resold_gbp ?? undefined}
                note={settings.receipt_note ?? undefined}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHORITY STRIP */}
      <AuthorityStrip />

      {/* 3. SHORT STORY */}
      <Section background="shell">
        <div className="mx-auto max-w-prose">
          <h2>I rebuilt my life, so you can build yours.</h2>
          <p className="mt-6 text-muted">
            I built and ran businesses in Nigeria for years. In 2022 I moved to
            the United Kingdom and started again — new country, new rules, and
            less than £200 to my name. I rebuilt from there into product
            businesses, a wholesale operation with a physical warehouse, an
            education programme and a community of women doing the same.
          </p>
          <p className="mt-4 text-muted">
            From starting again to building an ecosystem. Business ownership is
            the beginning. Wealth and legacy are the destination.
          </p>
          <div className="mt-6">
            <Link href="/about" className="text-clay underline underline-offset-4">
              Read the full story →
            </Link>
          </div>
        </div>
      </Section>

      {/* 4. CHOOSE YOUR PATH */}
      <Section background="peach">
        <h2>What are you here to build?</h2>
        <p className="mt-3 max-w-prose text-muted">
          Pick the path that fits where you are. Each one points you to the
          right next step.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="card flex flex-col p-6 no-underline transition-colors hover:border-clay"
            >
              <h3 className="text-ink">{p.title}</h3>
              <p className="mt-2 flex-1 text-muted">{p.body}</p>
              <span className="mt-4 font-bold text-clay">{p.cta} →</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 5. THE ECOSYSTEM */}
      <Section background="shell">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2>One founder. A whole ecosystem.</h2>
            <p className="mt-3 max-w-prose text-muted">
              Education, wholesale, community and live events — built to move you
              from income to ownership.
            </p>
          </div>
          <ButtonLink href="/ecosystem" variant="secondary" className="hidden sm:inline-flex">
            Explore the ecosystem
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {ECOSYSTEM.map((e) => (
            <div key={e.name} className="card p-6">
              <h3>{e.name}</h3>
              <p className="mt-2 text-muted">{e.body}</p>
              <Link href={e.href} className="mt-4 inline-block font-bold text-clay">
                {e.cta} →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. IMPACT */}
      <Section background="peach">
        <div className="flex items-end justify-between gap-4">
          <h2>Real people. Real businesses.</h2>
          <ButtonLink href="/impact" variant="secondary" className="hidden sm:inline-flex">
            See the impact
          </ButtonLink>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6">
          {[
            ["30", "units sold out"],
            ["£1,000+", "first-revenue milestone"],
            ["50", "products sold"],
          ].map(([figure, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-bold text-clay md:text-3xl">
                {figure}
              </p>
              <p className="label mt-1 text-muted">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </Section>

      {/* 7. FEATURED STORY / VIDEO */}
      <Section background="ink">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="label text-gold-soft">Watch my story</p>
            <h2 className="mt-3 text-shell">From starting again to building an ecosystem.</h2>
            <p className="mt-4 text-shell/80">
              A short introduction to the journey — migration, rebuilding, and
              the movement it became.
            </p>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-card bg-shell/10">
            {/* TODO(lami): embed the 60–120s brand-story video (YouTube/Vimeo/Mux). */}
            <div className="flex h-full items-center justify-center text-shell/50">
              Brand story video (60–120s)
            </div>
          </div>
        </div>
      </Section>

      {/* 8. SPEAKING & PARTNERSHIPS */}
      <Section background="shell">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card p-8">
            <h3>Speaking</h3>
            <p className="mt-2 text-muted">
              Keynotes, panels and workshops on migration, rebuilding, and
              building businesses, wealth and legacy.
            </p>
            <ButtonLink href="/speaking" variant="secondary" className="mt-6">
              Book Lami to speak
            </ButtonLink>
          </div>
          <div className="card p-8">
            <h3>Partnerships</h3>
            <p className="mt-2 text-muted">
              Brand, media and institutional partnerships that reach an engaged
              African migrant-business audience.
            </p>
            <ButtonLink href="/work-with-lami" variant="secondary" className="mt-6">
              Explore partnerships
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* 9. THE BUILD LETTER */}
      <Section background="peach">
        <div className="mx-auto max-w-prose text-center">
          <h2>The Build Letter.</h2>
          <p className="mt-4 text-muted">
            Practical business, wealth and legacy insights, straight to your
            inbox. No fluff, no filler.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm theme="light" />
          </div>
        </div>
      </Section>

      {/* 10. FINAL CTA */}
      <Section background="ink">
        <div className="mx-auto max-w-prose text-center">
          <h2 className="text-shell">Your next chapter can start here.</h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink
              href="/start-here"
              className="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
            >
              Start Here
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
