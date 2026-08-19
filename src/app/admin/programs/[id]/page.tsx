import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProgramEditor } from "@/components/admin/ProgramEditor";
import { ProgramModulesManager } from "@/components/admin/ProgramModulesManager";
import type { Program, ProgramModule } from "@/lib/types";

export default async function ProgramEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data }, { data: moduleRows }] = await Promise.all([
    supabase.from("programs").select("*").eq("id", params.id).single(),
    supabase
      .from("program_modules")
      .select("*")
      .eq("program_id", params.id)
      .order("sort_order", { ascending: true }),
  ]);

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
      <div className="mt-4 max-w-2xl border-t border-line pt-8 pb-16">
        <ProgramModulesManager
          programId={params.id}
          initial={(moduleRows as ProgramModule[]) || []}
        />
      </div>
    </>
  );
}
