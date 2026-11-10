import "server-only";
import { Pool } from "pg";
import { createHash } from "node:crypto";

/**
 * PostgreSQL access. Any Postgres works (Neon via Vercel Storage, Supabase, ...).
 * Tables are created automatically on first use (idempotent), then the first admin is bootstrapped from env.
 */
const g = globalThis as unknown as { __ypool?: Pool; __yschema?: Promise<void> };

export const dbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const dbConfigured = () => dbUrl().length > 0;

function pool(): Pool {
  if (!g.__ypool) {
    g.__ypool = new Pool({
      connectionString: dbUrl(),
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
    g.__ypool.on("error", () => {});
  }
  return g.__ypool;
}

const SCHEMA = `
create table if not exists users(
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  password_hash text not null,
  role text not null check (role in ('admin','staff')),
  active boolean not null default true,
  must_change_password boolean not null default false,
  token_version int not null default 0,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
create unique index if not exists one_admin on users(role) where role = 'admin';
create table if not exists login_attempts(
  key text primary key, fails int not null default 0,
  first_at timestamptz not null default now(), locked_until timestamptz
);
create table if not exists rate_events(key text not null, at timestamptz not null default now());
create index if not exists rate_events_key_at on rate_events(key, at);
create table if not exists settings(
  key text primary key, value text not null,
  updated_at timestamptz not null default now(), updated_by uuid
);
create table if not exists media(
  id text primary key, mime text not null, data bytea not null, bytes int not null,
  width int, height int, original_name text,
  created_at timestamptz not null default now(), created_by uuid
);
create table if not exists media_slots(
  slot text primary key, media_id text not null references media(id),
  updated_at timestamptz not null default now(), updated_by uuid
);
create table if not exists enquiries(
  id bigserial primary key, ref text unique,
  source text not null check (source in ('website','app')),
  created_at timestamptz not null default now(),
  service text, property_type text, timing text, postcode text, details text,
  name text not null, phone text not null, email text,
  status text not null default 'new' check (status in ('new','contacted','confirmed','completed','cancelled')),
  appointment_at timestamptz, notes text not null default '',
  updated_at timestamptz not null default now(), updated_by uuid
);
alter table enquiries add column if not exists email_status text check (email_status in ('sent','failed'));
create index if not exists enquiries_status_created on enquiries(status, created_at desc);
create table if not exists enquiry_events(
  id bigserial primary key, enquiry_id bigint not null references enquiries(id) on delete cascade,
  at timestamptz not null default now(), user_id uuid, kind text not null, detail text
);
create table if not exists audit_log(
  id bigserial primary key, at timestamptz not null default now(),
  user_id uuid, action text not null, target text
);
`;

async function migrate(): Promise<void> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(727001)");
    await client.query(SCHEMA);
    await bootstrapAdmin(client);
    await client.query("commit");
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

type Q = { query: (t: string, p?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };

/** Creates the single admin account from env on first run; supports one-time recovery via env. */
async function bootstrapAdmin(c: Q) {
  const { hashPassword } = await import("./password");
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || "";
  const admin = (await c.query("select id from users where role='admin'")).rows[0];
  if (!admin && email && pw.length >= 10) {
    await c.query(
      "insert into users(email,name,password_hash,role,must_change_password) values($1,$2,$3,'admin',true) on conflict do nothing",
      [email, "Owner", await hashPassword(pw)],
    );
    await c.query("insert into audit_log(action,target) values('bootstrap_admin',$1)", [email]);
    return;
  }
  // One-time recovery: set ADMIN_RECOVERY_PASSWORD, redeploy, log in, change password, then remove the variable.
  const rec = process.env.ADMIN_RECOVERY_PASSWORD || "";
  if (admin && rec.length >= 10) {
    const mark = createHash("sha256").update(rec).digest("hex");
    const done = (await c.query("select value from settings where key='recovery_applied'")).rows[0];
    if (!done || done.value !== mark) {
      await c.query(
        "update users set password_hash=$1, must_change_password=true, active=true, token_version=token_version+1 where role='admin'",
        [await hashPassword(rec)],
      );
      await c.query(
        "insert into settings(key,value) values('recovery_applied',$1) on conflict(key) do update set value=$1",
        [mark],
      );
      await c.query("insert into audit_log(action,target) values('admin_recovery',null)");
    }
  }
}

export function ensureSchema(): Promise<void> {
  if (!g.__yschema) {
    g.__yschema = migrate().catch((e) => {
      g.__yschema = undefined;
      throw e;
    });
  }
  return g.__yschema;
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const r = await pool().query(text, params);
  return r.rows as T[];
}

export async function tx<T>(fn: (run: <R = Record<string, unknown>>(t: string, p?: unknown[]) => Promise<R[]>) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await pool().connect();
  try {
    await client.query("begin");
    const out = await fn(async <R,>(t: string, p: unknown[] = []) => (await client.query(t, p)).rows as R[]);
    await client.query("commit");
    return out;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
