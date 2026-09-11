"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

type Item = { title: string; body: string };

export function Accordion({
  items,
  theme = "light",
}: {
  items: Item[];
  /** "light" for shell/peach/gold sections, "dark" for clay/ink sections. */
  theme?: "light" | "dark";
}) {
  const [open, setOpen] = useState<number | null>(0);
  const dark = theme === "dark";

  return (
    <div
      className={clsx(
        "divide-y border-y",
        dark ? "divide-shell/20 border-shell/20" : "divide-line border-line"
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className={clsx("font-bold", dark ? "text-shell" : "text-ink")}>
                {item.title}
              </span>
              <span className={dark ? "text-gold-soft" : "text-gold"} aria-hidden>
                {isOpen ? "–" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className={clsx("pb-4", dark ? "text-shell/70" : "text-ink/70")}>
                {item.body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
