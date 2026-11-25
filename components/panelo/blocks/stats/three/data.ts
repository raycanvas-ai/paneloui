/* -------------------------------------------------------------------------- */
/*  Sample data for the crypto portfolio page. Prices are illustrative, not    */
/*  live; series are seeded so the server and the browser draw the same.      */
/* -------------------------------------------------------------------------- */

export type CoinId = "btc" | "eth" | "sol" | "xrp" | "ltc";
export type Coin = { id: CoinId; name: string; symbol: string };

export const COINS: Record<CoinId, Coin> = {
  btc: { id: "btc", name: "Bitcoin", symbol: "BTC" },
  eth: { id: "eth", name: "Ethereum", symbol: "ETH" },
  sol: { id: "sol", name: "Solana", symbol: "SOL" },
  xrp: { id: "xrp", name: "XRP", symbol: "XRP" },
  ltc: { id: "ltc", name: "Litecoin", symbol: "LTC" },
};

/** Small seeded PRNG (mulberry32). */
export function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A jagged walk with drift, for sparklines and the portfolio line. */
export function walk(
  seed: number,
  n: number,
  start: number,
  drift: number,
  jitter: number,
) {
  const rand = random(seed);
  let v = start;
  return Array.from({ length: n }, (_, i) => {
    if (i)
      v = Math.max(start * 0.2, v * (1 + drift / n + (rand() - 0.5) * jitter));
    return v;
  });
}

/* ---------------------------------- Tickers ---------------------------------- */

export const TICKERS: { coin: CoinId; price: number; change: number }[] = [
  { coin: "btc", price: 68_420.5, change: 3.12 },
  { coin: "eth", price: 3_412.8, change: 1.86 },
  { coin: "sol", price: 145.67, change: 5.46 },
  { coin: "xrp", price: 0.62, change: -1.24 },
];

/* -------------------------------- Market leaders -------------------------------- */

export type LeaderPeriod = "week" | "month";
/** The three coins with the most volume, and how their volume moved over the period. */
export const LEADERS: Record<
  LeaderPeriod,
  { coin: CoinId; volume: number; change: number; day: number }[]
> = {
  week: [
    { coin: "btc", volume: 44_343_923, change: 3.1, day: 2_384 },
    { coin: "eth", volume: 26_812_407, change: 2.4, day: 1_906 },
    { coin: "sol", volume: 14_332_867, change: 1.3, day: 1_215 },
  ],
  month: [
    { coin: "btc", volume: 182_906_114, change: 8.7, day: 2_384 },
    { coin: "eth", volume: 104_455_203, change: 5.9, day: 1_906 },
    { coin: "sol", volume: 61_720_588, change: -2.2, day: 1_215 },
  ],
};

/* -------------------------------- Portfolio -------------------------------- */

export type Range = "1D" | "7D" | "1M" | "3M" | "6M" | "1Y";
export const RANGES: Range[] = ["1D", "7D", "1M", "3M", "6M", "1Y"];

/**
 * Portfolio value over a range, ending now. Each range has a number of buckets (days, hours, weeks…)
 * and a few points per bucket, so the line is jagged like a real price line.
 */
export function portfolio(
  range: Range,
  now: Date,
): {
  points: { at: Date; value: number }[];
  buckets: { label: string; long: string }[];
} {
  const spec = {
    "1D": { buckets: 6, per: 8, ms: 4 * 3_600_000 },
    "7D": { buckets: 7, per: 8, ms: 86_400_000 },
    "1M": { buckets: 5, per: 8, ms: 7 * 86_400_000 },
    "3M": { buckets: 6, per: 8, ms: 15 * 86_400_000 },
    "6M": { buckets: 6, per: 8, ms: 30 * 86_400_000 },
    "1Y": { buckets: 6, per: 8, ms: 61 * 86_400_000 },
  }[range];
  const n = spec.buckets * spec.per;
  const end = +now;
  const span = spec.buckets * spec.ms;
  const values = walk(RANGES.indexOf(range) * 13 + 5, n, 81_200, 0.03, 0.035);
  const scale = 83_727.9 / values[n - 1];
  const points = values.map((v, i) => ({
    at: new Date(end - span + ((i + 0.5) / n) * span),
    value: Math.round(v * scale * 100) / 100,
  }));
  const buckets = Array.from({ length: spec.buckets }, (_, b) => {
    const mid = new Date(end - span + (b + 0.5) * spec.ms);
    const label =
      range === "1D"
        ? mid.toLocaleTimeString("en-US", { hour: "numeric" })
        : range === "7D"
          ? mid.toLocaleDateString("en-US", { weekday: "long" })
          : mid.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const long =
      range === "1D"
        ? mid.toLocaleString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
          })
        : mid.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
    return { label, long };
  });
  return { points, buckets };
}

/* ---------------------------------- Holdings ---------------------------------- */

export const CHAINS = ["BNB Chain", "Ethereum", "Solana", "Arbitrum"] as const;
export type Chain = (typeof CHAINS)[number];

/** What the wallet holds, by coin. */
export const HOLDINGS: { coin: CoinId; price: number; change: number }[] = [
  { coin: "btc", price: 68_420.5, change: 2.85 },
  { coin: "eth", price: 3_412.8, change: 3.12 },
  { coin: "sol", price: 145.67, change: 5.46 },
  { coin: "ltc", price: 82.14, change: -0.74 },
  { coin: "xrp", price: 0.62, change: 4.03 },
];

/* ---------------------------------- Markets ---------------------------------- */

export type Trend = "1D" | "7D" | "1M" | "1Y";
export type MarketRow = {
  coin: CoinId;
  price: number;
  change24h: number;
  change7d: number;
  volume: number;
  cap: number;
  seed: number;
};
export const MARKETS: MarketRow[] = [
  {
    coin: "btc",
    price: 68_420.5,
    change24h: 3.45,
    change7d: 2.98,
    volume: 18_435_700_000,
    cap: 1_348_200_000_000,
    seed: 1,
  },
  {
    coin: "eth",
    price: 3_412.8,
    change24h: -2.89,
    change7d: -3.12,
    volume: 12_435_500_000,
    cap: 410_600_000_000,
    seed: 2,
  },
  {
    coin: "sol",
    price: 145.67,
    change24h: 3.67,
    change7d: 3.51,
    volume: 4_453_300_000,
    cap: 67_800_000_000,
    seed: 3,
  },
  {
    coin: "xrp",
    price: 0.62,
    change24h: 3.21,
    change7d: 3.04,
    volume: 1_546_300_000,
    cap: 34_500_000_000,
    seed: 4,
  },
  {
    coin: "ltc",
    price: 82.14,
    change24h: -0.74,
    change7d: 1.33,
    volume: 635_100_000,
    cap: 6_160_000_000,
    seed: 5,
  },
];

/** A sparkline for a coin over a window; the drift follows the coin's change so the line agrees with the number. */
export function trend(row: MarketRow, window: Trend) {
  const n = { "1D": 24, "7D": 28, "1M": 30, "1Y": 26 }[window];
  const change = trendChange(row, window);
  // Jagged noise around a straight run from 100 to 100 + 3 × change, so the line always agrees with its number.
  const rand = random(row.seed * 31 + n);
  let wobble = 0;
  return Array.from({ length: n }, (_, i) => {
    wobble = wobble * 0.55 + (rand() - 0.5) * 6;
    return 100 + (3 * change * i) / (n - 1) + wobble;
  });
}

/** The change a trend window shows: a day reads the 24h figure, longer windows the 7d one. */
export const trendChange = (row: MarketRow, window: Trend) =>
  window === "1D" ? row.change24h : row.change7d;

/* ---------------------------------- Gainers ---------------------------------- */

export type Gainer = {
  id: string;
  name: string;
  cap: number;
  price: number;
  change: number;
};
export const GAINERS: Gainer[] = [
  {
    id: "nova",
    name: "NOVA",
    cap: 274_800_000_000,
    price: 36.89,
    change: 12.99,
  },
  {
    id: "tide",
    name: "TIDE",
    cap: 198_400_000_000,
    price: 25.43,
    change: 9.87,
  },
  {
    id: "quartz",
    name: "QUARTZ",
    cap: 145_600_000_000,
    price: 19.78,
    change: 7.45,
  },
  {
    id: "ember",
    name: "EMBER",
    cap: 267_300_000_000,
    price: 33.52,
    change: 11.68,
  },
];
