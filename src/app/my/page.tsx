import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { ButtonLink } from "@/components/Button";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import { formatGBP, getSiteContent } from "@/lib/data";
import { content } from "@/lib/contentRegistry";
import type { Order, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "My products",
  robots: { index: false },
};

export default async function MyPage() {
  const supabase = createClient();
  const [{ data: { user } }, siteContent] = await Promise.all([
    supabase.auth.getUser(),
    getSiteContent(),
  ]);
  const c = (key: string) => content(siteContent, key);

  // Middleware guarantees a signed-in user here, but guard anyway.
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  // Orders for this user's email.
  let orders: Order[] = [];
  let products: Product[] = [];
  try {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*")
      .eq("email", user!.email!)
      .eq("status", "paid")
      .order("created_at", { ascending: false });
    orders = (orderRows as Order[]) || [];

    const productIds = orders
      .filter((o) => (o.item_type === "product" || o.item_type === "program") && o.item_id)
      .map((o) => o.item_id!);
    if (productIds.length > 0) {
      const { data: prodRows } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);
      products = (prodRows as Product[]) || [];
    }
  } catch {
    // Tables may not be populated yet; show the empty state.
  }

  return (
    <Section background="shell">
      <div className="flex items-center justify-between gap-4">
        <h1>Hi {firstName}.</h1>
        <SignOutButton />
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-card border border-line bg-peach p-8 text-center">
          <p className="font-display text-2xl">{c("my.empty.heading")}</p>
          <p className="mt-2 text-muted">{c("my.empty.subtext")}</p>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/products">See the products</ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mt-10">Your products</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/my/${p.slug}`}
                className="card p-6 no-underline"
              >
                <h3 className="text-ink">{p.name}</h3>
                <p className="mt-2 text-sm text-muted">Open your materials →</p>
              </Link>
            ))}
          </div>

          <h2 className="mt-14">Order history</h2>
          <table className="mt-6 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="py-3">
                    {new Date(o.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3">
                    {products.find((p) => p.id === o.item_id)?.name ||
                      o.item_type}
                  </td>
                  <td className="py-3 tabular-nums">
                    {formatGBP(o.amount_gbp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Section>
  );
}
