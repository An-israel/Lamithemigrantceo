import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddJournalButton } from "@/components/admin/AddJournalButton";
import type { JournalPost } from "@/lib/types";

export default async function AdminJournalPage() {
  let posts: JournalPost[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("journal_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) dbReady = false;
    posts = (data as JournalPost[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1>The Build Journal</h1>
        <AddJournalButton />
      </div>
      <p className="mt-2 text-sm text-muted">
        Write and publish articles without a developer. Drafts stay hidden until
        you publish.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          Database not connected yet. Run migrations + add keys (docs/DEPLOYMENT.md).
        </div>
      )}

      {posts.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-peach p-6 text-sm text-muted">
          No articles yet. Use “Add an article” to write your first.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-bold">{p.title}</td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`pill text-xs ${p.published ? "bg-jade text-shell" : "bg-peach text-ink"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/journal/${p.id}`} className="text-clay no-underline">
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
