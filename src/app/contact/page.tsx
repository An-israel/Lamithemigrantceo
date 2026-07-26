import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ContactForm } from "@/components/ContactForm";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speaking, media, partnerships, consulting or general enquiries — reach Lami the right way.",
};

const TYPE_LABELS: Record<string, string> = {
  speaking: "Speaking",
  media: "Media",
  partnerships: "Partnerships",
  consulting: "Consulting",
  general: "General",
};

function ContactRow({
  href,
  label,
  detail,
  external,
}: {
  href: string;
  label: string;
  detail: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex h-16 items-center justify-between no-underline"
    >
      <span>
        <span className="block font-bold text-ink">{label}</span>
        <span className="block text-sm text-muted">{detail}</span>
      </span>
      <span className="text-clay" aria-hidden>
        ›
      </span>
    </a>
  );
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const settings = await getSettings();
  const waDigits = (settings.whatsapp_number || "").replace(/[^0-9]/g, "");
  const initialType =
    searchParams.type && TYPE_LABELS[searchParams.type]
      ? TYPE_LABELS[searchParams.type]
      : undefined;

  return (
    <Section background="shell">
      <p className="label text-clay">Contact</p>
      <h1 className="mt-3">Let&rsquo;s talk.</h1>
      <p className="mt-4 max-w-prose text-muted">
        Choose the right route below and I&rsquo;ll make sure your message
        reaches the right place. I aim to reply within one working day.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm initialType={initialType} />

        <div className="rounded-card border border-line bg-peach p-6">
          <p className="label">Or reach me directly</p>
          <div className="mt-2 divide-y divide-line">
            <ContactRow
              href={`https://wa.me/${waDigits}`}
              label="WhatsApp"
              detail={settings.whatsapp_number || "Message me"}
              external
            />
            <ContactRow
              href={`mailto:${settings.public_email}`}
              label="Email"
              detail={settings.public_email || "hello@lamithemigrantceo.com"}
            />
            {settings.calendly_url && (
              <ContactRow
                href={settings.calendly_url}
                label="Book a call"
                detail="Schedule a time"
                external
              />
            )}
          </div>
          <p className="mt-6 text-sm text-muted">
            For press and speaking, use the form and pick the matching enquiry
            type so it routes correctly.
          </p>
        </div>
      </div>
    </Section>
  );
}
