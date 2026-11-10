import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { q } from "./db";

export async function clientIp(): Promise<string> {
  const h = await headers();
  // x-vercel-forwarded-for is set by the platform and cannot be spoofed by the client.
  return (h.get("x-vercel-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
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

export async function recordFail(key: string, max: number, windowSec: number, lockSec: number) {
  const [cur] = await q<{ fails: number; first_at: Date }>("select fails, first_at from login_attempts where key=$1", [key]);
  const fresh = !cur || Date.now() - new Date(cur.first_at).getTime() > windowSec * 1000;
  const fails = fresh ? 1 : cur.fails + 1;
  await q(
    `insert into login_attempts(key,fails,first_at,locked_until) values($1::text,$2::int,now(), case when $2::int >= $3::int then now() + make_interval(secs => $4::float8) end)
     on conflict(key) do update set fails=$2::int, first_at = case when $5::boolean then now() else login_attempts.first_at end,
       locked_until = case when $2::int >= $3::int then now() + make_interval(secs => $4::float8) else null end`,
    [key, fails, max, lockSec, fresh],
  );
}

export const clearFails = (key: string) => q("delete from login_attempts where key=$1", [key]);

/** Sliding-window limiter for public endpoints. Returns true when the request is allowed. */
export async function allow(key: string, max: number, windowSec: number): Promise<boolean> {
  await q("delete from rate_events where at < now() - interval '1 day'");
  const [r] = await q<{ n: number }>(
    "select count(*)::int as n from rate_events where key=$1 and at > now() - make_interval(secs => $2::float8)",
    [key, windowSec],
  );
  if ((r?.n ?? 0) >= max) return false;
  await q("insert into rate_events(key) values($1)", [key]);
  return true;
}

export const audit = (userId: string | null, action: string, target?: string) =>
  q("insert into audit_log(user_id,action,target) values($1,$2,$3)", [userId, action, target ?? null]).catch(() => {});
