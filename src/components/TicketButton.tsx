"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

/** Starts a Stripe Checkout session for one event ticket. Price is read
 *  server-side from the events table. */
export function TicketButton({
  eventId,
  eventName,
  label,
  className,
  whatsappNumber,
}: {
  eventId: string;
  eventName?: string;
  label: string;
  className?: string;
  whatsappNumber?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUnavailable, setCheckoutUnavailable] = useState(false);

  async function checkout() {
    setLoading(true);
    setError(null);
    setCheckoutUnavailable(false);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "event", eventId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        if (res.status === 503) setCheckoutUnavailable(true);
        throw new Error(data.error || "Checkout unavailable.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const waHref =
    checkoutUnavailable && whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
          `Hi Lami, I'd like a ticket${eventName ? ` for ${eventName}` : ""}.`
        )}`
      : null;

  return (
    <div>
      <button onClick={checkout} disabled={loading} className={clsx("btn btn-primary shadow-buy w-full", className)}>
        {loading ? "Taking you to checkout…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm text-clay underline"
        >
          Get your ticket on WhatsApp instead →
        </a>
      )}
    </div>
  );
}
