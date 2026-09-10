/**
 * Best-effort in-memory rate limiter for public write endpoints. Per-server-
 * instance only (Vercel can run several in parallel), so this is a real
 * ceiling against a single scripted attacker, not a hard global guarantee.
 * For that, put Upstash Redis (or similar) behind this same interface.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
