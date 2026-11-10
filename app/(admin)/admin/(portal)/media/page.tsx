import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { allSlots } from "@/lib/slots";
import MediaSlot from "@/components/admin/media-slot";
import { resetSlotAction } from "../../actions";

export const dynamic = "force-dynamic";

type SP = Promise<{ tab?: string; show?: string }>;

export default async function MediaPage({ searchParams }: { searchParams: SP }) {
  await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === "app" ? "app" : "website";
  const onlyReplaced = sp.show === "replaced";

  const rows = await q<{ slot: string; media_id: string }>("select slot, media_id from media_slots");
  const custom = new Map(rows.map((r) => [r.slot, `/media/${r.media_id}`]));

  const all = allSlots();
  const inTab = (k: string, t: string) => (t === "app" ? k.startsWith("app:") : k.startsWith("web:"));
  const count = (t: string) => ({ total: all.filter((s) => inTab(s.key, t)).length, replaced: all.filter((s) => inTab(s.key, t) && custom.has(s.key)).length });
  const web = count("website"), app = count("app");
  const cur = tab === "app" ? app : web;

  const groups = new Map<string, typeof all>();
  for (const s of all) {
    if (!inTab(s.key, tab)) continue;
    if (onlyReplaced && !custom.has(s.key)) continue;
    const name = s.group.replace(/^(Website|Mobile app) · /, "");
    groups.set(name, [...(groups.get(name) ?? []), s]);
  }
  const url = (t: string, show?: string) => `/admin/media?tab=${t}${show ? `&show=${show}` : ""}`;

  return (
    <>
      <div className="ph">
        <h1>Media</h1>
        <p className="sub">Replace any photo on the website or in the mobile app. Photos are resized automatically and go live within a minute. “Reset” brings back the original.</p>
      </div>

      <div className="mbar">
        <nav className="seg" aria-label="Where the photo appears">
          <Link href={url("website", onlyReplaced ? "replaced" : undefined)} className={tab === "website" ? "on" : ""}>Website <em>{web.total}</em></Link>
          <Link href={url("app", onlyReplaced ? "replaced" : undefined)} className={tab === "app" ? "on" : ""}>Mobile app <em>{app.total}</em></Link>
        </nav>
        <div className="mfilter">
          <span>{cur.replaced} of {cur.total} replaced</span>
          <nav className="seg small" aria-label="Filter">
            <Link href={url(tab)} className={!onlyReplaced ? "on" : ""}>All</Link>
            <Link href={url(tab, "replaced")} className={onlyReplaced ? "on" : ""}>Replaced</Link>
          </nav>
        </div>
      </div>

      {groups.size === 0 && <div className="card"><p className="empty">No replaced photos here yet.</p></div>}
      {[...groups.entries()].map(([name, slots]) => (
        <section className="msec" key={name}>
          <header><h2>{name}</h2><span>{slots.length}</span></header>
          <div className="slots">
            {slots.map((s) => (
              <MediaSlot key={s.key} slot={s.key} label={s.label} hint={s.hint} current={custom.get(s.key) ?? s.defaultUrl}
                custom={custom.has(s.key)} resetAction={resetSlotAction} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
