import { createClient } from "@/lib/supabase/server";
import { EnquiriesInbox } from "@/components/admin/EnquiriesInbox";
import type { Enquiry } from "@/lib/types";

export default async function AdminEnquiriesPage() {
  let enquiries: Enquiry[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) dbReady = false;
    enquiries = (data as Enquiry[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Enquiries</h1>
      <p className="mt-2 text-sm text-muted">
        When someone uses the contact form it lands here.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <EnquiriesInbox initial={enquiries} />
      </div>
    </>
  );
}
