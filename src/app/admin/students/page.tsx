import { createClient } from "@/lib/supabase/server";
import { formatGBP } from "@/lib/format";
import type { Order, Program } from "@/lib/types";

interface StudentRow {
  email: string;
  name: string | null;
  programs: string[];
  totalSpend: number;
  lastOrder: string;
}

export default async function AdminStudentsPage() {
  let students: StudentRow[] = [];
  let dbReady = true;

  try {
    const supabase = createClient();
    const [{ data: orderRows, error }, { data: programRows }] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("status", "paid")
        .eq("item_type", "program")
        .order("created_at", { ascending: false }),
      supabase.from("programs").select("id, name"),
    ]);
    if (error) dbReady = false;

    const orders = (orderRows as Order[]) || [];
    const programs = (programRows as Pick<Program, "id" | "name">[]) || [];
    const programName = (id: string | null) =>
      programs.find((p) => p.id === id)?.name || "Program";

    const byEmail = new Map<string, StudentRow>();
    for (const o of orders) {
      const row = byEmail.get(o.email) || {
        email: o.email,
        name: o.name,
        programs: [],
        totalSpend: 0,
        lastOrder: o.created_at,
      };
      const pName = programName(o.item_id);
      if (!row.programs.includes(pName)) row.programs.push(pName);
      row.totalSpend += o.amount_gbp || 0;
      row.name = row.name || o.name;
      if (o.created_at > row.lastOrder) row.lastOrder = o.created_at;
      byEmail.set(o.email, row);
    }
    students = [...byEmail.values()].sort((a, b) =>
      a.lastOrder < b.lastOrder ? 1 : -1
    );
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Students</h1>
      <p className="mt-2 text-sm text-muted">
        Everyone with at least one paid programme, built from order history —
        the same records that grant access at <code>/my</code>.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      {students.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-peach p-6 text-sm text-muted">
          No paid programme orders yet.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Programs</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((s) => (
                <tr key={s.email}>
                  <td className="px-4 py-3">
                    <span className="block font-bold">{s.name || s.email}</span>
                    <a href={`mailto:${s.email}`} className="text-xs text-muted underline">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">{s.programs.join(", ")}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGBP(s.totalSpend)}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(s.lastOrder).toLocaleDateString("en-GB")}
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
