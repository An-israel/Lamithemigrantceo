"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

/** The Build Letter email capture. `theme` adapts it to dark (footer) or
 *  light (on-page) backgrounds. */
export function NewsletterForm({
  theme = "dark",
  cta = "Get The Build Letter",
  buttonClassName,
}: {
  theme?: "dark" | "light";
  cta?: string;
  /** Override the submit button's colors — needed when the surrounding
   *  section is itself clay/emerald, so the primary button doesn't blend
   *  into the background. */
  buttonClassName?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  // Honeypot for basic spam protection.
  const [company, setCompany] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (company) return;
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
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
        You&rsquo;re in. Check your inbox to confirm.
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
      <button
        type="submit"
        disabled={state === "sending"}
        className={clsx("btn btn-primary shrink-0", buttonClassName)}
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
