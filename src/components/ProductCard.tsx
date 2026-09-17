import Image from "next/image";
import { ButtonLink } from "@/components/Button";
import { ProductWaitlist } from "@/components/ProductWaitlist";
import { formatGBP } from "@/lib/format";
import type { Product } from "@/lib/types";

function CoverPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-card bg-peach-deep">
      <span className="font-display text-2xl text-ink/70">{name.charAt(0)}</span>
    </div>
  );
}

export function ProductCard({
  product,
  showBullets = false,
}: {
  product: Product;
  showBullets?: boolean;
}) {
  const soldOut = product.status === "sold_out";
  const formatLabel =
    product.format === "live_cohort" ? "Live cohort" : "Self-paced";

  return (
    <article className="card flex flex-col overflow-hidden">
      {product.cover_image ? (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={product.cover_image}
            alt={`${product.name} cover`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <CoverPlaceholder name={product.name} />
      )}

      <div className="flex flex-1 flex-col p-6">
        <span className="pill w-fit bg-peach text-ink">{formatLabel}</span>
        <h3 className="mt-3">{product.name}</h3>
        <p className="mt-2 text-muted">{product.short_description}</p>

        {showBullets && product.what_you_get.length > 0 && (
          <ul className="mt-4 space-y-2">
            {product.what_you_get.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-[15px]">
                <span className="text-clay" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            {product.compare_at_gbp && (
              <span className="mr-2 text-muted line-through">
                {formatGBP(product.compare_at_gbp)}
              </span>
            )}
            <span className="price">{formatGBP(product.price_gbp)}</span>
          </div>
        </div>

        <div className="mt-4">
          {soldOut ? (
            <div className="space-y-2">
              <span className="pill bg-jade text-shell">Next cohort soon</span>
              <ProductWaitlist productId={product.id} productName={product.name} />
            </div>
          ) : (
            <ButtonLink
              href={`/products/${product.slug}`}
              fullWidthMobile
              className="w-full"
            >
              See what is included
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}
