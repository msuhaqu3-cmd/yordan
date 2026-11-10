"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authConfigured, currentUser, endSession, requireAdmin, requireUser, startSession, type User } from "@/lib/auth";
import { q } from "@/lib/db";
import { dummyHash, hashPassword, passwordProblem, verifyPassword } from "@/lib/password";
import { audit, clearFails, clientIp, hashKey, lockedFor, recordFail } from "@/lib/security";
import { saveSettings, validateSettings } from "@/lib/settings";
import { deleteEnquiry, saveEnquiry } from "@/lib/enquiries";
import { VALID_SLOT } from "@/lib/slots";

export type ActionState = { ok?: string; error?: string };
const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const EMAIL = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

const refreshPublic = () => {
  for (const p of ["/", "/app", "/offline", "/privacy-policy", "/cookie-policy", "/terms", "/manifest.webmanifest"]) revalidatePath(p);
};

/* ---------------- authentication ---------------- */

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!authConfigured()) return { error: "The admin portal is not configured yet." };
  const email = str(fd, "email").trim().toLowerCase().slice(0, 120);
  const password = str(fd, "password").slice(0, 200);
  if (!email || !password) return { error: "Enter your email and password." };
  const ipKey = `ip:${hashKey(await clientIp())}`, emailKey = `em:${hashKey(email)}`;
  const wait = await lockedFor([ipKey, emailKey]);
  if (wait > 0) return { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` };
  const [u] = await q<User & { password_hash: string; token_version: number }>(
    "select id,email,name,role,active,must_change_password,password_hash,token_version,created_at,last_login_at from users where email=$1", [email]);
  const good = await verifyPassword(password, u ? u.password_hash : await dummyHash());
  if (!u || !good || !u.active) {
    await recordFail(emailKey, 5, 900, 900);
    await recordFail(ipKey, 25, 900, 900);
    await audit(u?.id ?? null, "login_failed", email);
    return { error: "Invalid email or password." };
  }
  await clearFails(emailKey);
  await q("update users set last_login_at=now() where id=$1", [u.id]);
  await startSession(u.id, u.token_version);
  await audit(u.id, "login");
  redirect(u.must_change_password ? "/admin/account?force=1" : "/admin");
}

export async function logoutAction() {
  const u = await currentUser();
  if (u) await audit(u.id, "logout");
  await endSession();
  redirect("/admin/login");
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser({ allowMustChange: true });
  const cur = str(fd, "current"), next = str(fd, "next"), again = str(fd, "again");
  const [row] = await q<{ password_hash: string }>("select password_hash from users where id=$1", [me.id]);
  const lock = await lockedFor([`pw:${me.id}`]);
  if (lock > 0) return { error: "Too many wrong attempts. Try again later." };
  if (!(await verifyPassword(cur, row.password_hash))) {
    await recordFail(`pw:${me.id}`, 5, 900, 900);
    return { error: "Your current password is not correct." };
  }
  if (next !== again) return { error: "The new passwords do not match." };
  if (next === cur) return { error: "Choose a password different from the current one." };
  const problem = passwordProblem(next, me.email);
  if (problem) return { error: problem };
  await clearFails(`pw:${me.id}`);
  const [r] = await q<{ token_version: number }>(
    "update users set password_hash=$2, must_change_password=false, token_version=token_version+1 where id=$1 returning token_version",
    [me.id, await hashPassword(next)]);
  await startSession(me.id, r.token_version); // keeps this browser signed in, signs out every other session
  await audit(me.id, "password_changed", me.email);
  return { ok: "Password updated. Other devices have been signed out." };
}

/* ---------------- company info ---------------- */

export async function saveSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const v = validateSettings(Object.fromEntries(["phone", "whatsapp", "email", "address1", "city", "postcode", "tiktok"].map((k) => [k, str(fd, k)])));
  if (!v.ok) return { error: v.error };
  await saveSettings(v.value, me.id);
  await audit(me.id, "settings_saved");
  refreshPublic();
  return { ok: "Saved. The website and app are updated." };
}

/* ---------------- media ---------------- */

export async function resetSlotAction(fd: FormData) {
  const me = await requireUser();
  const slot = str(fd, "slot");
  if (!VALID_SLOT(slot)) return;
  await q("delete from media_slots where slot=$1", [slot]);
  await audit(me.id, "media_reset", slot);
  refreshPublic();
  revalidatePath("/admin/media");
}

/* ---------------- enquiries ---------------- */

export async function saveEnquiryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const err = await saveEnquiry(str(fd, "id"), me.id, { status: str(fd, "status"), appointment: str(fd, "appointment"), notes: str(fd, "notes") });
  if (err) return { error: err };
  revalidatePath("/admin/enquiries"); revalidatePath("/admin");
  return { ok: "Saved." };
}

export async function deleteEnquiryAction(fd: FormData) {
  const me = await requireAdmin();
  await deleteEnquiry(str(fd, "id"));
  await audit(me.id, "enquiry_deleted", str(fd, "id"));
  redirect("/admin/enquiries");
}

/* ---------------- user management (administrator only) ---------------- */

async function staffTarget(id: string): Promise<User | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const [t] = await q<User>("select id,email,name,role,active,must_change_password,created_at,last_login_at from users where id=$1", [id]);
  // The administrator account can never be modified through these actions (not even by itself).
  return t && t.role === "staff" ? t : null;
}

export async function createUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const email = str(fd, "email").trim().toLowerCase(), name = str(fd, "name").trim().slice(0, 80), pw = str(fd, "password");
  if (!EMAIL.test(email) || email.length > 120) return { error: "Enter a valid email address." };
  if (!name) return { error: "Enter the person's name." };
  const problem = passwordProblem(pw, email);
  if (problem) return { error: problem };
  const [dup] = await q("select 1 from users where email=$1", [email]);
  if (dup) return { error: "A user with that email already exists." };
  await q("insert into users(email,name,password_hash,role,must_change_password) values($1,$2,$3,'staff',true)", [email, name, await hashPassword(pw)]);
  await audit(me.id, "user_created", email);
  revalidatePath("/admin/users");
  return { ok: `Created ${email}. Give them the temporary password; they must change it at first login.` };
}

export async function resetUserPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const t = await staffTarget(str(fd, "id"));
  if (!t) return { error: "User not found." };
  const pw = str(fd, "password"), problem = passwordProblem(pw, t.email);
  if (problem) return { error: problem };
  await q("update users set password_hash=$2, must_change_password=true, token_version=token_version+1 where id=$1", [t.id, await hashPassword(pw)]);
  await audit(me.id, "user_password_reset", t.email);
  return { ok: `Password reset for ${t.email}. They must change it at next login.` };
}

export async function setUserActiveAction(fd: FormData) {
  const me = await requireAdmin();
  const t = await staffTarget(str(fd, "id"));
  if (!t) return;
  const active = str(fd, "active") === "1";
  await q("update users set active=$2, token_version=token_version+1 where id=$1", [t.id, active]);
  await audit(me.id, active ? "user_enabled" : "user_disabled", t.email);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(fd: FormData) {
  const me = await requireAdmin();
  const t = await staffTarget(str(fd, "id"));
  if (!t) return;
  await q("delete from users where id=$1", [t.id]);
  await audit(me.id, "user_deleted", t.email);
  revalidatePath("/admin/users");
}
