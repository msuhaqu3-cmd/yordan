import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { createEnquiry, parseEnquiry, setEmailStatus } from "@/lib/enquiries";
import { allow, clientIp, hashKey, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * Records an enquiry for the admin portal. It is a COPY: customers' emails (FormSubmit), WhatsApp and SMS
 * still work exactly as before and never depend on this endpoint.
 */
export async function POST(req: Request) {
  const H = { "Cache-Control": "no-store" };
  if (!dbConfigured()) return NextResponse.json({ ok: true, stored: false }, { headers: H });
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const text = await req.text();
  if (text.length > 8000) return NextResponse.json({ ok: false }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  // Second call from the website form: only reports whether the e-mail delivery worked.
  const b = body as { ref?: unknown; email_status?: unknown };
  if (b && typeof b === "object" && b.email_status !== undefined) {
    try {
      if (await allow(`enqs:${hashKey(await clientIp())}`, 20, 600)) await setEmailStatus(String(b.ref ?? ""), b.email_status);
    } catch (err) { console.error("email status failed", err); }
    return NextResponse.json({ ok: true }, { headers: H });
  }
  const e = parseEnquiry(body);
  if (!e) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (!(await allow(`enq:${hashKey(await clientIp())}`, 10, 600))) return NextResponse.json({ ok: false }, { status: 429 });
    await createEnquiry(e);
  } catch (err) {
    console.error("enquiry record failed", err);
    return NextResponse.json({ ok: false }, { status: 503, headers: H });
  }
  return NextResponse.json({ ok: true, stored: true }, { headers: H });
}
