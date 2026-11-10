import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { STATUSES, getEnquiry } from "@/lib/enquiries";
import { parsePhone } from "@/lib/settings";
import { fmtDateTime, toLondonInput } from "@/lib/time";
import ActionForm from "@/components/admin/action-form";
import ConfirmForm from "@/components/admin/confirm-form";
import { deleteEnquiryAction, saveEnquiryAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  const { id } = await params;
  const data = await getEnquiry(id);
  if (!data) notFound();
  const { e, events } = data;
  const ph = parsePhone(e.phone);
  const waNum = ph ? ph.wa : e.phone.replace(/\D/g, "");
  return (
    <>
      <p style={{ margin: "0 0 12px" }}><Link href="/admin/enquiries">← All enquiries</Link></p>
      <h1>{e.name}</h1>
      <p className="sub">Received {fmtDateTime(e.created_at)} · <span className={`badge b-${e.source}`}>{e.source}</span> · <span className={`badge b-${e.status}`}>{e.status}</span></p>
      <div className="grid two">
        <div className="card">
          <h2>Request</h2>
          <dl className="kv">
            <dt>Service</dt><dd>{e.service || "—"}</dd>
            <dt>Property</dt><dd>{e.property_type || "—"}</dd>
            <dt>Timing</dt><dd>{e.timing || "—"}</dd>
            <dt>Postcode</dt><dd>{e.postcode || "—"}</dd>
            <dt>Details</dt><dd style={{ whiteSpace: "pre-wrap" }}>{e.details || "—"}</dd>
            <dt>Phone</dt><dd>{e.phone}</dd>
            <dt>Email</dt><dd>{e.email || "—"}</dd>
          </dl>
          <div className="quick">
            <a className="btn small" href={`tel:${ph ? ph.e164 : e.phone}`}>Call</a>
            <a className="btn small gold" href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            {e.email && <a className="btn small ghost" href={`mailto:${e.email}`}>Email</a>}
          </div>
        </div>
        <div className="card">
          <h2>Stage &amp; appointment</h2>
          <ActionForm action={saveEnquiryAction}>
            <input type="hidden" name="id" value={e.id} />
            <label className="field"><span>Stage</span>
              <select name="status" defaultValue={e.status}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="field"><span>Appointment (UK time)</span>
              <input type="datetime-local" name="appointment" defaultValue={toLondonInput(e.appointment_at)} /></label>
            <label className="field"><span>Internal notes</span>
              <textarea name="notes" defaultValue={e.notes} maxLength={4000} /></label>
          </ActionForm>
        </div>
      </div>
      <div className="card">
        <h2>History</h2>
        {events.length === 0 ? <p className="empty" style={{ padding: 8 }}>No changes yet.</p> : (
          <ul className="timeline">
            {events.map((ev, i) => <li key={i}><b>{ev.kind}</b>: {ev.detail || ""}<br /><small>{fmtDateTime(ev.at)} · {ev.user || "—"}</small></li>)}
          </ul>
        )}
      </div>
      {me.role === "admin" && (
        <ConfirmForm action={deleteEnquiryAction} message="Delete this enquiry permanently?">
          <input type="hidden" name="id" value={e.id} />
          <button className="btn link">Delete this enquiry</button>
        </ConfirmForm>
      )}
    </>
  );
}
