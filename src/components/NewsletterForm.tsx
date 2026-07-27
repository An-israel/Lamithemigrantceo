"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

/** The Build Letter email capture. `theme` adapts it to dark (footer) or
 *  light (on-page) backgrounds. */
export function NewsletterForm({
  theme = "dark",
  cta = "Get The Build Letter",
}: {
  theme?: "dark" | "light";
  cta?: string;
}) {
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
      <p className={theme === "dark" ? "text-gold-soft" : "text-jade"}>
        You&rsquo;re in — check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor={`nl-${theme}`} className="sr-only">
        Email address
      </label>
      <input
        id={`nl-${theme}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={clsx(
          "field",
          theme === "dark"
            ? "bg-shell/10 border-shell/25 text-shell placeholder:text-shell/50"
            : "bg-shell border-line text-ink"
        )}
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary shrink-0"
      >
        {state === "sending" ? "Sending…" : cta}
      </button>
      {state === "error" && (
        <p className={theme === "dark" ? "text-gold-soft" : "text-clay"}>
          That did not go through. Try again.
        </p>
      )}
    </form>
  );
}
