import { createClient } from "@/lib/supabase/server";
import { ApplicationsInbox } from "@/components/admin/ApplicationsInbox";
import type { Application } from "@/lib/types";

export default async function AdminApplicationsPage() {
  let applications: Application[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    applications = (data as Application[]) || [];
  } catch {
    /* db not ready */
  }

  return (
    <>
      <h1>Applications</h1>
      <p className="mt-2 text-sm text-muted">
        Programme applications from people who applied instead of buying
        instantly.
      </p>
      <div className="mt-6">
        <ApplicationsInbox initial={applications} />
      </div>
    </>
  );
}
