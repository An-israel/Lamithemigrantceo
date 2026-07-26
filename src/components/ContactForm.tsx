"use client";

import { useState } from "react";

// §6.10 — separate enquiry routes
const TYPES = ["Speaking", "Media", "Partnerships", "Consulting", "General"];
const BUDGETS = [
  "Not sure yet",
  "Under £1,000",
  "£1,000–£5,000",
  "£5,000–£15,000",
  "£15,000+",
];

const MAX_MESSAGE = 1000;

export function ContactForm({ initialType }: { initialType?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState(initialType || TYPES[0]);
  const [message, setMessage] = useState("");
  // Honeypot for basic spam protection.
  const [company, setCompany] = useState("");

  const showEventDate = topic === "Speaking";
  const showBudget = ["Speaking", "Partnerships", "Consulting"].includes(topic);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (company) return; // honeypot tripped
    setState("sending");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          organisation: data.organisation,
          topic,
          event_date: data.event_date || null,
          budget_range: data.budget_range || null,
          message: data.message,
          marketing_opt_in: data.marketing_opt_in === "on",
          source_page: "/contact",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Message did not send.");
      }
      setState("sent");
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "Message did not send. Try WhatsApp instead."
      );
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-card border border-jade bg-shell p-8">
        <p className="font-display text-2xl text-jade">Message sent.</p>
        <p className="mt-2 text-muted">Lami replies within one working day.</p>
        <button
          className="btn btn-secondary mt-6"
          onClick={() => {
            setState("idle");
            setMessage("");
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Enquiry type first — it routes the message */}
      <div>
        <label htmlFor="topic" className="label mb-2 block">
          Enquiry type
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="field"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label mb-2 block">
            Full name
          </label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label htmlFor="organisation" className="label mb-2 block">
            Organisation (optional)
          </label>
          <input id="organisation" name="organisation" className="field" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label mb-2 block">
          Email
        </label>
        <input id="email" name="email" type="email" required className="field" />
      </div>

      {(showEventDate || showBudget) && (
        <div className="grid gap-5 sm:grid-cols-2">
          {showEventDate && (
            <div>
              <label htmlFor="event_date" className="label mb-2 block">
                Event date (if relevant)
              </label>
              <input id="event_date" name="event_date" type="date" className="field" />
            </div>
          )}
          {showBudget && (
            <div>
              <label htmlFor="budget_range" className="label mb-2 block">
                Budget range
              </label>
              <select id="budget_range" name="budget_range" className="field" defaultValue={BUDGETS[0]}>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="message" className="label mb-2 block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={MAX_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="field resize-y"
        />
        <p className="mt-1 text-right text-sm text-muted">
          {message.length}/{MAX_MESSAGE}
        </p>
      </div>

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

      <label className="flex items-start gap-3">
        <input type="checkbox" name="marketing_opt_in" className="mt-1 h-4 w-4 accent-clay" />
        <span className="text-sm text-muted">
          Send me The Build Letter — occasional business, wealth and legacy insights
        </span>
      </label>

      {state === "error" && error && <p className="text-clay">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary w-full sm:w-auto"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
