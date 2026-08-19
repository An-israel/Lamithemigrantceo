import { createClient } from "@/lib/supabase/server";
import { ApplicationsInbox } from "@/components/admin/ApplicationsInbox";
import type { Application } from "@/lib/types";

export default async function AdminApplicationsPage() {
  let applications: Application[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) dbReady = false;
    applications = (data as Application[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Applications</h1>
      <p className="mt-2 text-sm text-muted">
        Programme applications from people who applied instead of buying
        instantly.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <ApplicationsInbox initial={applications} />
      </div>
    </>
  );
}
