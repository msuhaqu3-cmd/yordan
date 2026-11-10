import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const scryptAsync = (pw: string, salt: Buffer, len: number, opts: ScryptOptions) =>
  new Promise<Buffer>((res, rej) => scrypt(pw, salt, len, opts, (e, k) => (e ? rej(e) : res(k))));

const N = 1 << 15, R = 8, P = 1;

/** scrypt (memory-hard). Stored as scrypt$N$r$p$salt$hash. */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(pw, salt, 64, { N, r: R, p: P, maxmem: 128 * N * R * 2 });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, n, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scryptAsync(pw, Buffer.from(salt, "base64"), expected.length, {
    N: +n, r: +r, p: +p, maxmem: 128 * +n * +r * 2,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

let dummy: Promise<string> | undefined;
/** Used so unknown emails cost the same time as real ones (no user enumeration by timing). */
export const dummyHash = () => (dummy ??= hashPassword("not-a-real-password-" + randomBytes(8).toString("hex")));

const COMMON = ["password", "12345678", "123456789", "qwertyuiop", "letmein", "welcome", "admin", "iloveyou", "yordan", "decorations", "building"];

/** Returns an error message, or "" when the password is acceptable. */
export function passwordProblem(pw: string, email = ""): string {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (pw.length > 128) return "Password is too long (max 128).";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Include at least one letter and one number.";
  const low = pw.toLowerCase();
  if (COMMON.some((c) => low.includes(c))) return "That password is too easy to guess. Choose something less common.";
  const local = email.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && low.includes(local)) return "Password must not contain your email name.";
  return "";
}

export function generatePassword(): string {
  const a = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = randomBytes(14);
  let s = "";
  for (const x of b) s += a[x % a.length];
  return s.slice(0, 5) + "-" + s.slice(5, 10) + "-" + s.slice(10) + "7";
}
