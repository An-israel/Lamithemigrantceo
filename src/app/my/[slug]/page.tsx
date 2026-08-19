import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";
import { getProgramBySlug } from "@/lib/data";
import type { ProgramModule } from "@/lib/types";

/** youtu.be/vimeo/youtube links → an embeddable player URL. Anything else
 *  (Loom, Drive, etc.) is left as a plain link instead of an iframe. */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

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

  // Real modules once the admin has added them; otherwise fall back to a
  // placeholder built from "What you get" so the page is never empty.
  let realModules: ProgramModule[] = [];
  try {
    const { data } = await supabase
      .from("program_modules")
      .select("*")
      .eq("program_id", program.id)
      .order("sort_order", { ascending: true });
    realModules = (data as ProgramModule[]) || [];
  } catch {
    realModules = [];
  }

  const modules =
    realModules.length > 0
      ? realModules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.body || "Materials for this module will appear here.",
          video_url: m.video_url,
          file_url: m.file_url,
        }))
      : program.what_you_get.map((title, i) => ({
          id: String(i),
          title,
          description: "Materials for this module will appear here.",
          video_url: null as string | null,
          file_url: null as string | null,
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
          {modules.map((m) => {
            const embed = m.video_url ? toEmbedUrl(m.video_url) : null;
            return (
              <article key={m.id} id={`module-${m.id}`}>
                <h3>{m.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-muted">{m.description}</p>
                {embed && (
                  <div className="mt-4 aspect-video w-full overflow-hidden rounded-card">
                    <iframe
                      src={embed}
                      title={m.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {!embed && m.video_url && (
                  <a
                    href={m.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-bold text-clay"
                  >
                    Watch the video →
                  </a>
                )}
                {m.file_url && (
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block font-bold text-clay"
                  >
                    Download the materials →
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
