import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { q, dbConfigured } from "./db";

export type User = {
  id: string; email: string; name: string; role: "admin" | "staff";
  active: boolean; must_change_password: boolean; created_at: string; last_login_at: string | null;
};

const prod = process.env.NODE_ENV === "production";
const COOKIE = prod ? "__Host-ysess" : "ysess";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export const authConfigured = () => dbConfigured() && (process.env.AUTH_SECRET || "").length >= 32;
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");

export async function startSession(userId: string, tokenVersion: number) {
  const jwt = await new SignJWT({ tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, jwt, { httpOnly: true, secure: prod, sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, secure: prod, sameSite: "lax", path: "/", maxAge: 0 });
}

/** The signed-in user (re-checked against the database every request), or null. */
export const currentUser = cache(async (): Promise<User | null> => {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const [u] = await q<User & { token_version: number }>(
      "select id,email,name,role,active,must_change_password,token_version,created_at,last_login_at from users where id=$1",
      [payload.sub],
    );
    if (!u || !u.active || u.token_version !== payload.tv) return null;
    const { token_version: _tv, ...user } = u;
    void _tv;
    return user;
  } catch {
    return null;
  }
});

export async function requireUser(opts: { allowMustChange?: boolean } = {}): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (u.must_change_password && !opts.allowMustChange) redirect("/admin/account?force=1");
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/admin");
  return u;
}
