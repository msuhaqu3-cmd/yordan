// Finds every editable website image (HTML <img src> and CSS variables) and writes lib/slots.generated.json.
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync(new URL("../content/home.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const norm = (p) => p.replace(/^\/+/, "");
const label = (p) =>
  norm(p).split("/").pop().replace(/\.[a-z]+$/i, "").replace(/^\d+-/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const slots = new Map();
const add = (path, patch) => {
  const p = norm(path);
  const cur = slots.get(p) ?? { path: p, cssVars: [], inHtml: false };
  slots.set(p, { ...cur, ...patch, cssVars: patch.cssVars ? [...new Set([...cur.cssVars, ...patch.cssVars])] : cur.cssVars });
};
for (const m of html.matchAll(/(?:src|data-[a-z-]+)="\/?(images\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g))"/g)) add(m[1], { inHtml: true });
for (const m of css.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*url\(\/?(images\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g))\)/g)) add(m[2], { cssVars: [m[1]] });

const group = (p) =>
  p.startsWith("images/gallery/") ? "Gallery photos" : /logo/.test(p) ? "Logo" : slotsCss.has(p) ? "Service & section images" : "Other site images";
const slotsCss = new Set([...slots.values()].filter((s) => s.cssVars.length).map((s) => s.path));
const out = [...slots.values()]
  .map((s) => ({ ...s, label: label(s.path), group: group(s.path) }))
  .sort((a, b) => a.group.localeCompare(b.group) || a.path.localeCompare(b.path));
writeFileSync(new URL("../lib/slots.generated.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log("website image slots:", out.length);
