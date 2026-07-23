import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Admin shell. Access is enforced in middleware AND in Supabase RLS — a
 * non-admin never reaches this layout. Denser layout, --shell background,
 * Fraunces only on the page title.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-shell">
      <div className="md:flex">
        <AdminNav />
        <div className="flex-1 pb-24 md:pb-0">
          <div className="mx-auto max-w-5xl px-5 py-8 md:px-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
