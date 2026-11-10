import "server-only";
import { q } from "./db";

export type Settings = {
  phone: string; whatsapp: string; email: string;
  address1: string; city: string; postcode: string; tiktok: string;
};

export const DEFAULTS: Settings = {
  phone: "07846 292529", whatsapp: "07846 292529", email: "yordandecoandbuilding@gmail.com",
  address1: "1 Hampton Road", city: "London", postcode: "N8 0HX", tiktok: "yordan.decoration",
};

export type Phone = { national: string; display: string; spaced: string; e164: string; wa: string };

/** Accepts 07..., +44 7..., 0044..., with any spacing. UK numbers only. */
export function parsePhone(input: string): Phone | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+44")) d = "0" + d.slice(3);
  else if (d.startsWith("0044")) d = "0" + d.slice(4);
  else if (d.startsWith("44") && d.length >= 12) d = "0" + d.slice(2);
  if (!/^0\d{9,10}$/.test(d)) return null;
  const display = d.length === 11 ? `${d.slice(0, 5)} ${d.slice(5)}` : `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  const spaced = d.length === 11 ? `${d.slice(0, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : display;
  return { national: d, display, spaced, e164: "+44" + d.slice(1), wa: "44" + d.slice(1) };
}

const SAFE = /^[A-Za-z0-9 ,.\-/]{1,80}$/;
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

/** Validates and normalises the settings form. Values are restricted to characters that are safe in HTML/JSON/URLs. */
export function validateSettings(raw: Record<string, string>): { ok: true; value: Settings } | { ok: false; error: string } {
  const phone = parsePhone(raw.phone || "");
  if (!phone) return { ok: false, error: "Enter a valid UK phone number (e.g. 07846 292529)." };
  const wa = parsePhone(raw.whatsapp || raw.phone || "");
  if (!wa) return { ok: false, error: "Enter a valid UK WhatsApp number." };
  const email = (raw.email || "").trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) || email.length > 120) return { ok: false, error: "Enter a valid email address." };
  const address1 = (raw.address1 || "").trim(), city = (raw.city || "").trim();
  if (!SAFE.test(address1)) return { ok: false, error: "Address line: use letters, numbers, spaces and , . - / only." };
  if (!SAFE.test(city)) return { ok: false, error: "Town/city: use letters, numbers, spaces and , . - / only." };
  const postcode = (raw.postcode || "").trim().toUpperCase().replace(/\s+/g, " ");
  if (!POSTCODE.test(postcode)) return { ok: false, error: "Enter a valid UK postcode." };
  const tiktok = (raw.tiktok || "").trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{1,40}$/.test(tiktok)) return { ok: false, error: "TikTok handle: letters, numbers, . and _ only." };
  return {
    ok: true,
    value: { phone: phone.display, whatsapp: wa.display, email, address1, city, postcode: postcode.includes(" ") ? postcode : postcode.replace(/(\d[A-Z]{2})$/, " $1"), tiktok },
  };
}

export async function loadSettings(): Promise<Settings> {
  const rows = await q<{ key: string; value: string }>("select key, value from settings where key = any($1)", [Object.keys(DEFAULTS)]);
  const s: Settings = { ...DEFAULTS };
  for (const r of rows) (s as Record<string, string>)[r.key] = r.value;
  return s;
}

export async function saveSettings(s: Settings, userId: string) {
  for (const [k, v] of Object.entries(s))
    await q(
      "insert into settings(key,value,updated_by) values($1,$2,$3) on conflict(key) do update set value=$2, updated_at=now(), updated_by=$3",
      [k, v, userId],
    );
}

/** Template variables used as {{NAME}} in the page content. */
export function buildVars(s: Settings): Record<string, string> {
  const p = parsePhone(s.phone) ?? parsePhone(DEFAULTS.phone)!;
  const w = parsePhone(s.whatsapp) ?? p;
  return {
    PHONE: p.display, PHONE_SPACED: p.spaced, TEL: p.e164, WA: w.wa, EMAIL: s.email,
    ADDR1: s.address1, CITY: s.city, POSTCODE: s.postcode,
    ADDR_FULL: `${s.address1}, ${s.city} ${s.postcode}`,
    ADDR_QUERY: [s.address1, s.city, s.postcode].join(" ").trim().replace(/[ ,]+/g, "+"),
    TIKTOK: s.tiktok,
  };
}

export const applyTokens = (text: string, vars: Record<string, string>) =>
  text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
