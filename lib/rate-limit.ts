// Lightweight in-memory rate limiter (fixed window per IP+key). Suitable for a
// single instance; for multi-instance deployments back it with Redis/Upstash by
// swapping `hit()`. Returns a 429 response when the caller is over the limit.
import { NextResponse } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

function limitPerMinute(): number {
  const n = Number(process.env.RATE_LIMIT_PER_MINUTE);
  return Number.isFinite(n) && n > 0 ? n : 60;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Records a hit for `${key}:${ip}`. Returns null when allowed, or a 429
 * NextResponse when the limit is exceeded.
 */
export function rateLimit(request: Request, key: string, max = limitPerMinute()): NextResponse | null {
  const id = `${key}:${clientIp(request)}`;
  const now = Date.now();
  const existing = buckets.get(id);

  if (!existing || existing.resetAt < now) {
    buckets.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  existing.count += 1;
  if (existing.count > max) {
    const retry = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }
  return null;
}

// Periodically drop expired buckets so the map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [id, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(id);
    }
  }, WINDOW_MS);
  // Don't keep the event loop alive in serverless environments.
  (timer as { unref?: () => void }).unref?.();
}
