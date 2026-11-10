import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { audit, sameOrigin } from "@/lib/security";
import { VALID_SLOT } from "@/lib/slots";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;
const json = (o: object, status = 200) => NextResponse.json(o, { status, headers: { "Cache-Control": "no-store" } });

function sniff(b: Buffer): boolean {
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP";
  return jpeg || png || webp;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin" }, 403);
  const user = await currentUser();
  if (!user || user.must_change_password) return json({ error: "Not signed in" }, 401);
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "Invalid upload" }, 400); }
  const slot = String(form.get("slot") || "");
  const file = form.get("file");
  if (!VALID_SLOT(slot)) return json({ error: "Unknown image slot" }, 400);
  if (!(file instanceof File)) return json({ error: "No file" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "Image is too large (max 4 MB)." }, 413);
  const raw = Buffer.from(await file.arrayBuffer());
  if (!sniff(raw)) return json({ error: "Only JPG, PNG or WebP images are allowed." }, 415);
  let out: Buffer, info: OutputInfo;
  try {
    // Re-encode: strips metadata (e.g. GPS), fixes orientation, caps size.
    const r = await sharp(raw, { limitInputPixels: 60_000_000 }).rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    out = r.data; info = r.info;
  } catch { return json({ error: "That file could not be read as an image." }, 400); }
  const id = createHash("sha256").update(out).digest("hex").slice(0, 16);
  await q(
    "insert into media(id,mime,data,bytes,width,height,original_name,created_by) values($1,'image/webp',$2,$3,$4,$5,$6,$7) on conflict(id) do nothing",
    [id, out, out.length, info.width, info.height, file.name.slice(0, 120), user.id],
  );
  await q(
    "insert into media_slots(slot,media_id,updated_by) values($1,$2,$3) on conflict(slot) do update set media_id=$2, updated_at=now(), updated_by=$3",
    [slot, id, user.id],
  );
  await q("delete from media where created_at < now() - interval '1 day' and id not in (select media_id from media_slots)");
  await audit(user.id, "media_set", slot);
  for (const p of ["/", "/app", "/offline"]) revalidatePath(p);
  return json({ ok: true, url: `/media/${id}` });
}
