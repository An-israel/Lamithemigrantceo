import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Section } from "@/components/Section";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getJournalPost, getJournalPosts } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getJournalPost(params.slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function JournalPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getJournalPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.published_at || post.created_at,
  };

  return (
    <Section background="shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-prose">
        <Link href="/journal" className="text-sm text-muted no-underline hover:text-clay">
          ← The Build Journal
        </Link>
        <span className="label mt-6 block text-clay">{post.category}</span>
        <h1 className="mt-2">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">
          By {post.author}
          {post.published_at &&
            ` · ${new Date(post.published_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`}
        </p>

        {post.cover_image && (
          <div className="mt-8 overflow-hidden rounded-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image} alt={post.title} className="w-full" />
          </div>
        )}

        <div className="mt-8 space-y-4 text-muted">
          {post.body.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-12 rounded-card border border-line bg-peach p-6">
          <p className="font-display text-xl">Get more like this.</p>
          <p className="mt-2 text-sm text-muted">
            Join The Build Letter for practical insights in your inbox.
          </p>
          <div className="mt-4">
            <NewsletterForm theme="light" cta="Join The Build Letter" />
          </div>
        </div>
      </div>
    </Section>
  );
}
