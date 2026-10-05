"use client";

import { useState } from "react";

export function TestEmailButton() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "failed">("idle");
  const [message, setMessage] = useState("");

  async function send() {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      setState(data.ok ? "ok" : "failed");
      setMessage(data.message || data.error || "No response.");
    } catch {
      setState("failed");
      setMessage("Could not reach the site. Check your connection and try again.");
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button type="button" onClick={send} disabled={state === "sending"} className="btn btn-secondary shrink-0 text-sm">
        {state === "sending" ? "Sending…" : "Send test email to me"}
      </button>
      {message && (
        <p role="status" className={`text-sm ${state === "ok" ? "text-jade" : "text-[#9b2c1f]"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
