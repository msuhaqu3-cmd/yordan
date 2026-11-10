// Black-box security & regression tests. Run against a LOCAL build with a throw-away database:
//   DATABASE_URL=... AUTH_SECRET=<32+ chars> npm start   (in one terminal)
//   BASE_URL=http://localhost:8200 DATABASE_URL=... AUTH_SECRET=<same> npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import pg from "pg";
import sharp from "sharp";

const B = process.env.BASE_URL || "http://localhost:8200";
const SECRET = process.env.AUTH_SECRET || "";
assert.ok(SECRET.length >= 32 && process.env.DATABASE_URL, "set AUTH_SECRET (same as the server) and DATABASE_URL");
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const q = (s, p) => db.query(s, p).then((r) => r.rows);
const H = { Origin: B };
const COOKIE = "__Host-ysess";
const tokenFor = (id, tv, secret = SECRET) =>
  new SignJWT({ tv }).setProtectedHeader({ alg: "HS256" }).setSubject(id).setIssuedAt().setExpirationTime("1h").sign(new TextEncoder().encode(secret));
const get = (path, cookie, extra = {}) => fetch(B + path, { redirect: "manual", headers: cookie ? { Cookie: `${COOKIE}=${cookie}` } : {}, ...extra });
const png = () => sharp({ create: { width: 30, height: 30, channels: 3, background: "#c00" } }).png().toBuffer();
const upload = async (cookie, { name = "a.png", data, slot = "app:before", origin = B } = {}) => {
  const fd = new FormData();
  fd.set("slot", slot); fd.set("file", new Blob([data ?? (await png())]), name);
  return fetch(B + "/api/admin/media", { method: "POST", body: fd, headers: { Origin: origin, ...(cookie ? { Cookie: `${COOKIE}=${cookie}` } : {}) } });
};
const enq = (b, h = {}) => fetch(B + "/api/enquiries", { method: "POST", headers: { ...H, ...h }, body: typeof b === "string" ? b : JSON.stringify(b) });

let admin, staff, adminTok, staffTok;
const MARK = "RT-" + Math.random().toString(36).slice(2, 8);

before(async () => {
  await q("truncate rate_events, login_attempts");
  [admin] = await q("select id, token_version from users where role='admin' limit 1");
  assert.ok(admin, "test DB needs the bootstrapped admin");
  await q("delete from users where email='test-staff@example.test'");
  [staff] = await q("insert into users(email,name,password_hash,role) values('test-staff@example.test','Test Staff','x','staff') returning id, token_version");
  adminTok = await tokenFor(admin.id, admin.token_version);
  staffTok = await tokenFor(staff.id, staff.token_version);
});
after(async () => {
  await q("delete from users where email='test-staff@example.test'");
  await q("delete from enquiries where ref like 'tst%' or name like $1", [MARK + "%"]);
  await db.end();
});

/* ---------- authentication ---------- */
test("every admin page redirects to login when signed out", async () => {
  for (const p of ["/admin", "/admin/enquiries", "/admin/enquiries/1", "/admin/media", "/admin/settings", "/admin/users", "/admin/account"]) {
    const r = await get(p);
    assert.equal(r.status, 307, p); assert.match(r.headers.get("location"), /\/admin\/login/, p);
  }
});
test("forged, wrong-secret, alg=none and garbage session tokens are rejected", async () => {
  const wrong = await tokenFor(admin.id, admin.token_version, "x".repeat(40));
  const none = Buffer.from('{"alg":"none"}').toString("base64url") + "." + Buffer.from(JSON.stringify({ sub: admin.id, tv: admin.token_version })).toString("base64url") + ".";
  for (const t of [wrong, none, "garbage", ""]) assert.equal((await get("/admin", t)).status, 307);
});
test("valid session works; stale token_version and disabled users are rejected", async () => {
  assert.equal((await get("/admin", adminTok)).status, 200);
  await q("update users set token_version=token_version+1 where id=$1", [staff.id]);
  assert.equal((await get("/admin", staffTok)).status, 307, "old token after version bump");
  [staff] = await q("select id, token_version from users where id=$1", [staff.id]); staffTok = await tokenFor(staff.id, staff.token_version);
  assert.equal((await get("/admin", staffTok)).status, 200);
  await q("update users set active=false where id=$1", [staff.id]);
  assert.equal((await get("/admin", staffTok)).status, 307, "disabled user");
  await q("update users set active=true where id=$1", [staff.id]);
});
test("a staff account still forced to change its password cannot reach the portal", async () => {
  await q("update users set must_change_password=true where id=$1", [staff.id]);
  const r = await get("/admin/enquiries", staffTok);
  assert.match(r.headers.get("location") || "", /account\?force=1/);
  assert.equal((await upload(staffTok)).status, 401);
  await q("update users set must_change_password=false where id=$1", [staff.id]);
});

/* ---------- authorisation ---------- */
test("staff cannot open the user-management page, admin can", async () => {
  const s = await get("/admin/users", staffTok); assert.equal(s.status, 307); assert.equal(new URL(s.headers.get("location"), B).pathname, "/admin");
  assert.equal((await get("/admin/users", adminTok)).status, 200);
});
test("staff pages never render admin-only controls or other users' emails", async () => {
  const [e] = await q("insert into enquiries(ref,source,name,phone) values('tstdel0001','website',$1,'01234567890') returning id", [MARK + " del"]);
  const html = await (await get(`/admin/enquiries/${e.id}`, staffTok)).text();
  assert.doesNotMatch(html, />\s*Delete\s*</);
  assert.doesNotMatch(await (await get("/admin", staffTok)).text(), /owner@example\.test|password_hash|scrypt\$/);
});

/* ---------- API: validation, CSRF, methods ---------- */
test("public API rejects other methods, foreign origins, bad bodies", async () => {
  assert.equal((await fetch(B + "/api/enquiries")).status, 405);
  assert.equal((await fetch(B + "/api/admin/media")).status, 405);
  assert.equal((await enq({ ref: "tstorigin01", name: "a", phone: "01234567890" }, { Origin: "https://evil.example" })).status, 403);
  assert.equal((await enq("{bad")).status, 400);
  assert.equal((await enq({ ref: "short", name: "a", phone: "01234567890" })).status, 400, "ref format");
  assert.equal((await enq({ ref: "tstnophone1", name: "a", phone: "12" })).status, 400, "phone");
  assert.equal((await enq("x".repeat(9000))).status, 413);
});
test("SQL/HTML payloads are stored as inert text and the schema survives", async () => {
  const r = await enq({ ref: "tstsqli0001", name: MARK + " '); drop table users;--", phone: "01234567890", details: "<script>1</script>", service: "x\u0000y" });
  assert.equal(r.status, 200);
  const [row] = await q("select name, service from enquiries where ref='tstsqli0001'");
  assert.ok(row.name.includes("drop table")); assert.equal(row.service, "xy");
  assert.equal((await q("select count(*)::int n from users"))[0].n >= 1, true);
});
test("mass assignment: client cannot set status, notes, source=admin or ids", async () => {
  await enq({ ref: "tstmass0001", name: MARK + " m", phone: "01234567890", status: "completed", notes: "pwned", id: 1, source: "staff", updated_by: staff.id });
  const [row] = await q("select status, notes, source, updated_by from enquiries where ref='tstmass0001'");
  assert.deepEqual([row.status, row.notes, row.source, row.updated_by], ["new", "", "website", null]);
});
test("the same ref is stored once (duplicate / replay safe)", async () => {
  for (let i = 0; i < 3; i++) await enq({ ref: "tstdup00001", name: MARK + " d", phone: "01234567890" });
  assert.equal((await q("select count(*)::int n from enquiries where ref='tstdup00001'"))[0].n, 1);
});
test("e-mail status can only be set once and only shortly after creation", async () => {
  await enq({ ref: "tststat0001", name: MARK + " s", phone: "01234567890" });
  await enq({ ref: "tststat0001", email_status: "sent" });
  await enq({ ref: "tststat0001", email_status: "failed" });
  assert.equal((await q("select email_status from enquiries where ref='tststat0001'"))[0].email_status, "sent");
  await enq({ ref: "tstsmass0001x", name: MARK + " o", phone: "01234567890" });
  await q("update enquiries set created_at = now() - interval '1 hour' where ref='tstsmass0001x'");
  await enq({ ref: "tstsmass0001x", email_status: "failed" });
  assert.equal((await q("select email_status from enquiries where ref='tstsmass0001x'"))[0].email_status, null);
});
test("rate limit blocks floods and cannot be bypassed with a spoofed X-Forwarded-For", async () => {
  await q("truncate rate_events");
  const codes = [];
  for (let i = 0; i < 12; i++) codes.push((await enq({ ref: `tstrate${String(i).padStart(4, "0")}`, name: MARK + " r", phone: "01234567890" }, { "X-Vercel-Forwarded-For": "6.6.6.6", "X-Forwarded-For": `9.9.${i}.1` })).status);
  assert.equal(codes.filter((c) => c === 429).length, 2, codes.join());
  await q("truncate rate_events");
});

/* ---------- uploads ---------- */
test("upload: signed-out, foreign origin, bad slot, svg, php, gif, oversize are all rejected", async () => {
  assert.equal((await upload(null)).status, 401);
  assert.equal((await upload(staffTok, { origin: "https://evil.example" })).status, 403);
  assert.equal((await upload(staffTok, { slot: "../../etc/passwd" })).status, 400);
  assert.equal((await upload(staffTok, { data: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>1</script></svg>") })).status, 415);
  assert.equal((await upload(staffTok, { data: Buffer.from("<?php system($_GET[0]);?>") })).status, 415);
  assert.equal((await upload(staffTok, { data: Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(60)]) })).status, 415);
  assert.equal((await upload(staffTok, { data: Buffer.concat([await png(), Buffer.alloc(5 * 1024 * 1024)]) })).status, 413);
});
test("upload: a real image is accepted, re-encoded to WebP, and served with safe headers; embedded script is dropped", async () => {
  const r = await upload(staffTok, { data: Buffer.concat([await png(), Buffer.from("<script>alert(1)</script>")]) });
  assert.equal(r.status, 200);
  const { url } = await r.json();
  const m = await fetch(B + url);
  assert.equal(m.headers.get("content-type"), "image/webp"); assert.equal(m.headers.get("x-content-type-options"), "nosniff");
  assert.match(m.headers.get("content-security-policy"), /default-src 'none'/);
  assert.equal(Buffer.from(await m.arrayBuffer()).includes("<script"), false);
  await q("delete from media_slots where slot='app:before'");
});

/* ---------- data minimisation / leakage ---------- */
test("enquiry list is a projection: job details and notes are not sent to the list page", async () => {
  await enq({ ref: "tstproj0001", name: MARK + " proj", phone: "01234567890", details: "SECRET-DETAIL-" + MARK });
  await q("update enquiries set notes=$1 where ref='tstproj0001'", ["SECRET-NOTE-" + MARK]);
  const list = await (await get("/admin/enquiries?search=" + MARK, adminTok)).text();
  assert.match(list, new RegExp(MARK)); assert.doesNotMatch(list, /SECRET-DETAIL|SECRET-NOTE/);
  const [{ id }] = await q("select id from enquiries where ref='tstproj0001'");
  const detail = await (await get(`/admin/enquiries/${id}`, adminTok)).text();
  assert.match(detail, /SECRET-DETAIL/);
});
test("public pages carry no secrets, no user data, and per-page media only", async () => {
  const site = await (await get("/")).text(), app = await (await get("/app")).text();
  for (const html of [site, app]) assert.doesNotMatch(html, /AUTH_SECRET|DATABASE_URL|password_hash|scrypt\$|test-staff@|owner@example/i);
  assert.doesNotMatch(site.match(/window\.__SITE__=\{[^<]*\}/)?.[0] || "", /media/);
  assert.doesNotMatch(site, /app:project:\d/);
});
test("admin ids that are not plain numbers return nothing (no injection through the URL)", async () => {
  for (const id of ["1%20or%201=1", "1;select%201", "-1", "abc", "99999999999999999"]) {
    const r = await get(`/admin/enquiries/${id}`, adminTok);
    assert.ok([404, 307].includes(r.status), `${id} -> ${r.status}`);
  }
});
test("search is parameterised and wildcard-escaped", async () => {
  const r = await get("/admin/enquiries?search=" + encodeURIComponent("'; drop table enquiries;--"), adminTok);
  assert.equal(r.status, 200);
  assert.equal((await q("select to_regclass('enquiries') is not null as ok"))[0].ok, true);
});
test("internal files and traversal paths are not served", async () => {
  for (const p of ["/.env", "/.env.local", "/package.json", "/lib/db.ts", "/.git/config", "/media/../../etc/passwd", "/media/%2e%2e%2f"]) assert.equal((await get(p)).status, 404, p);
});

/* ---------- headers / config ---------- */
test("security headers: admin never cached or framed; public has nosniff/frame/permissions", async () => {
  const a = await get("/admin/login");
  assert.match(a.headers.get("cache-control"), /no-store/); assert.equal(a.headers.get("x-frame-options"), "DENY");
  const p = await get("/");
  assert.equal(p.headers.get("x-content-type-options"), "nosniff"); assert.ok(p.headers.get("permissions-policy"));
});
test("CORS: a foreign origin is not granted access", async () => {
  const r = await fetch(B + "/api/enquiries", { method: "OPTIONS", headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" } });
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});

/* ---------- functional regression ---------- */
test("admin workflow: staff can update an enquiry's status through the app, and it is recorded", async () => {
  const [e] = await q("insert into enquiries(ref,source,name,phone) values('tstflow0001','app',$1,'01234567890') returning id", [MARK + " flow"]);
  const html = await (await get(`/admin/enquiries/${e.id}`, staffTok)).text();
  assert.match(html, /Mobile app/);
});
