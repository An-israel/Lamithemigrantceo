"use client";

import { useState } from "react";

/** African Women Builds join / waitlist form (§6.4). */
export function JoinForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Could not sign you up.");
      }
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto max-w-md rounded-card border border-jade bg-shell p-6 text-center">
        <p className="font-display text-xl text-jade">You&rsquo;re on the list.</p>
        <p className="mt-2 text-muted">
          Welcome to African Women Builds. I&rsquo;ll be in touch with the next
          step.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 text-left">
      <div>
        <label htmlFor="join-name" className="label mb-2 block">Full name</label>
        <input id="join-name" name="name" required className="field" />
      </div>
      <div>
        <label htmlFor="join-email" className="label mb-2 block">Email</label>
        <input id="join-email" name="email" type="email" required className="field" />
      </div>
      <div>
        <label htmlFor="join-wa" className="label mb-2 block">WhatsApp (optional)</label>
        <input id="join-wa" name="whatsapp" className="field" />
      </div>
      <div>
        <label htmlFor="join-reason" className="label mb-2 block">What are you building? (optional)</label>
        <textarea id="join-reason" name="reason" rows={3} className="field resize-y" />
      </div>
      {state === "error" && error && <p className="text-clay">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full">
        {state === "sending" ? "Joining…" : "Join African Women Builds"}
      </button>
    </form>
  );
}
