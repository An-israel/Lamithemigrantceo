import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventEditor } from "@/components/admin/EventEditor";
import type { EventItem } from "@/lib/types";

export default async function EventEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase.from("events").select("*").eq("id", params.id).single();
  if (!data) notFound();

  return (
    <>
      <Link href="/admin/events" className="text-sm text-muted no-underline hover:text-clay">
        ← All events
      </Link>
      <EventEditor event={data as EventItem} />
    </>
  );
}
