import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Section } from "@/components/Section";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { AuthorityStrip } from "@/components/AuthorityStrip";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getTestimonials, getSettings, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

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
    cta: "Explore Products",
  },
  {
    name: "Build Her Empire Live",
    body: "The flagship in-person experience for ambitious African women business owners.",
    href: "/ecosystem#build-her-empire",
    cta: "View the Event",
  },
];

export default async function HomePage() {
  const [testimonials, settings, siteContent] = await Promise.all([
    getTestimonials(),
    getSettings(),
    getSiteContent(),
  ]);
  const c = (key: string) => content(siteContent, key);

  return (
    <>
      {/* 1. HERO */}
      <section className="bg-shell">
        <div className="mx-auto max-w-content px-5 py-16 md:px-10 md:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[3fr_2fr]">
            <div>
              <p className="label text-clay">{c("home.hero.kicker")}</p>
              {settings.hero_headline ? (
                <h1 className="mt-4 max-w-4xl">{settings.hero_headline}</h1>
              ) : (
                <h1 className="mt-4 max-w-4xl">
                  Build the Business.{" "}
                  <span className="text-clay">Build the Wealth.</span>{" "}
                  <span className="text-gold">Build the Legacy.</span>
                </h1>
              )}
              <p className="prose-measure mt-6 text-lg text-muted">
                {settings.hero_paragraph ||
                  "Helping African women transform ambition into thriving businesses, financial freedom and generational wealth."}
              </p>
              <p className="prose-measure mt-4 text-muted">
                I&rsquo;m Lami, The Migrant CEO: entrepreneur, educator, speaker and
                founder of African Women Builds. After rebuilding my life and
                businesses in the UK, I now help African women build businesses
                that change not just their income, but their family&rsquo;s future.
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
                  About me →
                </Link>
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm pb-6 lg:pb-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-peach-deep">
                {settings.hero_portrait_url ? (
                  <Image
                    src={settings.hero_portrait_url}
                    alt="Lami the Migrant CEO"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink/50">
                    Founder portrait
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHORITY STRIP */}
      <AuthorityStrip />

      {/* 3. SHORT STORY */}
      <Section background="gold">
        <div className="grid items-center gap-14 lg:grid-cols-[2fr_3fr]">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-peach-deep">
            {settings.founder_portrait_url ? (
              <Image
                src={settings.founder_portrait_url}
                alt="Lami the Migrant CEO"
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/50">
                Founder portrait
              </div>
            )}
          </div>
          <div className="max-w-prose">
            <h2>{c("home.story.heading")}</h2>
            <p className="mt-6 text-ink/75">{c("home.story.paragraph1")}</p>
            <p className="mt-4 text-ink/75">{c("home.story.paragraph2")}</p>
            <div className="mt-6">
              <Link href="/about" className="text-clay underline underline-offset-4">
                Read the full story →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. CHOOSE YOUR PATH */}
      <Section background="clay">
        <h2>{c("home.paths.heading")}</h2>
        <p className="mt-3 max-w-prose text-shell/75">{c("home.paths.subtext")}</p>
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
            {siteContent["home.ecosystem.heading"]?.trim() ? (
              <h2>{siteContent["home.ecosystem.heading"]}</h2>
            ) : (
              <h2>One founder. <span className="text-clay">A whole ecosystem.</span></h2>
            )}
            <p className="mt-3 max-w-prose text-muted">{c("home.ecosystem.subtext")}</p>
          </div>
          <ButtonLink href="/ecosystem" variant="secondary" className="hidden sm:inline-flex">
            Explore the ecosystem
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {ECOSYSTEM.map((e) => (
            <div key={e.name} className="card border-t-4 border-t-clay p-6">
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
      <Section background="ink">
        <div className="flex items-end justify-between gap-4">
          <h2>{c("home.impact.heading")}</h2>
          <ButtonLink
            href="/impact"
            variant="secondary"
            className="hidden border-shell/40 text-shell hover:bg-shell hover:text-ink sm:inline-flex"
          >
            See the impact
          </ButtonLink>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 border-y border-shell/15 py-6">
          {[
            ["30", "units sold out"],
            ["£1,000+", "first-revenue milestone"],
            ["50", "products sold"],
          ].map(([figure, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-bold text-gold-soft md:text-3xl">
                {figure}
              </p>
              <p className="label mt-1 text-shell/70">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <TestimonialsSlider testimonials={testimonials} />
        </div>
      </Section>

      {/* 7. FEATURED STORY / VIDEO */}
      <Section background="gold">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="label text-ink/60">{c("home.video.kicker")}</p>
            <h2 className="mt-3">{c("home.video.heading")}</h2>
            <p className="mt-4 text-ink/75">{c("home.video.paragraph")}</p>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-card bg-ink/10">
            {/* TODO(lami): embed the 60–120s brand-story video (YouTube/Vimeo/Mux). */}
            <div className="flex h-full items-center justify-center text-ink/50">
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
            <p className="mt-2 text-muted">{c("home.speaking.paragraph")}</p>
            <ButtonLink href="/speaking" variant="secondary" className="mt-6">
              Book Lami to speak
            </ButtonLink>
          </div>
          <div className="card p-8">
            <h3>Partnerships</h3>
            <p className="mt-2 text-muted">{c("home.partnerships.paragraph")}</p>
            <ButtonLink href="/work-with-lami" variant="secondary" className="mt-6">
              Explore partnerships
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* 9. THE BUILD LETTER */}
      <Section background="clay">
        <div className="mx-auto max-w-prose text-center">
          <h2>{c("home.buildletter.heading")}</h2>
          <p className="mt-4 text-shell/75">{c("home.buildletter.subtext")}</p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm
              theme="dark"
              buttonClassName="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
            />
          </div>
        </div>
      </Section>

      {/* 10. FINAL CTA — ivory, so it doesn't repeat the footer's black right after it */}
      <Section background="shell">
        <div className="mx-auto max-w-prose text-center">
          <h2>{c("home.finalcta.heading")}</h2>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink
              href="/start-here"
              className="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
            >
              Start Here
            </ButtonLink>
            <ButtonLink href="/work-with-lami" variant="secondary">
              Work With Me
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
