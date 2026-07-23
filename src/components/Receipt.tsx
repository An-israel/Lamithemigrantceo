"use client";

import { useEffect, useRef, useState } from "react";
import type { ReceiptItem } from "@/lib/types";

/**
 * The hero's signature element: her actual first-order receipt, styled as
 * paper with a torn zigzag bottom edge (CSS clip-path, no image). On scroll
 * into view the line items count up over ~900ms total. Disabled under
 * prefers-reduced-motion.
 *
 * Line items, resold total and the caption are editable from /admin/settings.
 * TODO(lami): CONFIRM these figures are true before launch.
 */

const DEFAULT_ITEMS: ReceiptItem[] = [
  { label: "Mixed jewelry bundle", value: 85 },
  { label: "Packaging and labels", value: 22 },
  { label: "Postage float", value: 18 },
  { label: "Sample stock", value: 45 },
  { label: "Business cards", value: 30 },
];

function gbp(n: number) {
  return `£${n.toFixed(2)}`;
}

export function Receipt({
  items = DEFAULT_ITEMS,
  resold = 640,
  note = "Her actual first order, 2021.",
}: {
  items?: ReceiptItem[];
  resold?: number;
  note?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);
  const [showTotals, setShowTotals] = useState(false);

  const lines = items.length > 0 ? items : DEFAULT_ITEMS;
  const total = lines.reduce((n, l) => n + Number(l.value), 0);
  const margin = resold - total;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setRevealed(lines.length);
      setShowTotals(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          const step = 900 / (lines.length + 1);
          lines.forEach((_, i) => {
            setTimeout(() => setRevealed(i + 1), step * i);
          });
          setTimeout(() => setShowTotals(true), step * lines.length);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lines.length]);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-sm bg-shell text-ink"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% 96%, 96% 100%, 92% 96%, 88% 100%, 84% 96%, 80% 100%, 76% 96%, 72% 100%, 68% 96%, 64% 100%, 60% 96%, 56% 100%, 52% 96%, 48% 100%, 44% 96%, 40% 100%, 36% 96%, 32% 100%, 28% 96%, 24% 100%, 20% 96%, 16% 100%, 12% 96%, 8% 100%, 4% 96%, 0 100%)",
        boxShadow: "0 10px 30px -12px rgba(42, 27, 20, 0.35)",
      }}
    >
      <div className="border border-line px-6 pb-10 pt-6">
        <p className="label text-center">Starting stock · Receipt</p>
        <div className="my-4 border-t border-dashed border-line" />

        <ul
          className="space-y-2 font-sans text-[15px]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {lines.map((line, i) => (
            <li
              key={`${line.label}-${i}`}
              className="flex items-baseline justify-between transition-opacity duration-200"
              style={{ opacity: i < revealed ? 1 : 0 }}
            >
              <span>{line.label}</span>
              <span className="tabular-nums">{gbp(Number(line.value))}</span>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-dashed border-line" />

        <div
          className="space-y-2 font-sans transition-opacity duration-300"
          style={{ opacity: showTotals ? 1 : 0, fontVariantNumeric: "tabular-nums" }}
        >
          <div className="flex items-baseline justify-between font-bold">
            <span>TOTAL</span>
            <span>{gbp(total)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span>RESOLD FOR</span>
            <span>{gbp(resold)}</span>
          </div>
          <div className="flex items-baseline justify-between font-bold text-jade">
            <span>MARGIN</span>
            <span>{gbp(margin)}</span>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute -bottom-7 left-0 right-0 text-center text-[13px] text-muted">
        {note}
      </p>
    </div>
  );
}
