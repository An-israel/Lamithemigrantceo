"use client";

import { useState } from "react";

/**
 * Programme application. Shown on program detail pages as an alternative to
 * instant checkout — useful for higher-touch or application-gated programmes.
 */
export function ApplyForm({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: programId,
          program_name: programName,
          name: fd.get("name"),
          email: fd.get("email"),
          whatsapp: fd.get("whatsapp"),
          answers: { goal: fd.get("goal"), stage: fd.get("stage") },
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
        Application received. Lami will be in touch about {programName}.
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
      <p className="label">Apply for {programName}</p>
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
      {state === "error" && error && <p className="text-sm text-clay">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-secondary w-full text-sm">
        {state === "sending" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
