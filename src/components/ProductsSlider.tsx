"use client";

import { Slider } from "@/components/Slider";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

/** Products on a light section, sliding instead of a static grid. */
export function ProductsSlider({ products }: { products: Product[] }) {
  return (
    <Slider
      items={products}
      ariaLabel="Products"
      arrowTheme="dark"
      itemClassName="w-[85%] sm:w-[55%] lg:w-[31%]"
      keyFor={(p) => p.id}
      renderItem={(p) => <ProductCard product={p} showBullets />}
    />
  );
}
