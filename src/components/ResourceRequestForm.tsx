"use client";

import { useState } from "react";

/**
 * Inline "get this free" capture for a resource that doesn't have an
 * uploaded file yet. Records the request as an enquiry (topic "Resource")
 * with the resource's title in the message, so it shows up in
 * /admin/enquiries and Lami can see exactly which guide someone wants and
 * send it by hand until the file is uploaded.
 */
export function ResourceRequestForm({
  resourceId,
  resourceTitle,
}: {
  resourceId: string;
  resourceTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Resource request",
          email,
          topic: "Resource",
          message: `Requested: ${resourceTitle}`,
          marketing_opt_in: true,
          source_page: `/resources#${resourceId}`,
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-4 text-sm text-jade">
        Got it — Lami will send this to your inbox shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex gap-2">
        <label htmlFor={`res-${resourceId}`} className="sr-only">
          Email address
        </label>
        <input
          id={`res-${resourceId}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="field text-sm"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn btn-secondary shrink-0 text-sm"
        >
          {state === "sending" ? "Sending…" : "Get it free"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-1 text-xs text-clay">That didn&rsquo;t go through.</p>
      )}
    </form>
  );
}
