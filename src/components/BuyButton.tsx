"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Starts a Stripe Checkout session for a single program. The price is looked
 * up server-side from the database — never trust a price from the browser.
 */
export function BuyButton({
  programId,
  label,
  className,
}: {
  programId: string;
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "program", programId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout is not available yet.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try WhatsApp."
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={checkout}
        disabled={loading}
        className={clsx("btn btn-primary shadow-buy w-full", className)}
      >
        {loading ? "Taking you to checkout…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
    </div>
  );
}
