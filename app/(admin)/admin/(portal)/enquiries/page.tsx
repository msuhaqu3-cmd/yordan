import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SOURCE_LABEL, STATUSES, listEnquiries } from "@/lib/enquiries";
import { fmtDateTime } from "@/lib/time";

export const dynamic = "force-dynamic";

type SP = Promise<{ status?: string; source?: string; q?: string; page?: string }>;

export default async function Enquiries({ searchParams }: { searchParams: SP }) {
  await requireUser();
  const sp = await searchParams;
  const r = await listEnquiries({ status: sp.status, source: sp.source, search: (sp.q || "").slice(0, 80), page: Number(sp.page) || 1 });
  const href = (page: number) => {
    const u = new URLSearchParams();
    if (sp.status) u.set("status", sp.status);
    if (sp.source) u.set("source", sp.source);
    if (sp.q) u.set("q", sp.q);
    u.set("page", String(page));
    return `/admin/enquiries?${u}`;
  };
  return (
    <>
      <h1>Enquiries</h1>
      <p className="sub">{r.total} found. Click a name to update its stage.</p>
      <form className="filters" method="get">
        <label className="field grow"><span>Search</span><input name="q" defaultValue={sp.q || ""} placeholder="Name, phone, postcode, service" maxLength={80} /></label>
        <label className="field"><span>Stage</span>
          <select name="status" defaultValue={sp.status || ""}><option value="">All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="field"><span>Source</span>
          <select name="source" defaultValue={sp.source || ""}><option value="">All</option><option value="website">Website</option><option value="app">Mobile app</option></select></label>
        <button className="btn">Filter</button>
        <Link className="btn ghost" href="/admin/enquiries">Clear</Link>
      </form>
      <div className="card tw" style={{ padding: 0 }}>
        {r.rows.length === 0 ? <p className="empty">Nothing here yet.</p> : (
          <table>
            <thead><tr><th>Received</th><th>Customer</th><th>Service</th><th>Postcode</th><th>Source</th><th>Stage</th></tr></thead>
            <tbody>
              {r.rows.map((e) => (
                <tr key={e.id} className="link">
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDateTime(e.created_at)}</td>
                  <td><Link className="row" href={`/admin/enquiries/${e.id}`}>{e.name}</Link><br /><small style={{ color: "var(--muted)" }}>{e.phone}</small></td>
                  <td>{e.service || "—"}</td><td>{e.postcode || "—"}</td>
                  <td><span className={`badge b-${e.source}`}>{SOURCE_LABEL[e.source]}</span>{e.email_status === "failed" && <><br /><small className="warn" title="The e-mail copy of this enquiry did not go through. The enquiry is safe here.">Email not sent</small></>}</td>
                  <td><span className={`badge b-${e.status}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {r.pages > 1 && (
        <div className="pager">
          {r.page > 1 && <Link className="btn ghost small" href={href(r.page - 1)}>← Newer</Link>}
          <span>Page {r.page} of {r.pages}</span>
          {r.page < r.pages && <Link className="btn ghost small" href={href(r.page + 1)}>Older →</Link>}
        </div>
      )}
    </>
  );
}
