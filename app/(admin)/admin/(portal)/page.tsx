import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { SOURCE_LABEL, STATUSES, listEnquiries, statusCounts, type Enquiry } from "@/lib/enquiries";
import { fmtDateTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireUser();
  const [counts, recent, upcoming] = await Promise.all([
    statusCounts(),
    listEnquiries({ page: 1 }).then((r) => r.rows.slice(0, 8)),
    q<Enquiry>("select * from enquiries where status='confirmed' and appointment_at >= now() order by appointment_at limit 6"),
  ]);
  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">Quote requests from the website and the mobile app.</p>
      <div className="grid stats">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} className="stat"><b>{counts[s]}</b><span>{s}</span></Link>
        ))}
      </div>
      <div className="grid two">
        <div className="card">
          <h2>Latest enquiries</h2>
          {recent.length === 0 ? <p className="empty">No enquiries yet. New quote requests will appear here.</p> : (
            <div className="tw"><table><tbody>
              {recent.map((e) => (
                <tr key={e.id}>
                  <td><Link className="row" href={`/admin/enquiries/${e.id}`}>{e.name}</Link><br /><small style={{ color: "var(--muted)" }}>{e.service || "—"} · {SOURCE_LABEL[e.source]} · {fmtDateTime(e.created_at)}</small></td>
                  <td style={{ textAlign: "right" }}><span className={`badge b-${e.status}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </div>
        <div className="card">
          <h2>Upcoming confirmed appointments</h2>
          {upcoming.length === 0 ? <p className="empty">None scheduled.</p> : (
            <div className="tw"><table><tbody>
              {upcoming.map((e) => (
                <tr key={e.id}>
                  <td><Link className="row" href={`/admin/enquiries/${e.id}`}>{e.name}</Link><br /><small style={{ color: "var(--muted)" }}>{e.postcode || ""} · {e.service || ""}</small></td>
                  <td style={{ textAlign: "right" }}>{fmtDateTime(e.appointment_at!)}</td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </div>
      </div>
    </>
  );
}
