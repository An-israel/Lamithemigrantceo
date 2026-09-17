"use client";

import { useState } from "react";

/**
 * Product application. Shown on product detail pages as an alternative to
 * instant checkout, useful for higher-touch or application-gated products.
 */
export function ApplyForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // Honeypot for basic spam protection.
  const [company, setCompany] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (company) return;
    setState("sending");
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          product_name: productName,
          name: fd.get("name"),
          email: fd.get("email"),
          whatsapp: fd.get("whatsapp"),
          answers: { goal: fd.get("goal"), stage: fd.get("stage") },
          company, // honeypot — a real visitor never fills this in
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Could not submit.");
      }
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-4 rounded-input border border-jade bg-shell p-4 text-sm text-jade">
        Application received. Lami will be in touch about {productName}.
      </p>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-4 text-sm text-clay underline">
        Not ready to pay? Apply or ask a question →
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-input border border-line p-4">
      <p className="label">Apply for {productName}</p>
      <input name="name" required placeholder="Full name" className="field" />
      <input name="email" type="email" required placeholder="Email" className="field" />
      <input name="whatsapp" placeholder="WhatsApp (optional)" className="field" />
      <select name="stage" className="field" defaultValue="">
        <option value="" disabled>Where are you now?</option>
        <option>Just an idea</option>
        <option>Starting out</option>
        <option>Already selling</option>
        <option>Scaling</option>
      </select>
      <textarea name="goal" rows={3} placeholder="What do you want to achieve?" className="field resize-y" />
      {/* Honeypot — hidden from users, catches bots */}
      <div className="hidden" aria-hidden>
        <label>
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>
      {state === "error" && error && <p className="text-sm text-clay">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-secondary w-full text-sm">
        {state === "sending" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
