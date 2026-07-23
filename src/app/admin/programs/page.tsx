import { createClient } from "@/lib/supabase/server";
import { formatGBP, getPrograms } from "@/lib/data";
import type { Program } from "@/lib/types";

export default async function AdminProgramsPage() {
  // Read live programs (including drafts) for the manager list.
  let programs: Program[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("programs")
      .select("*")
      .order("sort_order", { ascending: true });
    programs = (data as Program[]) || [];
  } catch {
    programs = [];
  }
  if (programs.length === 0) programs = await getPrograms();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1>Programs</h1>
        <button className="btn btn-primary text-sm">Add a program</button>
      </div>
      <p className="mt-2 text-sm text-muted">
        The full drag-to-reorder editor with autosave and image compression
        ships in Release 2. This list reads live data now.
      </p>

      <div className="mt-6 overflow-hidden rounded-card border border-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {programs.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatGBP(p.price_gbp)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.format === "live_cohort" ? "Live cohort" : "Self-paced"}
                </td>
                <td className="px-4 py-3">
                  <span className="pill bg-peach text-ink text-xs capitalize">
                    {p.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
