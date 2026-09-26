"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const KEEP_DAYS = 90;

export function ServiceLogClearButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function clearOld() {
    if (!confirm(`Delete service log entries older than ${KEEP_DAYS} days? This can't be undone.`)) return;
    setBusy(true);
    setMessage(null);
    const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString();
    const supabase = createClient();
    const { error, count } = await supabase
      .from("service_log")
      .delete({ count: "exact" })
      .lt("created_at", cutoff);
    setBusy(false);
    setMessage(error ? "Could not clear old entries." : `Removed ${count ?? 0} old entr${count === 1 ? "y" : "ies"}.`);
    router.refresh();
  }

  return (
    <span className="flex items-center gap-3">
      {message && <span className="text-muted">{message}</span>}
      <button type="button" onClick={clearOld} disabled={busy} className="text-clay underline disabled:opacity-50">
        {busy ? "Clearing…" : `Clear entries older than ${KEEP_DAYS} days`}
      </button>
    </span>
  );
}
