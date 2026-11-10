import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { allSlots } from "@/lib/slots";
import MediaSlot from "@/components/admin/media-slot";
import { resetSlotAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireUser();
  const rows = await q<{ slot: string; media_id: string }>("select slot, media_id from media_slots");
  const custom = new Map(rows.map((r) => [r.slot, `/media/${r.media_id}`]));
  const groups = new Map<string, ReturnType<typeof allSlots>>();
  for (const s of allSlots()) groups.set(s.group, [...(groups.get(s.group) ?? []), s]);
  return (
    <>
      <h1>Media</h1>
      <p className="sub">Replace any photo on the website or in the mobile app. Photos are resized automatically. Changes go live within moments. “Reset” restores the original.</p>
      {[...groups.entries()].map(([group, slots], i) => (
        <details className="grp" key={group} open={i < 2 || group.startsWith("Mobile app")}>
          <summary>{group} <small style={{ color: "var(--muted)", fontWeight: 400 }}>{slots.length} images</small></summary>
          <div className="slots">
            {slots.map((s) => (
              <MediaSlot key={s.key} slot={s.key} label={s.label} hint={s.hint} current={custom.get(s.key) ?? s.defaultUrl}
                custom={custom.has(s.key)} resetAction={resetSlotAction} />
            ))}
          </div>
        </details>
      ))}
    </>
  );
}
