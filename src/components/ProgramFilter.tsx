"use client";

import { useState } from "react";
import { ProgramCard } from "@/components/ProgramCard";
import { clsx } from "@/lib/clsx";
import type { Program } from "@/lib/types";

type Filter = "all" | "live_cohort" | "self_paced";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live_cohort", label: "Live cohort" },
  { key: "self_paced", label: "Self-paced" },
];

export function ProgramFilter({ programs }: { programs: Program[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const shown =
    filter === "all"
      ? programs
      : programs.filter((p) => p.format === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              "pill border",
              filter === f.key
                ? "bg-clay text-shell border-clay"
                : "bg-transparent text-ink border-line hover:border-clay"
            )}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {shown.map((p) => (
          <ProgramCard key={p.id} program={p} showBullets />
        ))}
      </div>
    </>
  );
}
