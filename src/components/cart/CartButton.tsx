"use client";

import { useCart } from "@/components/cart/CartProvider";

/** Small cart trigger for the header. Shows the item count when non-empty. */
export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-input hover:text-clay"
      aria-label={`Open order (${count} item${count === 1 ? "" : "s"})`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2m5 15a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-clay px-1 text-[11px] font-bold text-shell">
          {count}
        </span>
      )}
    </button>
  );
}
