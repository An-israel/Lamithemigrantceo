import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { normaliseEmail } from "@/lib/subscribers";
import { logEvent } from "@/lib/serviceLog";

/**
 * Adds people to the mailing list from the admin (one at a time or a CSV).
 * Never re-subscribes someone who unsubscribed, and requires the admin to
 * confirm these people agreed to get emails.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as {
    rows?: { email?: unknown; name?: unknown }[];
    consent?: boolean;
    source?: string;
  };
  if (body.consent !== true) {
    return NextResponse.json({ error: "Confirm these people agreed to receive your emails." }, { status: 400 });
  }
  const rows = Array.isArray(body.rows) ? body.rows.slice(0, 10000) : [];
  const source = body.source === "import" ? "CSV import" : "added by admin";

  const seen = new Set<string>();
  const invalid: string[] = [];
  const clean: { email: string; name: string | null; source: string }[] = [];
  for (const row of rows) {
    const email = normaliseEmail(row.email);
    if (!email) {
      const raw = String(row.email ?? "").trim();
      if (raw) invalid.push(raw.slice(0, 80));
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    const name = String(row.name ?? "").trim().slice(0, 120) || null;
    clean.push({ email, name, source });
  }

  const supabase = createServiceClient();
  let added = 0;
  for (let i = 0; i < clean.length; i += 500) {
    const { data, error } = await supabase
      .from("subscribers")
      .upsert(clean.slice(i, i + 500), { onConflict: "email", ignoreDuplicates: true })
      .select("id");
    if (error) {
      return NextResponse.json({ error: `Could not save (${error.message}). ${added} were added before this.` }, { status: 500 });
    }
    added += data?.length ?? 0;
  }

  const alreadyOnList = clean.length - added;
  if (added > 0) {
    await logEvent({
      category: "form",
      event: source === "CSV import" ? "subscriber.imported" : "subscriber.added",
      status: "success",
      summary:
        source === "CSV import"
          ? `${admin.email} imported ${added} subscriber${added === 1 ? "" : "s"}`
          : `${admin.email} added ${clean[0].email} to the mailing list`,
      detail: { added, already_on_list: alreadyOnList, invalid: invalid.length },
    });
  }
  return NextResponse.json({ ok: true, added, alreadyOnList, invalid: invalid.slice(0, 50), invalidCount: invalid.length });
}
