"use client";

import { useCart } from "@/components/cart/CartProvider";
import { clsx } from "@/lib/clsx";

export function AddToOrderButton({
  product,
  className,
  label = "Add to order",
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price_gbp: number;
    image: string | null;
    stock: number;
  };
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  return (
    <button
      className={clsx("btn btn-primary", className)}
      onClick={() => add(product)}
    >
      {label}
    </button>
  );
}
