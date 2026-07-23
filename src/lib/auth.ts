import { createClient } from "@/lib/supabase/server";

/**
 * Returns the signed-in user if they are an admin, else null. Use in
 * privileged API routes as a second gate on top of middleware.
 */
export async function getAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile as { role?: string } | null)?.role === "admin" ? user : null;
}
