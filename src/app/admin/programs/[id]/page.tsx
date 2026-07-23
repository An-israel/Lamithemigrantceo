import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProgramEditor } from "@/components/admin/ProgramEditor";
import type { Program } from "@/lib/types";

export default async function ProgramEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  return (
    <>
      <Link
        href="/admin/programs"
        className="text-sm text-muted no-underline hover:text-clay"
      >
        ← All programs
      </Link>
      <ProgramEditor program={data as Program} />
    </>
  );
}
