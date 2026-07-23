import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ContactForm } from "@/components/ContactForm";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Lami. Tell her where you are and she'll tell you the next step.",
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

export default async function ContactPage() {
  const settings = await getSettings();
  const waDigits = (settings.whatsapp_number || "").replace(/[^0-9]/g, "");

  return (
    <Section background="shell">
      <h1>Talk to Lami.</h1>
      <p className="mt-4 max-w-prose text-muted">
        Tell me where you are and I will tell you the next step.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm />

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
            <ContactRow
              href={settings.calendly_url || "#"}
              label="Book a call"
              detail="15 minutes, free"
              external
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
