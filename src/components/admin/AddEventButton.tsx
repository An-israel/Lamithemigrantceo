"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AddEventButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    const supabase = createClient();
    const suffix = Math.random().toString(36).slice(2, 7);
    const { data, error } = await supabase
      .from("events")
      .insert({ name: "Untitled event", slug: `untitled-${suffix}`, status: "draft" })
      .select("id")
      .single();
    setBusy(false);
    if (!error && data) router.push(`/admin/events/${(data as { id: string }).id}`);
  }

  return (
    <button onClick={add} disabled={busy} className="btn btn-primary text-sm">
      {busy ? "Creating…" : "Add an event"}
    </button>
  );
}
