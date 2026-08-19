import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Press biography, approved name and title, headshots, logos, speaking topics and previous appearances.",
};

const SHORT_BIO =
  "Lami the Migrant CEO is an entrepreneur, educator and speaker helping African women migrants build businesses and generational wealth. She rebuilt her business journey in the UK from less than £200 into a wholesale operation, education programmes and a growing community.";

const LONG_BIO =
  "Temitope Olamide Oni Mole, known publicly as Lami the Migrant CEO, is an entrepreneur, educator, speaker and community builder. After more than a decade building businesses in Nigeria, she moved to the United Kingdom in 2022 and rebuilt from the ground up, starting with less than £200. She has since built product businesses, a physical wholesale operation in Liverpool, business education programmes and communities, directly supporting over 500 people with total impact approaching 1,000. She is the founder of African Women Builds and GBG Wholesale Hub, and the founder and host of Build Her Empire Live.";

export default async function MediaPage() {
  const settings = await getSettings();
  const email = settings.public_email || "hello@lamithemigrantceo.com";

  return (
    <>
      <Section background="shell">
        <p className="label text-clay">Media</p>
        <h1 className="mt-3">Press &amp; media kit.</h1>
        <p className="mt-4 max-w-prose text-muted">
          Everything you need to feature Lami accurately. For interviews and
          commentary, use the media enquiry route below.
        </p>
      </Section>

      <Section background="peach" className="!pt-0">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card p-6">
            <h3>Approved name &amp; title</h3>
            <p className="mt-2 text-muted">
              <strong>Temitope Olamide Oni Mole</strong>, known publicly as{" "}
              <strong>Lami the Migrant CEO</strong> — entrepreneur, educator and
              speaker.
            </p>
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

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="card p-6">
            <h3>Short biography</h3>
            <p className="mt-2 text-muted">{SHORT_BIO}</p>
          </div>
          <div className="card p-6">
            <h3>Long biography</h3>
            <p className="mt-2 text-muted">{LONG_BIO}</p>
          </div>
        </div>
      </Section>

      <Section background="shell" className="!pt-0">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="card p-6">
            <h3>Headshots &amp; logos</h3>
            <p className="mt-2 text-sm text-muted">
              {/* TODO(lami): upload approved headshots + logos (zip) and link here. */}
              Approved headshots and logos are being finalised — for now, request
              them directly.
            </p>
            <ButtonLink href="/contact?type=media" variant="secondary" className="mt-4 text-sm">
              Request brand assets
            </ButtonLink>
          </div>
          <div className="card p-6">
            <h3>Speaking topics</h3>
            <p className="mt-2 text-sm text-muted">
              Migration and rebuilding, product business in the UK, community and
              collective buying, income to asset ownership.
            </p>
            <ButtonLink href="/speaking" variant="secondary" className="mt-4 text-sm">
              See all topics
            </ButtonLink>
          </div>
          <div className="card p-6">
            <h3>Previous appearances</h3>
            <p className="mt-2 text-sm text-muted">
              Enry Live and Direct, Birmingham (OREP Limited). Build Her Empire
              Live, Liverpool, 15 August 2026.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
