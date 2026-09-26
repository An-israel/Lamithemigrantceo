import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { filteredQuery, formatLogTime, parseFilters, type ServiceLogRow } from "@/lib/serviceLogQuery";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  // Neutralise spreadsheet formula injection, then CSV-quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** CSV of the service log with the same filters as the page (max 5,000 rows). */
export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const filters = parseFilters(params);
  const { data, error } = await filteredQuery(createClient(), filters).limit(5000);
  if (error) return NextResponse.json({ error: "Could not read the service log." }, { status: 500 });

  const header = ["Time (UK)", "Category", "Status", "Event", "Summary", "Reference", "Details"];
  const lines = ((data as ServiceLogRow[]) || []).map((r) =>
    [formatLogTime(r.created_at), r.category, r.status, r.event, r.summary, r.ref, r.detail].map(cell).join(",")
  );
  const csv = [header.map(cell).join(","), ...lines].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="service-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
