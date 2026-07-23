"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Creates a blank draft program and opens its editor. */
export function AddProgramButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    const supabase = createClient();
    const suffix = Math.random().toString(36).slice(2, 7);
    const { data, error } = await supabase
      .from("programs")
      .insert({
        name: "Untitled program",
        slug: `untitled-${suffix}`,
        status: "draft",
      })
      .select("id")
      .single();
    setBusy(false);
    if (!error && data) {
      router.push(`/admin/programs/${(data as { id: string }).id}`);
    }
  }

  return (
    <button onClick={add} disabled={busy} className="btn btn-primary text-sm">
      {busy ? "Creating…" : "Add a program"}
    </button>
  );
}
