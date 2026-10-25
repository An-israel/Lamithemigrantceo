import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { findByToken } from "@/lib/subscribers";

export const metadata: Metadata = {
  title: "Email preferences",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section background="shell">
      <div className="mx-auto max-w-md rounded-card border border-line bg-peach p-8 text-center">
        <p className="label text-clay">The Build Letter</p>
        <h1 className="mt-3 text-3xl md:text-4xl">{title}</h1>
        <div className="mt-4 space-y-4 text-muted">{children}</div>
      </div>
    </Section>
  );
}

function ActionForm({ token, action, label, primary }: { token: string; action: string; label: string; primary?: boolean }) {
  return (
    <form method="post" action="/api/unsubscribe" className="flex justify-center">
      <input type="hidden" name="t" value={token} />
      <input type="hidden" name="from" value="page" />
      <input type="hidden" name="action" value={action} />
      <button type="submit" className={primary ? "btn btn-primary" : "btn btn-secondary text-sm"}>
        {label}
      </button>
    </form>
  );
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { t?: string; done?: string; test?: string };
}) {
  if (searchParams.test) {
    return (
      <Card title="This was a test email">
        <p>Unsubscribe links in test emails don&rsquo;t change anything. In a real send, each person gets their own link.</p>
      </Card>
    );
  }

  const token = (searchParams.t || "").trim();
  let subscriber: Awaited<ReturnType<typeof findByToken>> = null;
  let lookupFailed = false;
  try {
    subscriber = token ? await findByToken(token) : null;
  } catch {
    lookupFailed = true;
  }

  if (lookupFailed || searchParams.done === "error") {
    return (
      <Card title="Something went wrong">
        <p>We couldn&rsquo;t update your preferences just now. Please try the link again in a few minutes.</p>
        {token && <ActionForm token={token} action="unsubscribe" label="Try again" primary />}
      </Card>
    );
  }

  if (!subscriber) {
    return (
      <Card title="This link isn&rsquo;t valid">
        <p>
          It may have been copied incompletely. If you&rsquo;re getting emails you don&rsquo;t want, reply to any
          of them and you&rsquo;ll be removed.
        </p>
        <p>
          <Link href="/" className="underline">Go to the homepage</Link>
        </p>
      </Card>
    );
  }

  if (subscriber.status === "unsubscribed") {
    return (
      <Card title="You&rsquo;re unsubscribed">
        <p>
          <strong className="text-ink">{subscriber.email}</strong> won&rsquo;t get The Build Letter any more.
        </p>
        <p className="text-sm">Changed your mind?</p>
        <ActionForm token={token} action="resubscribe" label="Subscribe again" />
      </Card>
    );
  }

  if (searchParams.done === "resubscribed") {
    return (
      <Card title="You&rsquo;re back on the list">
        <p>
          <strong className="text-ink">{subscriber.email}</strong> will get The Build Letter again.
        </p>
        <p>
          <Link href="/" className="underline">Go to the homepage</Link>
        </p>
      </Card>
    );
  }

  return (
    <Card title="Unsubscribe from The Build Letter?">
      <p>
        <strong className="text-ink">{subscriber.email}</strong> will stop getting Lami&rsquo;s newsletter. Order
        confirmations and replies to your messages still arrive as normal.
      </p>
      <ActionForm token={token} action="unsubscribe" label="Unsubscribe" primary />
    </Card>
  );
}
