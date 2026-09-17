"use client";

import Image from "next/image";
import { Slider } from "@/components/Slider";
import type { Testimonial } from "@/lib/types";

/** Testimonials on a dark (ink) section, sliding instead of a static grid. */
export function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Slider
      items={testimonials}
      ariaLabel="Testimonials"
      arrowTheme="light"
      itemClassName="w-[85%] sm:w-[60%] lg:w-[31%]"
      keyFor={(t) => t.id}
      renderItem={(t) => (
        <figure className="flex h-full min-h-[220px] flex-col justify-between rounded-card border border-shell/15 bg-shell/[0.06] p-7">
          <div className="flex items-center gap-3">
            {t.photo ? (
              <Image
                src={t.photo}
                alt={t.name}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-shell/10 font-display text-shell/70">
                {t.name.charAt(0)}
              </div>
            )}
            <figcaption className="text-sm font-bold text-shell">{t.name}</figcaption>
          </div>
          <blockquote className="mt-4 flex-1 text-[15px] text-shell/85">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          {t.result_figure && (
            <p className="mt-4 text-sm font-bold text-gold-soft">{t.result_figure}</p>
          )}
        </figure>
      )}
    />
  );
}
