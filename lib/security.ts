import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { q, tx } from "./db";

export async function clientIp(): Promise<string> {
  const h = await headers();
  const platform = h.get("x-vercel-forwarded-for")?.split(",")[0];
  // On Vercel only the platform header is trusted: x-forwarded-for / x-real-ip can carry client-supplied values,
  // so they are never used there. A request without it falls into one shared (strictest) bucket.
  if (process.env.VERCEL) return (platform || "unknown").trim();
  // Anywhere else (local testing) there is no trusted proxy, so fall back to the usual headers.
  return (platform || h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
}

/** IPs are only ever stored hashed (salted with the auth secret). */
export const hashKey = (v: string) =>
  createHash("sha256").update((process.env.AUTH_SECRET || "") + "|" + v).digest("hex").slice(0, 32);

/** CSRF guard for route handlers: the Origin header must match this host. */
export function sameOrigin(req: Request): boolean {
  const o = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!o || !host) return false;
  try {
    return new URL(o).host === host;
  } catch {
    return false;
  }
}

/** Seconds a key is still locked for (0 = not locked). */
export async function lockedFor(keys: string[]): Promise<number> {
  const rows = await q<{ s: number }>(
    "select coalesce(max(extract(epoch from (locked_until - now()))),0)::int as s from login_attempts where key = any($1) and locked_until > now()",
    [keys],
  );
  return Math.max(0, rows[0]?.s ?? 0);
}

/**
 * Counts an attempt BEFORE the password is checked, in one atomic statement, and returns the number of
 * attempts in the current window. Parallel guesses each get their own number, so only the first `max`
 * are ever checked; the caller refuses anything above `max`. A successful login clears the counter.
 */
export async function reserveAttempt(key: string, max: number, windowSec: number, lockSec: number): Promise<number> {
  const [r] = await q<{ fails: number }>(
    `insert into login_attempts(key,fails,first_at,locked_until)
     values($1::text, 1, now(), case when 1 >= $2::int then now() + make_interval(secs => $4::float8) end)
     on conflict(key) do update set
       fails = case when login_attempts.first_at < now() - make_interval(secs => $3::float8) then 1 else login_attempts.fails + 1 end,
       first_at = case when login_attempts.first_at < now() - make_interval(secs => $3::float8) then now() else login_attempts.first_at end,
       locked_until = case when (case when login_attempts.first_at < now() - make_interval(secs => $3::float8) then 1 else login_attempts.fails + 1 end) >= $2::int
                           then now() + make_interval(secs => $4::float8) else null end
     returning fails`,
    [key, max, windowSec, lockSec],
  );
  return r?.fails ?? max + 1;
}

export const clearFails = (key: string) => q("delete from login_attempts where key=$1", [key]);

/**
 * Sliding-window limiter for public endpoints. Returns true when the request is allowed.
 * Count and insert run under a per-key advisory lock, so parallel requests cannot slip past the limit.
 */
export async function allow(key: string, max: number, windowSec: number): Promise<boolean> {
  if (Math.random() < 0.05) await q("delete from rate_events where at < now() - interval '1 day'"); // housekeeping, not on every request
  return tx(async (run) => {
    await run("select pg_advisory_xact_lock(hashtext($1))", [key]);
    const [r] = await run<{ n: number }>(
      "select count(*)::int as n from rate_events where key=$1 and at > now() - make_interval(secs => $2::float8)",
      [key, windowSec],
    );
    if ((r?.n ?? 0) >= max) return false;
    await run("insert into rate_events(key) values($1)", [key]);
    return true;
  });
}

export const audit = async (userId: string | null, action: string, target?: string) => {
  if (Math.random() < 0.01) await q("delete from audit_log where at < now() - interval '365 days'").catch(() => {}); // keep one year
  return q("insert into audit_log(user_id,action,target) values($1,$2,$3)", [userId, action, target ?? null]).catch(() => {});
};
