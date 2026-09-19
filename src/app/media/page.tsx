import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getSettings, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Press biography, approved name and title, headshots, logos, speaking topics and previous appearances.",
};

export default async function MediaPage() {
  const [settings, siteContent] = await Promise.all([getSettings(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);
  const email = settings.public_email || "hello@lamithemigrantceo.com";

  return (
    <>
      <Section background="shell">
        <p className="label text-clay">Media</p>
        <h1 className="mt-3">Press &amp; media kit.</h1>
        <p className="mt-4 max-w-prose text-muted">{c("media.subtext")}</p>
      </Section>

      <Section background="gold" className="!pt-0">
        <div className="grid gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:items-stretch">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-peach-deep">
            {settings.media_headshot_url ? (
              <Image
                src={settings.media_headshot_url}
                alt="Lami the Migrant CEO, approved press headshot"
                fill
                sizes="(min-width: 768px) 340px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/50">
                Press headshot
              </div>
            )}
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div className="card p-6">
              <h3>Approved name &amp; title</h3>
              <p className="mt-2 text-muted">{c("media.nametitle")}</p>
            </div>
            <div className="card p-6">
              <h3>Press contact</h3>
              <p className="mt-2 text-muted">
                <a href={`mailto:${email}`}>{email}</a>
              </p>
              <ButtonLink href="/contact?type=media" variant="secondary" className="mt-4 text-sm">
                Media enquiry
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="card p-6">
            <h3>Short biography</h3>
            <p className="mt-2 text-muted">{c("media.shortbio")}</p>
          </div>
          <div className="card p-6">
            <h3>Long biography</h3>
            <p className="mt-2 text-muted">{c("media.longbio")}</p>
          </div>
        </div>
      </Section>

      <Section background="shell" className="!pt-0">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="card p-6">
            <h3>Headshots &amp; logos</h3>
            <p className="mt-2 text-sm text-muted">
              {settings.media_headshot_url
                ? c("media.assets.withheadshot")
                : c("media.assets.noheadshot")}
            </p>
            <ButtonLink href="/contact?type=media" variant="secondary" className="mt-4 text-sm">
              Request brand assets
            </ButtonLink>
          </div>
          <div className="card p-6">
            <h3>Speaking topics</h3>
            <p className="mt-2 text-sm text-muted">{c("media.speakingtopics")}</p>
            <ButtonLink href="/speaking" variant="secondary" className="mt-4 text-sm">
              See all topics
            </ButtonLink>
          </div>
          <div className="card p-6">
            <h3>Previous appearances</h3>
            <p className="mt-2 text-sm text-muted">{c("media.appearances")}</p>
          </div>
        </div>
      </Section>
    </>
  );
}
