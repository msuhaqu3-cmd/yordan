import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public images uploaded through the admin portal. Content-addressed, so they can be cached forever. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{16}$/.test(id)) return new Response("Not found", { status: 404 });
  try {
    const [m] = await q<{ mime: string; data: Buffer }>("select mime, data from media where id=$1", [id]);
    if (!m) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(m.data), {
      headers: {
        "Content-Type": m.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
