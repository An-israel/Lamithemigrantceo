import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getSettings, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";
import type { GalleryTileSize } from "@/lib/types";

// Photos-per-row the admin picked, capped by however many photos actually
// exist so a handful of uploads never gets stretched into empty columns.
const GALLERY_SIZE_COLS: Record<GalleryTileSize, number> = {
  large: 2,
  medium: 3,
  small: 4,
};
const GALLERY_GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export const metadata: Metadata = {
  title: "The Story Behind The Migrant CEO",
  description:
    "Temitope Olamide Oni Mole, known publicly as Lami the Migrant CEO, is an entrepreneur, educator, speaker and community builder.",
};

// §6.2 timeline — copy lives in contentRegistry.ts (about.timeline.N.*)
const TIMELINE_INDEXES = [0, 1, 2, 3, 4, 5, 6];

export default async function AboutPage() {
  const [settings, siteContent] = await Promise.all([getSettings(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);

  return (
    <>
      <Section background="clay" className="!pb-10 md:!pb-16">
        <p className="label text-gold-soft">About Lami</p>
        <h1 className="mt-3">{c("about.hero.heading")}</h1>
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-card bg-peach-deep">
          {settings.founder_portrait_url ? (
            <Image
              src={settings.founder_portrait_url}
              alt="Lami the Migrant CEO"
              fill
              sizes="(min-width: 1024px) 1140px, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink/50">
              Founder portrait
            </div>
          )}
        </div>
      </Section>

      <Section background="shell">
        <div className="mx-auto max-w-prose">
          <p className="text-lg">{c("about.bio.lead")}</p>

          <p className="mt-6 text-muted">{c("about.bio.p1")}</p>

          <PullQuote>{c("about.quote.0")}</PullQuote>

          <p className="text-muted">{c("about.bio.p2")}</p>

          <p className="mt-4 text-muted">{c("about.bio.p3")}</p>

          <PullQuote>{c("about.quote.1")}</PullQuote>

          <p className="text-muted">{c("about.bio.p4")}</p>

          <PullQuote>{c("about.quote.2")}</PullQuote>
        </div>

        {settings.founder_gallery_urls.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <div
              className={`grid gap-4 sm:gap-6 ${
                GALLERY_GRID_CLASS[
                  Math.min(
                    GALLERY_SIZE_COLS[settings.founder_gallery_size],
                    settings.founder_gallery_urls.length
                  )
                ]
              }`}
            >
              {settings.founder_gallery_urls.map((img, i) => (
                <div key={i} className="relative aspect-square w-full">
                  <Image
                    src={img}
                    alt={`Lami the Migrant CEO ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="rounded-card object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mx-auto mt-16 max-w-prose border-l border-line pl-6">
          {TIMELINE_INDEXES.map((i) => (
            <div key={i} className="relative pb-8 last:pb-0">
              <span className="label text-clay">
                {String(i + 1).padStart(2, "0")} · {c(`about.timeline.${i}.year`)}
              </span>
              <p className="mt-1 font-medium">{c(`about.timeline.${i}.text`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats band — §4 verified facts, brief wording */}
      <Section background="ink">
        <div className="grid gap-10 text-center md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <p className="font-display text-5xl font-bold text-gold-soft">{c(`about.stats.${i}.figure`)}</p>
              <p className="label mt-2 text-shell/70">{c(`about.stats.${i}.label`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-shell/50">{c("about.stats.caption")}</p>
      </Section>

      <Section background="clay">
        <div className="mx-auto max-w-prose text-center">
          <h2>{c("about.finalcta.heading")}</h2>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink
              href="/start-here"
              className="border-gold bg-gold text-ink hover:bg-gold-soft hover:border-gold-soft"
            >
              Start Here
            </ButtonLink>
            <ButtonLink
              href="/work-with-lami"
              variant="secondary"
              className="border-shell text-shell hover:bg-shell hover:text-ink"
            >
              Work With Me
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-10 font-display text-2xl font-medium leading-snug text-clay md:text-[32px]">
      {children}
    </p>
  );
}
