"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatGBP } from "@/lib/format";

export function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQuantity, remove, count } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "wholesale",
          items: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout is not available yet.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-shell"
        aria-label="Your order"
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3>Your order ({count})</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-2xl leading-none text-muted"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <p className="text-muted">Your order is empty.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-input bg-peach-deep">
                    {l.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.image}
                        alt={l.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{l.name}</p>
                    <p className="text-sm text-muted">{formatGBP(l.price_gbp)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="h-8 w-8 rounded-input border border-line"
                        onClick={() => setQuantity(l.id, l.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center tabular-nums">
                        {l.quantity}
                      </span>
                      <button
                        className="h-8 w-8 rounded-input border border-line disabled:opacity-40"
                        onClick={() => setQuantity(l.id, l.quantity + 1)}
                        disabled={l.quantity >= l.stock}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        className="ml-auto text-sm text-muted underline"
                        onClick={() => remove(l.id)}
                      >
                        Remove
                      </button>
                    </div>
                    {l.quantity >= l.stock && (
                      <p className="mt-1 text-xs text-muted">
                        Only {l.stock} in stock.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="price">{formatGBP(subtotal)}</span>
          </div>
          {error && <p className="mb-3 text-sm text-clay">{error}</p>}
          <button
            className="btn btn-primary shadow-buy w-full"
            disabled={lines.length === 0 || loading}
            onClick={checkout}
          >
            {loading ? "Taking you to checkout…" : "Checkout"}
          </button>
          <p className="mt-2 text-center text-[13px] text-muted">
            Secure card payment. UK shipping collected at checkout.
          </p>
        </div>
      </aside>
    </div>
  );
}
