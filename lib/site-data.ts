import "server-only";
import { cache } from "react";
import { dbConfigured, q } from "./db";
import { DEFAULTS, buildVars, loadSettings, type Settings } from "./settings";
import { APP_SLOTS, WEB_SLOTS, webKey } from "./slots";

export type SiteData = {
  settings: Settings;
  vars: Record<string, string>;
  /** web image path (no leading slash) -> replacement URL */
  webMedia: Record<string, string>;
  /** app slot key -> replacement URL */
  appMedia: Record<string, string>;
};

const defaults = (): SiteData => ({ settings: DEFAULTS, vars: buildVars(DEFAULTS), webMedia: {}, appMedia: {} });

/**
 * Content for the public pages. With no database configured the original content is used.
 * If the database is configured but fails at runtime we throw, so Next keeps serving the last good page
 * instead of silently reverting to defaults. During `next build` we fall back to defaults instead of failing.
 */
export const getSiteData = cache(async function (): Promise<SiteData> {
  if (!dbConfigured()) return defaults();
  try {
    const [settings, slots] = await Promise.all([
      loadSettings(),
      q<{ slot: string; media_id: string }>("select slot, media_id from media_slots"),
    ]);
    const bySlot = new Map(slots.map((r) => [r.slot, `/media/${r.media_id}`]));
    const webMedia: Record<string, string> = {};
    for (const s of WEB_SLOTS) {
      const u = bySlot.get(webKey(s.path));
      if (u) webMedia[s.path] = u;
    }
    const appMedia: Record<string, string> = {};
    for (const s of APP_SLOTS) {
      const u = bySlot.get(s.key);
      if (u) appMedia[s.key] = u;
    }
    return { settings, vars: buildVars(settings), webMedia, appMedia };
  } catch (e) {
    if (process.env.NEXT_PHASE === "phase-production-build") return defaults();
    throw e;
  }
});

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Swaps overridden image paths inside the page HTML. */
export function applyWebMedia(html: string, media: Record<string, string>): string {
  let out = html;
  for (const [path, url] of Object.entries(media)) {
    out = out.replace(new RegExp(`(["'(=\\s])/?${esc(path)}(?![\\w.-])`, "g"), (_m, pre) => pre + url);
  }
  return out;
}

/** CSS that re-points the :root image variables for overridden images. */
export function mediaCss(media: Record<string, string>): string {
  const decl: string[] = [];
  for (const s of WEB_SLOTS) if (media[s.path]) for (const v of s.cssVars) decl.push(`${v}:url(${media[s.path]})`);
  return decl.length ? `:root{${decl.join(";")}}` : "";
}

/** JSON for window.__SITE__ (escaped so it can never close the script tag). */
/** Each page only receives what its own script needs: the website gets no app-media links and vice versa. */
export function clientConfig(d: SiteData, page: "site" | "app"): string {
  const cfg: Record<string, unknown> = { phone: d.vars.PHONE, phoneSpaced: d.vars.PHONE_SPACED, tel: d.vars.TEL, wa: d.vars.WA, email: d.vars.EMAIL };
  if (page === "app") cfg.media = d.appMedia;
  return "window.__SITE__=" + JSON.stringify(cfg).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028|\u2029/g, "");
}
