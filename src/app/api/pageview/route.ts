import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Logs a page view with no PII. The session id from the client is hashed with
 * a daily salt so it cannot be reversed or joined across days. No IP is stored
 * and no cookie is set — so no consent banner is required.
 */
function classifyReferrer(ref: string | null): string | null {
  if (!ref) return null;
  const r = ref.toLowerCase();
  if (r.includes("tiktok")) return "TikTok";
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("google")) return "Google";
  return "Other";
}

export async function POST(request: Request) {
  try {
    const { path, referrer, session } = await request.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const day = new Date().toISOString().slice(0, 10);
    const sessionHash = session
      ? createHash("sha256").update(`${session}:${day}`).digest("hex").slice(0, 32)
      : null;

    // Country + device could be derived from request headers here; kept simple.
    const ua = request.headers.get("user-agent") || "";
    const device = /mobile/i.test(ua)
      ? "mobile"
      : /tablet|ipad/i.test(ua)
        ? "tablet"
        : "desktop";
    const country = request.headers.get("x-vercel-ip-country") || null;

    const supabase = createServiceClient();
    await supabase.from("page_views").insert({
      path: path.slice(0, 512),
      referrer: classifyReferrer(referrer),
      country,
      device_type: device,
      session_hash: sessionHash,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never break navigation — swallow errors.
    return NextResponse.json({ ok: true });
  }
}
