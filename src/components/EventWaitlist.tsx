"use client";

import { useState } from "react";

/**
 * Capture form for a sold-out or past event: name, email, an optional
 * question, and a vote for the next city. Shows on any event that isn't
 * currently open for ticket sales, not just Build Her Empire Live.
 */
export function EventWaitlist({
  eventId,
  eventName,
  locations,
}: {
  eventId: string;
  eventName: string;
  locations: string[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [location, setLocation] = useState(locations[0] || "");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const parts = [`Waitlist request: ${eventName}`];
      if (location) parts.push(`Vote for next location: ${location}`);
      if (question.trim()) parts.push(`Question: ${question.trim()}`);
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Event waitlist",
          email,
          topic: "Event waitlist",
          message: parts.join("\n"),
          marketing_opt_in: true,
          source_page: `/events#${eventId}`,
        }),
      });
    } catch {
      // best-effort; still show confirmation
    }
    setSending(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-jade">
        You&rsquo;re on the list. We&rsquo;ll email you when the next one is
        announced.
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
    <form onSubmit={submit} className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="field text-sm"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="field text-sm"
      />
      {locations.length > 0 && (
        <div>
          <label className="label mb-1 block">Vote for the next location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field text-sm"
          >
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Any questions? (optional)"
        rows={2}
        className="field resize-y text-sm"
      />
      <button
        type="submit"
        disabled={sending}
        className="btn btn-secondary w-fit text-sm"
      >
        {sending ? "Sending…" : "Notify me"}
      </button>
    </form>
  );
}
