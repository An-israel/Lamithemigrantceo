import { createClient } from "@/lib/supabase/server";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import type { Testimonial, Program } from "@/lib/types";

export default async function AdminTestimonialsPage() {
  let testimonials: Testimonial[] = [];
  let programs: Pick<Program, "id" | "name">[] = [];
  try {
    const supabase = createClient();
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("testimonials").select("*").order("sort_order", { ascending: true }),
      supabase.from("programs").select("id, name").order("sort_order", { ascending: true }),
    ]);
    testimonials = (t as Testimonial[]) || [];
    programs = (p as Pick<Program, "id" | "name">[]) || [];
  } catch {
    // db not ready
  }

  return (
    <>
      <h1>Testimonials</h1>
      <p className="mt-2 text-sm text-muted">
        Add, edit and archive student results. These show on the homepage and
        program pages.
      </p>
      <div className="mt-6">
        <TestimonialsManager initial={testimonials} programs={programs} />
      </div>
    </>
  );
}
