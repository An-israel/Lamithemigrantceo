"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Creates a blank wholesale product and opens its editor. */
export function AddWholesaleButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    const supabase = createClient();
    const suffix = Math.random().toString(36).slice(2, 7);
    const { data, error } = await supabase
      .from("wholesale_products")
      .insert({
        name: "Untitled bundle",
        slug: `untitled-${suffix}`,
        archived: true, // hidden from the shop until it's ready
      })
      .select("id")
      .single();
    setBusy(false);
    if (!error && data) {
      router.push(`/admin/wholesale/${(data as { id: string }).id}`);
    }
  }

  return (
    <button onClick={add} disabled={busy} className="btn btn-primary text-sm">
      {busy ? "Creating…" : "Add a bundle"}
    </button>
  );
}
