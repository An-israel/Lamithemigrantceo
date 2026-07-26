import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/format";
import { AddEventButton } from "@/components/admin/AddEventButton";
import type { EventItem } from "@/lib/types";

export default async function AdminEventsPage() {
  let events: EventItem[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) dbReady = false;
    events = (data as EventItem[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1>Events</h1>
        <AddEventButton />
      </div>
      <p className="mt-2 text-sm text-muted">
        Sell tickets to in-person events. Set status to Live to show on the site.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          Database not connected yet (docs/DEPLOYMENT.md).
        </div>
      )}

      {events.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-peach p-6 text-sm text-muted">
          No events yet. Use “Add an event”.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Sold</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-bold">{e.name}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGBP(e.price_gbp)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {e.tickets_sold}{e.capacity != null ? ` / ${e.capacity}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className="pill bg-peach text-ink text-xs capitalize">
                      {e.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/events/${e.id}`} className="text-clay no-underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
