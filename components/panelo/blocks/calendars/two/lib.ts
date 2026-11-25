import type { Tone } from "./data";

/* ----------------------------- Colour and time ------------------------------ */

/** A theme tone as a CSS colour. `pink` is a magenta (violet mixed with red); `neutral` follows the text colour. */
export const tone = (t: Tone) =>
  t === "neutral"
    ? "color-mix(in oklch, var(--foreground) 40%, var(--card))"
    : t === "pink"
      ? "color-mix(in oklch, var(--tone-violet-solid) 55%, var(--destructive))"
      : `var(--tone-${t}-solid)`;
/** The soft fill behind an appointment. */
export const tint = (t: Tone, amount = 18) =>
  `color-mix(in oklch, ${tone(t)} ${t === "neutral" ? amount * 0.6 : amount}%, var(--card))`;
/** An appointment's fill. Violet and green need more of the tone to read as strongly as the rest. */
export const fill = (t: Tone) =>
  tint(t, t === "violet" ? 34 : t === "green" ? 30 : 22);
/** The darker accent: an appointment's left edge and its selected ring. */
export const accent = (t: Tone) =>
  `color-mix(in oklch, ${tone(t)} 80%, var(--foreground))`;

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
export const startOfWeek = (d: Date) =>
  addDays(startOfDay(d), -((d.getDay() + 6) % 7));
export const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();
export const at = (day: Date, minutes: number) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes);
export const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  d.toLocaleString("en-US", o);

/** "10:00 AM". */
export const clock = (d: Date) =>
  fmt(d, { hour: "numeric", minute: "2-digit" });
/**
 * A range the way people read it. Compact (blocks) shares the meridiem and drops ":00": "10 – 10:30 AM",
 * "11 AM – 1 PM". Full spells both ends: "10:00 AM – 10:30 AM".
 */
export function range(start: Date, end: Date, compact = false) {
  if (!compact) return `${clock(start)} – ${clock(end)}`;
  const part = (d: Date) =>
    fmt(
      d,
      d.getMinutes()
        ? { hour: "numeric", minute: "2-digit" }
        : { hour: "numeric" },
    );
  const sameHalf = start.getHours() < 12 === end.getHours() < 12;
  return sameHalf
    ? `${part(start).replace(/ [AP]M$/, "")} – ${part(end)}`
    : `${part(start)} – ${part(end)}`;
}
/** "30 min", "1 hr", "1 hr 15 min". */
export function duration(minutes: number) {
  const h = Math.floor(minutes / 60);
  return [h ? `${h} hr` : "", minutes % 60 ? `${minutes % 60} min` : ""]
    .filter(Boolean)
    .join(" ");
}
export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Side-by-side lanes for overlapping appointments in one column. */
export function lanes<T extends { id: string; start: Date; end: Date }>(
  items: T[],
) {
  const sorted = [...items].sort(
    (a, b) => +a.start - +b.start || +b.end - +a.end,
  );
  const out = new Map<string, { lane: number; of: number }>();
  let cluster: T[] = [];
  let clusterEnd = 0;
  const flush = () => {
    const ends: number[] = [];
    const placed = cluster.map((e) => {
      let lane = ends.findIndex((end) => end <= +e.start);
      if (lane < 0) lane = ends.length;
      ends[lane] = +e.end;
      return [e.id, lane] as const;
    });
    for (const [id, lane] of placed) out.set(id, { lane, of: ends.length });
    cluster = [];
  };
  for (const e of sorted) {
    if (cluster.length && +e.start >= clusterEnd) flush();
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, +e.end);
  }
  if (cluster.length) flush();
  return out;
}
