import type { Testimonial } from "@/lib/types";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="card flex min-w-[280px] flex-col p-6 sm:min-w-0">
      <div className="flex items-center gap-3">
        {t.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.photo}
            alt={t.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-peach-deep font-display text-ink/70">
            {t.name.charAt(0)}
          </div>
        )}
        <figcaption className="font-bold">{t.name}</figcaption>
      </div>
      <blockquote className="mt-4 flex-1 text-[15px]">
        “{t.quote}”
      </blockquote>
      {t.result_figure && (
        <p className="mt-4 font-bold text-jade">{t.result_figure}</p>
      )}
    </figure>
  );
}
