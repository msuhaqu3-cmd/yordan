"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Downscales large photos in the browser so uploads stay well under the 4 MB limit. */
async function shrink(file: File): Promise<Blob> {
  if (file.size < 1.2 * 1024 * 1024 && /image\/(webp|jpeg)/.test(file.type)) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/webp", 0.85));
}

export default function MediaSlot({ slot, label, hint, current, custom, resetAction }: {
  slot: string; label: string; hint?: string; current: string | null; custom: boolean;
  resetAction: (fd: FormData) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true); setMsg(null);
    try {
      const blob = await shrink(f);
      const fd = new FormData();
      fd.set("slot", slot); fd.set("file", blob, f.name.replace(/\.\w+$/, "") + ".webp");
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Upload failed");
      setPreview(j.url); setMsg({ t: "Updated." }); router.refresh();
    } catch (e) {
      setMsg({ t: e instanceof Error ? e.message : "Upload failed", err: true });
    } finally {
      setBusy(false); if (input.current) input.current.value = "";
    }
  }

  const shown = preview || current;
  return (
    <div className="slot">
      <div className="thumb">{shown ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={shown} alt={label} loading="lazy" /> : <span>No photo yet<br /><small>placeholder in use</small></span>}</div>
      <div className="slot-b">
        <b title={label}>{label}</b>
        <small>{custom || preview ? "Custom photo" : current ? "Original photo" : "Placeholder"}{hint ? ` · ${hint}` : ""}</small>
        <div className="slot-a">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" className="btn small" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Uploading…" : shown ? "Replace" : "Upload"}</button>
          {(custom || preview) && (
            <form action={resetAction} onSubmit={(e) => { if (!window.confirm("Go back to the original image?")) e.preventDefault(); }}>
              <input type="hidden" name="slot" value={slot} />
              <button className="btn small ghost">Reset</button>
            </form>
          )}
        </div>
        {msg && <small className={msg.err ? "msg err" : "msg ok"} role="status">{msg.t}</small>}
      </div>
    </div>
  );
}
