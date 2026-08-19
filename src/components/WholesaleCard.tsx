import Link from "next/link";
import { formatGBP } from "@/lib/format";
import { AddToOrderButton } from "@/components/cart/AddToOrderButton";
import { RestockAlert } from "@/components/RestockAlert";
import type { WholesaleProduct } from "@/lib/types";

export function WholesaleCard({ b }: { b: WholesaleProduct }) {
  const soldOut = b.stock <= 0;
  const margin =
    b.typical_resale_gbp != null ? b.typical_resale_gbp - b.price_gbp : null;
  const cover = b.images[0] ?? null;

  return (
    <article className={`card overflow-hidden ${soldOut ? "opacity-80" : ""}`}>
      <Link href={`/wholesale/${b.slug}`} className="block no-underline">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-peach-deep">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={b.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-ink/50">
              {b.name.charAt(0)}
            </span>
          )}
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/wholesale/${b.slug}`} className="no-underline">
          <h3 className="text-ink">{b.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted">{b.whats_inside}</p>
        <span className="pill mt-3 bg-peach text-ink">{b.unit_count} pieces</span>

        <div className="mt-4">
          <span className="price">{formatGBP(b.price_gbp)}</span>
          {b.typical_resale_gbp != null && (
            <p className="mt-1 text-[13px] text-muted">
              Typical resale {formatGBP(b.typical_resale_gbp)}
              {margin != null && (
                <span className="font-bold text-jade"> · +{formatGBP(margin)}</span>
              )}
            </p>
          )}
        </div>

        <div className="mt-5">
          {soldOut ? (
            <div>
              <span className="pill bg-line text-muted">Sold out</span>
              <div className="mt-3">
                <RestockAlert productId={b.id} />
              </div>
            </div>
          ) : (
            <AddToOrderButton
              product={{
                id: b.id,
                slug: b.slug,
                name: b.name,
                price_gbp: b.price_gbp,
                image: cover,
                stock: b.stock,
              }}
              className="w-full"
            />
          )}
        </div>
      </div>
    </article>
  );
}
