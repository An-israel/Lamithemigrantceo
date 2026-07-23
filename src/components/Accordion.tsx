"use client";

import { useState } from "react";

type Item = { title: string; body: string };

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-bold">{item.title}</span>
              <span className="text-clay" aria-hidden>
                {isOpen ? "–" : "+"}
              </span>
            </button>
            {isOpen && <p className="pb-4 text-muted">{item.body}</p>}
          </div>
        );
      })}
    </div>
  );
}
