"use client";

import { useState } from "react";

/** "Tell me when the next cohort opens" capture for a sold-out product. */
export function ProductWaitlist({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Product waitlist",
          email,
          topic: "Product waitlist",
          message: `Waitlist request: ${productName}`,
          marketing_opt_in: true,
          source_page: `/products#${productId}`,
        }),
      });
    } catch {
      // best-effort; still show confirmation
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-jade">
        We&rsquo;ll email you when the next cohort opens.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="text-sm text-clay underline"
        onClick={() => setOpen(true)}
      >
        Join the waitlist
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="field text-sm"
      />
      <button type="submit" className="btn btn-secondary shrink-0 text-sm">
        Notify me
      </button>
    </form>
  );
}
