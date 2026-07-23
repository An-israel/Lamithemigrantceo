import { createClient } from "@/lib/supabase/server";
import { EnquiriesInbox } from "@/components/admin/EnquiriesInbox";
import type { Enquiry } from "@/lib/types";

export default async function AdminEnquiriesPage() {
  const supabase = createClient();

  let enquiries: Enquiry[] = [];
  try {
    const { data } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    enquiries = (data as Enquiry[]) || [];
  } catch {
    enquiries = [];
  }

  return (
    <>
      <h1>Enquiries</h1>
      <p className="mt-2 text-sm text-muted">
        When someone uses the contact form it lands here.
      </p>
      <div className="mt-6">
        <EnquiriesInbox initial={enquiries} />
      </div>
    </>
  );
}
