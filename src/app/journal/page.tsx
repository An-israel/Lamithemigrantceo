import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/Section";
import { getJournalPosts } from "@/lib/content";
import { getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";

export const metadata: Metadata = {
  title: "The Build Journal",
  description:
    "Articles on business, migration, wealth and legacy, plus behind-the-scenes thought leadership.",
};

export default async function JournalPage() {
  const [posts, siteContent] = await Promise.all([getJournalPosts(), getSiteContent()]);
  const c = (key: string) => content(siteContent, key);

  return (
    <Section background="shell">
      <p className="label text-clay">The Build Journal</p>
      <h1 className="mt-3">{c("journal.heading")}</h1>
      <p className="mt-4 max-w-prose text-muted">{c("journal.subtext")}</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/journal/${p.slug}`}
            className="group overflow-hidden rounded-card border border-clay bg-clay no-underline transition-colors hover:border-gold hover:bg-gold"
          >
            <div className="relative flex aspect-[16/9] items-center justify-center bg-peach-deep">
              {p.cover_image ? (
                <Image
                  src={p.cover_image}
                  alt={p.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <span className="font-display text-2xl text-ink/40">{p.category}</span>
              )}
            </div>
            <div className="p-6">
              <span className="label text-gold-soft group-hover:text-clay">{p.category}</span>
              <h3 className="mt-2 text-shell group-hover:text-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-shell/70 group-hover:text-ink/70">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
