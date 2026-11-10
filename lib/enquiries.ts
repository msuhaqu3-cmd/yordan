import "server-only";
import { q, tx } from "./db";
import { fromLondonInput } from "./time";

export const STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export type Status = (typeof STATUSES)[number];

export type Enquiry = {
  id: string; ref: string | null; source: "website" | "app"; created_at: string;
  service: string | null; property_type: string | null; timing: string | null; postcode: string | null; details: string | null;
  name: string; phone: string; email: string | null; status: Status;
  appointment_at: string | null; notes: string; updated_at: string; updated_by: string | null;
  email_status: "sent" | "failed" | null;
};

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "";

export type NewEnquiry = {
  ref: string; source: "website" | "app"; service: string; property_type: string; timing: string;
  postcode: string; details: string; name: string; phone: string; email: string;
};

/** Validates untrusted input from the public forms. Returns null when it is not a real enquiry. */
export function parseEnquiry(body: unknown): NewEnquiry | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const e: NewEnquiry = {
    ref: clean(b.ref, 64), source: b.source === "app" ? "app" : "website",
    service: clean(b.service, 100), property_type: clean(b.property_type, 60), timing: clean(b.timing, 40),
    postcode: clean(b.postcode, 12).toUpperCase(), details: clean(b.details, 2000),
    name: clean(b.name, 100), phone: clean(b.phone, 30), email: clean(b.email, 120).toLowerCase(),
  };
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(e.ref)) return null;
  if (!e.name || e.phone.replace(/\D/g, "").length < 7) return null;
  if (e.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(e.email)) e.email = "";
  return e;
}

export async function createEnquiry(e: NewEnquiry) {
  await q(
    `insert into enquiries(ref,source,service,property_type,timing,postcode,details,name,phone,email)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict(ref) do nothing`,
    [e.ref, e.source, e.service, e.property_type, e.timing, e.postcode, e.details, e.name, e.phone, e.email || null],
  );
}

/** Website forms report whether the FormSubmit e-mail went out, so the team can spot a failed delivery. */
export async function setEmailStatus(ref: string, status: unknown) {
  if ((status !== "sent" && status !== "failed") || !/^[A-Za-z0-9_-]{8,64}$/.test(ref)) return;
  await q("update enquiries set email_status=$2 where ref=$1 and source='website' and email_status is null and created_at > now() - interval '15 minutes'", [ref, status]);
}

export const SOURCE_LABEL: Record<string, string> = { website: "Website", app: "Mobile app" };

export type Filters = { status?: string; source?: string; search?: string; page?: number };
export const PAGE_SIZE = 25;

export async function listEnquiries(f: Filters) {
  const where: string[] = [], p: unknown[] = [];
  if (f.status && (STATUSES as readonly string[]).includes(f.status)) { p.push(f.status); where.push(`status=$${p.length}`); }
  if (f.source === "website" || f.source === "app") { p.push(f.source); where.push(`source=$${p.length}`); }
  if (f.search) {
    p.push(`%${f.search.replace(/[%_\\]/g, "\\$&")}%`);
    where.push(`(name ilike $${p.length} or phone ilike $${p.length} or postcode ilike $${p.length} or email ilike $${p.length} or service ilike $${p.length})`);
  }
  const w = where.length ? "where " + where.join(" and ") : "";
  const [{ n }] = await q<{ n: number }>(`select count(*)::int as n from enquiries ${w}`, p);
  const page = Math.max(1, f.page || 1);
  const rows = await q<Enquiry>(`select * from enquiries ${w} order by created_at desc limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`, p);
  return { rows, total: n, page, pages: Math.max(1, Math.ceil(n / PAGE_SIZE)) };
}

export async function statusCounts(): Promise<Record<Status, number>> {
  const rows = await q<{ status: Status; n: number }>("select status, count(*)::int as n from enquiries group by status");
  const out = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function getEnquiry(id: string) {
  if (!/^\d{1,12}$/.test(id)) return null;
  const [e] = await q<Enquiry>("select * from enquiries where id=$1", [id]);
  if (!e) return null;
  const events = await q<{ at: string; kind: string; detail: string | null; user: string | null }>(
    "select ev.at, ev.kind, ev.detail, u.name as user from enquiry_events ev left join users u on u.id=ev.user_id where ev.enquiry_id=$1 order by ev.at desc",
    [id],
  );
  return { e, events };
}

export async function saveEnquiry(id: string, userId: string, v: { status: string; appointment: string; notes: string }): Promise<string> {
  if (!(STATUSES as readonly string[]).includes(v.status)) return "Invalid status.";
  let appt: string | null = null;
  if (v.appointment) {
    const d = fromLondonInput(v.appointment);
    if (!d) return "Invalid appointment date.";
    appt = d.toISOString();
  }
  const notes = clean(v.notes, 4000);
  return tx(async (run) => {
    const [cur] = await run<Enquiry>("select * from enquiries where id=$1 for update", [id]);
    if (!cur) return "Enquiry not found.";
    await run("update enquiries set status=$2, appointment_at=$3, notes=$4, updated_at=now(), updated_by=$5 where id=$1", [id, v.status, appt, notes, userId]);
    if (cur.status !== v.status)
      await run("insert into enquiry_events(enquiry_id,user_id,kind,detail) values($1,$2,'status',$3)", [id, userId, `${cur.status} → ${v.status}`]);
    if ((cur.appointment_at ? new Date(cur.appointment_at).toISOString() : null) !== appt)
      await run("insert into enquiry_events(enquiry_id,user_id,kind,detail) values($1,$2,'appointment',$3)", [id, userId, appt ?? "cleared"]);
    if (cur.notes !== notes) await run("insert into enquiry_events(enquiry_id,user_id,kind,detail) values($1,$2,'notes','updated')", [id, userId]);
    return "";
  });
}

export async function deleteEnquiry(id: string) {
  if (/^\d{1,12}$/.test(id)) await q("delete from enquiries where id=$1", [id]);
}
