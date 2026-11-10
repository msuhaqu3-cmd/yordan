const TZ = "Europe/London";

export const fmtDateTime = (d: string | Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
export const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));

function parts(d: Date) {
  const o: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d))
    o[p.type] = p.value;
  return o;
}

/** Value for <input type="datetime-local"> in UK time. */
export function toLondonInput(d: string | Date | null): string {
  if (!d) return "";
  const p = parts(new Date(d));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Parses "YYYY-MM-DDTHH:mm" entered as UK local time (handles GMT/BST). */
export function fromLondonInput(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let guess = asUtc;
  for (let i = 0; i < 2; i++) {
    const p = parts(new Date(guess));
    const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    guess += asUtc - shown;
  }
  const d = new Date(guess);
  return isNaN(d.getTime()) ? null : d;
}
