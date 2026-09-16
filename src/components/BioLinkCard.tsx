"use client";

import { createClient } from "@/lib/supabase/client";
import { formatGBP } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { BioLink } from "@/lib/types";

/**
 * A single card on the /start link-in-bio page. Renders differently by
 * `link.style`:
 *  - "product": price/compare-price/duration read LIVE from the joined
 *    product (never a stale copy), links straight to its product page.
 *  - "resource": same card shape, always "Free", links to /resources.
 *  - "banner": a distinct promo unit, no price/button.
 *  - "simple": a plain quick-link pill (WhatsApp, social, etc).
 *
 * Product/resource images are rendered at their own natural aspect ratio
 * (width 100%, height auto) — never object-fit cropped or forced into a
 * square, per the brand's link-in-bio spec.
 */
export function BioLinkCard({ link }: { link: BioLink }) {
  const external = /^https?:\/\//.test(link.url);

  async function track() {
    try {
      const supabase = createClient();
      await supabase.rpc("increment_bio_click", { link_id: link.id });
    } catch {
      /* best-effort */
    }
  }

  const linkProps = {
    onClick: track,
    target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined,
  } as const;

  if (link.style === "product" && link.product) {
    const p = link.product;
    const pctOff =
      p.compare_at_gbp && p.compare_at_gbp > p.price_gbp
        ? Math.round(100 - (p.price_gbp / p.compare_at_gbp) * 100)
        : null;
    const soldOut = p.status === "sold_out";
    return (
      <a
        href={`/products/${p.slug}`}
        {...linkProps}
        className="flex gap-3.5 rounded-2xl border border-shell/10 bg-shell/[0.035] p-3.5 no-underline transition-colors hover:border-gold-soft/40"
      >
        <ProductImage src={p.cover_image} alt={p.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div>
            <div className="font-display text-base font-semibold leading-tight text-shell">
              {p.name}
            </div>
            <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-shell/60">
              {link.description || p.short_description}
            </div>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-gold-soft">
              {formatGBP(p.price_gbp)}
            </span>
            {p.compare_at_gbp && (
              <span className="text-xs text-shell/40 line-through">
                {formatGBP(p.compare_at_gbp)}
              </span>
            )}
            {pctOff !== null && (
              <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold-soft">
                {pctOff}% off
              </span>
            )}
            {p.duration && (
              <span className="rounded-full bg-shell/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-shell/65">
                {p.duration}
              </span>
            )}
          </div>
          <span className="mt-1 flex h-9 w-full items-center justify-center rounded-full bg-clay text-[13px] font-bold text-shell">
            {link.button_label || (soldOut ? "Notify me" : "Buy now")}
          </span>
        </div>
      </a>
    );
  }

  if (link.style === "resource" && link.resource) {
    const r = link.resource;
    return (
      <a
        href={`/resources#${r.id}`}
        {...linkProps}
        className="flex gap-3.5 rounded-2xl border border-shell/10 bg-shell/[0.035] p-3.5 no-underline transition-colors hover:border-gold-soft/40"
      >
        <ProductImage src={r.image_url} alt={r.title} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div>
            <div className="font-display text-base font-semibold leading-tight text-shell">
              {r.title}
            </div>
            <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-shell/60">
              {link.description || r.description}
            </div>
          </div>
          <span className="mt-auto text-base font-bold text-shell/55">Free</span>
          <span className="mt-1 flex h-9 w-full items-center justify-center rounded-full border-[1.5px] border-gold-soft text-[13px] font-bold text-gold-soft">
            {link.button_label || "Get for free"}
          </span>
        </div>
      </a>
    );
  }

  if (link.style === "banner") {
    return (
      <a
        href={link.url}
        {...linkProps}
        className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-br from-peach-deep to-gold-bg p-4 no-underline"
      >
        {link.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.image_url}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink">
            <span className="font-display text-sm font-bold text-gold-soft">
              {link.label.charAt(0)}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-display text-[14.5px] font-semibold leading-tight text-ink">
            {link.label}
          </div>
          {link.description && (
            <div className="mt-0.5 text-[11.5px] leading-snug text-ink/65">
              {link.description}
            </div>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#17140e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      </a>
    );
  }

  // "simple" — a plain quick-link pill.
  return (
    <a
      href={link.url}
      {...linkProps}
      className="flex items-center gap-3.5 rounded-2xl border border-gold-soft/30 bg-shell/[0.04] px-4 py-3.5 no-underline transition-colors hover:border-gold-soft/60"
    >
      {link.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={link.image_url}
          alt=""
          className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-clay">
          <span className="text-sm font-bold text-shell">{link.label.charAt(0)}</span>
        </div>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-shell">{link.label}</span>
        {link.description && (
          <span className="mt-0.5 block text-[12.5px] text-shell/55">
            {link.description}
          </span>
        )}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#cba85c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </a>
  );
}

/**
 * Fixed-width, auto-height image slot — the image renders at its own aspect
 * ratio (never object-fit cropped, never forced into a square).
 */
function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div
      className={clsx(
        "w-[104px] shrink-0 self-start overflow-hidden rounded-xl",
        !src && "flex aspect-[4/3] items-center justify-center bg-shell/10"
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="block w-full h-auto" />
      ) : (
        <span className="font-display text-lg text-shell/30">{alt.charAt(0)}</span>
      )}
    </div>
  );
}
