"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Magic-link sign in. Passwordless by design — her audience should never
 *  have to remember a password. */
export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);

    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
      next || "/my"
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setState("error");
      setError("Could not send the link. Check the email and try again.");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-card border border-jade bg-shell p-6">
        <p className="font-display text-xl text-jade">Check your email.</p>
        <p className="mt-2 text-muted">
          We sent a sign-in link to <strong>{email}</strong>. Tap it on this
          device to come straight in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="label mb-2 block">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          placeholder="you@email.com"
        />
      </div>
      {state === "error" && error && <p className="text-clay">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary w-full"
      >
        {state === "sending" ? "Sending the link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
