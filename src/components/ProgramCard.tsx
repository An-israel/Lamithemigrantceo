import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { formatGBP } from "@/lib/format";
import type { Program } from "@/lib/types";

function CoverPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-card bg-peach-deep">
      <span className="font-display text-2xl text-ink/70">{name.charAt(0)}</span>
    </div>
  );
}

export function ProgramCard({
  program,
  showBullets = false,
}: {
  program: Program;
  showBullets?: boolean;
}) {
  const soldOut = program.status === "sold_out";
  const formatLabel =
    program.format === "live_cohort" ? "Live cohort" : "Self-paced";

  return (
    <article className="card flex flex-col overflow-hidden">
      {program.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={program.cover_image}
          alt={`${program.name} cover`}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <CoverPlaceholder name={program.name} />
      )}

      <div className="flex flex-1 flex-col p-6">
        <span className="pill w-fit bg-peach text-ink">{formatLabel}</span>
        <h3 className="mt-3">{program.name}</h3>
        <p className="mt-2 text-muted">{program.short_description}</p>

        {showBullets && program.what_you_get.length > 0 && (
          <ul className="mt-4 space-y-2">
            {program.what_you_get.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-[15px]">
                <span className="text-clay" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            {program.compare_at_gbp && (
              <span className="mr-2 text-muted line-through">
                {formatGBP(program.compare_at_gbp)}
              </span>
            )}
            <span className="price">{formatGBP(program.price_gbp)}</span>
          </div>
        </div>

        <div className="mt-4">
          {soldOut ? (
            <span className="pill bg-jade text-shell">Next cohort soon</span>
          ) : (
            <ButtonLink
              href={`/programs/${program.slug}`}
              fullWidthMobile
              className="w-full"
            >
              See what is included
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}
