"use client";

import { useState } from "react";

const TOPICS = [
  "Joining a program",
  "Wholesale bundles",
  "Speaking or press",
  "Something else",
];

const MAX_MESSAGE = 500;

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
          whatsapp: data.whatsapp,
          topic: data.topic,
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
    } catch (e) {
      setState("error");
      setError(
        e instanceof Error
          ? e.message
          : "Message did not send. Message me on WhatsApp instead."
      );
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-card border border-jade bg-shell p-8">
        <p className="font-display text-2xl text-jade">Message sent.</p>
        <p className="mt-2 text-muted">
          Lami replies within one working day.
        </p>
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
      <div>
        <label htmlFor="name" className="label mb-2 block">
          Full name
        </label>
        <input id="name" name="name" required className="field" />
      </div>

      <div>
        <label htmlFor="email" className="label mb-2 block">
          Email
        </label>
        <input id="email" name="email" type="email" required className="field" />
      </div>

      <div>
        <label htmlFor="whatsapp" className="label mb-2 block">
          WhatsApp number (optional)
        </label>
        <input id="whatsapp" name="whatsapp" className="field" />
      </div>

      <div>
        <label htmlFor="topic" className="label mb-2 block">
          What do you need help with?
        </label>
        <select id="topic" name="topic" required className="field" defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

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

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="marketing_opt_in"
          className="mt-1 h-4 w-4 accent-clay"
        />
        <span className="text-sm text-muted">
          Send me occasional emails about new programs
        </span>
      </label>

      {state === "error" && error && (
        <p className="text-clay">{error}</p>
      )}

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
