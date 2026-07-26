import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JournalEditor } from "@/components/admin/JournalEditor";
import type { JournalPost } from "@/lib/types";

export default async function JournalEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();

  return (
    <>
      <Link href="/admin/journal" className="text-sm text-muted no-underline hover:text-clay">
        ← All articles
      </Link>
      <JournalEditor post={data as JournalPost} />
    </>
  );
}
