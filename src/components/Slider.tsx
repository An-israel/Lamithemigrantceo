"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Generic horizontal slider: native scroll-snap (so touch drag/swipe just
 * works) plus arrow buttons and dots that scroll to a specific item. Active
 * dot tracks whichever item is nearest the viewport center as you scroll.
 */
export function Slider<T>({
  items,
  itemClassName,
  renderItem,
  ariaLabel,
  arrowTheme = "dark",
  gapClassName = "gap-5",
  keyFor,
}: {
  items: T[];
  itemClassName: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  ariaLabel: string;
  arrowTheme?: "dark" | "light";
  gapClassName?: string;
  keyFor?: (item: T, index: number) => string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const track = trackRef.current;
        if (!track) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActive(closest);
      });
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToIndex(i: number) {
    const el = itemRefs.current[i];
    const track = trackRef.current;
    if (!el || !track) return;
    const target = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }

  const light = arrowTheme === "light";

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        className={clsx(
          "flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          gapClassName
        )}
      >
        {items.map((item, i) => (
          <div
            key={keyFor ? keyFor(item, i) : i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={clsx("shrink-0 snap-start", itemClassName)}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
              light ? "border-shell/30 hover:bg-shell/10" : "border-line hover:bg-peach"
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke={light ? "var(--shell)" : "var(--ink)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={clsx(
                  "h-2 rounded-full transition-all",
                  i === active
                    ? light
                      ? "w-6 bg-gold-soft"
                      : "w-6 bg-clay"
                    : light
                      ? "w-2 bg-shell/30"
                      : "w-2 bg-line"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollToIndex(Math.min(items.length - 1, active + 1))}
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
              light ? "border-shell/30 hover:bg-shell/10" : "border-line hover:bg-peach"
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                stroke={light ? "var(--shell)" : "var(--ink)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
