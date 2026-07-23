"use client";

import { useState } from "react";
import { WholesaleCard } from "@/components/WholesaleCard";
import { clsx } from "@/lib/clsx";
import type { WholesaleProduct } from "@/lib/types";

type Filter = "all" | "Jewelry" | "Accessories" | "under100";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Jewelry", label: "Jewelry" },
  { key: "Accessories", label: "Accessories" },
  { key: "under100", label: "Under £100" },
];

export function WholesaleFilter({ bundles }: { bundles: WholesaleProduct[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const shown = bundles.filter((b) => {
    if (filter === "all") return true;
    if (filter === "under100") return b.price_gbp < 100;
    return b.category === filter;
  });

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

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {shown.map((b) => (
          <WholesaleCard key={b.id} b={b} />
        ))}
      </div>
    </>
  );
}
