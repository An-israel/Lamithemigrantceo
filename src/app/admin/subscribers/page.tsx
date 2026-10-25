import { createClient } from "@/lib/supabase/server";
import { SubscribersManager } from "@/components/admin/SubscribersManager";
import type { Subscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const supabase = createClient();
  const rows: Subscriber[] = [];
  let ready = true;
  try {
    for (let from = 0; from < 20000; from += 1000) {
      const { data, error } = await supabase
        .from("subscribers")
        .select("id, created_at, email, name, status, source, consent_at, unsubscribed_at")
        .order("created_at", { ascending: false })
        .range(from, from + 999);
      if (error) {
        ready = false;
        break;
      }
      rows.push(...((data as Subscriber[]) || []));
      if (!data || data.length < 1000) break;
    }
  } catch {
    ready = false;
  }

  return (
    <>
      <h1>Subscribers</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Everyone who asked for The Build Letter. People join from the newsletter forms, by ticking the box on the contact
        form or a free resource, or when you add them here. Only people who agreed to get your emails should be on this
        list.
      </p>
      {!ready && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          Email marketing isn&rsquo;t set up in the database yet. Run{" "}
          <code>supabase/migrations/0020_email_marketing.sql</code> in the Supabase SQL editor, then reload.
        </div>
      )}
      <SubscribersManager initial={rows} />
    </>
  );
}
