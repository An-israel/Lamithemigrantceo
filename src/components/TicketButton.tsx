"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

/** Starts a Stripe Checkout session for one event ticket. Price is read
 *  server-side from the events table. */
export function TicketButton({
  eventId,
  label,
  className,
}: {
  eventId: string;
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
        body: JSON.stringify({ type: "event", eventId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout unavailable.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={checkout} disabled={loading} className={clsx("btn btn-primary shadow-buy w-full", className)}>
        {loading ? "Taking you to checkout…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
    </div>
  );
}
