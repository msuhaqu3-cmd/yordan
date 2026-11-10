import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/db";
import { createEnquiry, parseEnquiry } from "@/lib/enquiries";
import { allow, clientIp, hashKey, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * Records an enquiry for the admin portal. It is a COPY: customers' emails (FormSubmit), WhatsApp and SMS
 * still work exactly as before and never depend on this endpoint.
 */
export async function POST(req: Request) {
  const ok = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  if (!dbConfigured()) return ok;
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const text = await req.text();
  if (text.length > 8000) return NextResponse.json({ ok: false }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const e = parseEnquiry(body);
  if (!e) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (!(await allow(`enq:${hashKey(await clientIp())}`, 10, 600))) return NextResponse.json({ ok: false }, { status: 429 });
    await createEnquiry(e);
  } catch (err) {
    console.error("enquiry record failed", err);
  }
  return ok;
}
