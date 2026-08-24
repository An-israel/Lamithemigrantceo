import { createClient } from "@/lib/supabase/server";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import type { Testimonial, Product } from "@/lib/types";

export default async function AdminTestimonialsPage() {
  let testimonials: Testimonial[] = [];
  let products: Pick<Product, "id" | "name">[] = [];
  let dbReady = true;
  try {
    const supabase = createClient();
    const [{ data: t, error }, { data: p }] = await Promise.all([
      supabase.from("testimonials").select("*").order("sort_order", { ascending: true }),
      supabase.from("products").select("id, name").order("sort_order", { ascending: true }),
    ]);
    if (error) dbReady = false;
    testimonials = (t as Testimonial[]) || [];
    products = (p as Pick<Product, "id" | "name">[]) || [];
  } catch {
    dbReady = false;
  }

  return (
    <>
      <h1>Testimonials</h1>
      <p className="mt-2 text-sm text-muted">
        Add, edit and archive student results. These show on the homepage and
        product pages.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-card border border-line bg-peach p-4 text-sm">
          The database is not connected yet. See docs/DEPLOYMENT.md.
        </div>
      )}

      <div className="mt-6">
        <TestimonialsManager initial={testimonials} products={products} />
      </div>
    </>
  );
}
