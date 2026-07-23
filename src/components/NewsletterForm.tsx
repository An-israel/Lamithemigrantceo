"use client";

import { useState } from "react";

/** Footer email capture. Stores into the `enquiries`-adjacent newsletter flow. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-peach-deep">
        Check your inbox — the starter list is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="field bg-shell/10 border-shell/25 text-shell placeholder:text-shell/50"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary shrink-0"
      >
        {state === "sending" ? "Sending…" : "Get the free starter list"}
      </button>
      {state === "error" && (
        <p className="text-peach-deep sm:hidden">
          That did not go through. Try again.
        </p>
      )}
    </form>
  );
}
