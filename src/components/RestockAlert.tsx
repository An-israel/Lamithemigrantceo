"use client";

import { useState } from "react";

/** "Tell me when it is back" email capture for sold-out bundles. */
export function RestockAlert({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
    } catch {
      // best-effort; still show confirmation
    }
    setDone(true);
  }

  if (done) {
    return <p className="text-sm text-jade">We&rsquo;ll email you when it&rsquo;s back.</p>;
  }

  if (!open) {
    return (
      <button
        className="text-sm text-clay underline"
        onClick={() => setOpen(true)}
      >
        Tell me when it is back
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
      <button type="submit" className="btn btn-secondary text-sm">
        Notify me
      </button>
    </form>
  );
}
