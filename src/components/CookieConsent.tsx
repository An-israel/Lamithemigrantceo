"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * UK-compliant cookie notice. The site uses only essential storage and
 * cookieless analytics, so this is a notice + acknowledgement rather than a
 * tracking gate. The choice is stored in localStorage (not a cookie), so it
 * itself requires no consent.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("gbg-cookie-ack")) setShow(true);
    } catch {
      // storage unavailable — don't nag
    }
  }, []);

  function acknowledge() {
    try {
      localStorage.setItem("gbg-cookie-ack", new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
      <div className="mx-auto flex max-w-content flex-col gap-3 rounded-card border border-line bg-shell p-4 shadow-buy sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use essential storage and privacy-friendly, cookieless analytics —
          no tracking cookies. See our{" "}
          <Link href="/cookies" className="underline">cookie policy</Link>.
        </p>
        <button onClick={acknowledge} className="btn btn-primary text-sm shrink-0">
          Got it
        </button>
      </div>
    </div>
  );
}
