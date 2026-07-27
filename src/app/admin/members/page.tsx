import { createClient } from "@/lib/supabase/server";
import type { Membership } from "@/lib/types";

export default async function AdminMembersPage() {
  let members: Membership[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("memberships")
      .select("*")
      .order("created_at", { ascending: false });
    members = (data as Membership[]) || [];
  } catch {
    /* db not ready */
  }

  return (
    <>
      <h1>Community members</h1>
      <p className="mt-2 text-sm text-muted">
        People who joined African Women Builds from the Movement page.
      </p>

      <div className="mt-6 overflow-hidden rounded-card border border-line">
        {members.length === 0 ? (
          <p className="p-6 text-sm text-muted">No members yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Building</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-bold">{m.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${m.email}`} className="underline">{m.email}</a>
                  </td>
                  <td className="px-4 py-3 text-muted">{m.reason || "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(m.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
