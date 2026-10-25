"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Creates a blank draft email and opens it. */
export function NewCampaignButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add() {
    setBusy(true);
    setError("");
    const { data, error } = await createClient()
      .from("email_campaigns")
      .insert({ name: `Build Letter ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` })
      .select("id")
      .single();
    if (error || !data) {
      setBusy(false);
      setError("Couldn't create the email. Has database update 0020 been run?");
      return;
    }
    router.push(`/admin/campaigns/${(data as { id: string }).id}`);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button onClick={add} disabled={busy} className="btn btn-primary text-sm">
        {busy ? "Creating…" : "Write a new email"}
      </button>
      {error && <p className="text-sm text-[#9b2c1f]">{error}</p>}
    </div>
  );
}
