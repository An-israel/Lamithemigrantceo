import { createClient } from "@/lib/supabase/server";
import type { Venture } from "@/lib/types";

export async function getVentures(): Promise<Venture[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("ventures")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (data) return data as Venture[];
  } catch {
    /* fall through */
  }
  return [];
}
