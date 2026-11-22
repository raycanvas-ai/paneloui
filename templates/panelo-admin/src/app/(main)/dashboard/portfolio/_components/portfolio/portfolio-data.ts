import { Factory, Landmark, Monitor, ShoppingBag, Stethoscope, Zap } from "lucide-react";
import { type SimpleIcon, siApple, siGoogle, siMeta, siTesla } from "simple-icons";

export const investor = {
  greeting: "Welcome Back",
  name: "Vetrick Wilsen",
  status: "Markets open",
};

export const RANGES = ["1D", "1M", "1Y", "3Y", "5Y", "ALL"] as const;
export type Range = (typeof RANGES)[number];
export const DEFAULT_RANGE: Range = "1Y";

export const performance = {
  changePct: "up 1.2%",
  value: "$128,540.72",
  gain: "$1,284.32 (1.01%)",
  dayLow: "$126,910",
  dayHigh: "$129,240",
  /** Latest close — pinned to the last point of the series and to the axis badge. */
  last: 245.16,
  /** Where the crosshair rests before the pointer takes over. */
  cursor: 0.71,
  cursorPrice: 182.19,
  date: "04/01/2026",
  day: "1 Apr 2026",
};

/** Fixed axis domain — the reference labels 260 down to 140. */
export const PRICE_DOMAIN = { min: 132, max: 268 };
export const PRICE_TICKS = [260, 240, 220, 200, 180, 160, 140];
export const TIME_TICKS: [string, number][] = [
  ["Apr", 0.04],
  ["03:00", 0.25],
  ["06:00", 0.46],
  ["12:00", 0.88],
];

// The x axis is linear in time; the tick anchors above fix its origin and rate,
// so the tooltip clock and the axis labels can never drift apart.
const AXIS_ORIGIN = TIME_TICKS[0][1];
const AXIS_HOURS_PER_UNIT = 3 / (TIME_TICKS[1][1] - AXIS_ORIGIN);

export function timeAt(fraction: number) {
  const minutes = Math.max(0, (fraction - AXIS_ORIGIN) * AXIS_HOURS_PER_UNIT * 60);
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, "0")}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`;
}

/** Deterministic jitter so SSR and the client draw the same path. */
function noise(seed: number, i: number) {
  const h = (Math.imul(seed + i, 1664525) + 1013904223) >>> 0;
  return (h / 0xffffffff) * 2 - 1;
}

/** Anchors traced off the reference: early climb, mid-run peak, trough, recovery. */
const PRICE_ANCHORS = [
  204, 206, 214, 210, 220, 232, 250, 249, 226, 214, 208, 206, 218, 214, 196, 186, 180, 178, 182, 178, 181, 196, 226,
  236, 234, 240, 245,
];

export const PRICE_POINTS = 64;
export const CURSOR_INDEX = Math.round(performance.cursor * (PRICE_POINTS - 1));

function interpolate(anchors: number[], points: number, seed: number, amplitude: number) {
  return Array.from({ length: points }, (_, i) => {
    const t = (i / (points - 1)) * (anchors.length - 1);
    const a = Math.floor(t);
    const b = Math.min(a + 1, anchors.length - 1);
    return anchors[a] + (anchors[b] - anchors[a]) * (t - a) + noise(seed, i) * amplitude;
  });
}

export const priceSeries = (() => {
  const out = interpolate(PRICE_ANCHORS, PRICE_POINTS, 17, 2.6);
  // Pin the two points the axis badges label, so the markers land on their values.
  out[CURSOR_INDEX] = performance.cursorPrice;
  out[out.length - 1] = performance.last;
  return out;
})();

export const VOLUME_BARS = 48;
export const volumeSeries = Array.from({ length: VOLUME_BARS }, (_, i) => 0.3 + Math.abs(noise(91, i)) * 0.7);

export interface WatchlistRow {
  id: string;
  name: string;
  sector: string;
  icon: SimpleIcon;
  price: string;
  change: string;
  up: boolean;
  marketCap: string;
  volume: string;
  /** The row the reference shows lifted out of the list. */
  active?: boolean;
}

export const watchlist: WatchlistRow[] = [
  {
    id: "tsla",
    name: "Tesla",
    sector: "Consumer",
    icon: siTesla,
    price: "$234.18",
    change: "-0.84%",
    up: false,
    marketCap: "$742B",
    volume: "92.5M",
  },
  {
    id: "googl",
    name: "Google",
    sector: "Communication",
    icon: siGoogle,
    price: "$138.62",
    change: "+1.18%",
    up: true,
    marketCap: "$1.74T",
    volume: "34.6M",
    active: true,
  },
  {
    id: "meta",
    name: "Meta",
    sector: "Communication",
    icon: siMeta,
    price: "$492.10",
    change: "-0.72%",
    up: false,
    marketCap: "$2.85T",
    volume: "22.9M",
  },
  {
    id: "aapl",
    name: "Apple",
    sector: "Technology",
    icon: siApple,
    price: "$182.45",
    change: "+1.24%",
    up: true,
    marketCap: "$2.85T",
    volume: "58.2M",
  },
];

/** Bar count matches the companies screen's activity sparkline. */
export const SPARK_BARS = 14;

/** Per-row sparkline, seeded off the ticker so every render matches. */
export function sparkline(seed: string, up: boolean) {
  const n = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  let v = 0.5;
  return Array.from({ length: SPARK_BARS }, (_, i) => {
    v = Math.min(0.95, Math.max(0.15, v + noise(n, i) * 0.28 + (up ? 0.03 : -0.03)));
    return v;
  });
}

export interface Allocation {
  name: string;
  amount: string;
  value: number;
  pct: number;
  icon: typeof Monitor;
}

/** Tile order follows the reference grid; the stacked bar re-sorts by value. */
export const allocations: Allocation[] = [
  { name: "Technology", amount: "$43,703", value: 43703, pct: 43, icon: Monitor },
  { name: "Energy", amount: "$19,280", value: 19280, pct: 16, icon: Zap },
  { name: "Industrials", amount: "$15,281", value: 15281, pct: 10, icon: Factory },
  { name: "Healthcare", amount: "$32,220", value: 32220, pct: 32, icon: Stethoscope },
  { name: "Finance", amount: "$24,190", value: 24190, pct: 24, icon: Landmark },
  { name: "Consumer", amount: "$8,102", value: 8102, pct: 6, icon: ShoppingBag },
];
