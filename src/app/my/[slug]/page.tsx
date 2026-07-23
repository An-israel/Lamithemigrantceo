import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";
import { getProgramBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "Program",
  robots: { index: false },
};

export default async function MyProgramPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const program = await getProgramBySlug(params.slug);

  // Does this user have a paid order for this program?
  let hasAccess = false;
  if (program && user?.email) {
    try {
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("email", user.email)
        .eq("item_id", program.id)
        .eq("status", "paid")
        .limit(1);
      hasAccess = !!data && data.length > 0;
    } catch {
      hasAccess = false;
    }
  }

  if (!program) {
    return (
      <Section background="shell">
        <h1>Program not found.</h1>
        <div className="mt-6">
          <ButtonLink href="/my">Back to my programs</ButtonLink>
        </div>
      </Section>
    );
  }

  if (!hasAccess) {
    return (
      <Section background="shell">
        <div className="rounded-card border border-line bg-peach p-8">
          <p className="font-display text-2xl">
            You do not have access to this program yet.
          </p>
          <p className="mt-2 text-muted">
            Join {program.name} to unlock the modules and materials.
          </p>
          <div className="mt-6">
            <ButtonLink href={`/programs/${program.slug}`}>
              See {program.name}
            </ButtonLink>
          </div>
        </div>
      </Section>
    );
  }

  // Access granted — render the module list. Modules use `what_you_get` as
  // placeholder content until a program_modules table is populated.
  const modules = program.what_you_get.map((title, i) => ({
    id: i,
    title,
    description: "Materials for this module will appear here.",
  }));

  return (
    <Section background="shell">
      <Link href="/my" className="text-sm text-muted no-underline hover:text-clay">
        ← My programs
      </Link>
      <h1 className="mt-4">{program.name}</h1>

      {/* Progress bar */}
      <div className="mt-6 h-2 w-full overflow-hidden rounded-pill bg-line">
        <div className="h-full w-0 bg-clay" aria-hidden />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_2fr]">
        <nav className="space-y-1" aria-label="Modules">
          {modules.map((m) => (
            <a
              key={m.id}
              href={`#module-${m.id}`}
              className="block rounded-input px-3 py-2 text-sm no-underline text-ink hover:bg-peach"
            >
              {m.title}
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          {modules.map((m) => (
            <article key={m.id} id={`module-${m.id}`}>
              <h3>{m.title}</h3>
              <p className="mt-2 text-muted">{m.description}</p>
              {/* TODO: video embed (Bunny/Mux playback id) + downloadable
                  files from Supabase storage, per the brief. */}
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
