/* -------------------------------------------------------------------------- */
/*  Sample data for the dashboard overview: three channels, a year of          */
/*  engagement, a week of activity by time of day, audience age and country.  */
/*  Series are seeded, so the server and the browser draw the same numbers.   */
/* -------------------------------------------------------------------------- */

export type Channel = "facebook" | "x" | "instagram";
export type Period = 7 | 30 | 90 | 365;

export const CHANNELS: { id: Channel; name: string }[] = [
  { id: "facebook", name: "Facebook" },
  { id: "x", name: "X" },
  { id: "instagram", name: "Instagram" },
];

export const PERIODS: { id: Period; label: string }[] = [
  { id: 7, label: "Last 7 days" },
  { id: 30, label: "Last 30 days" },
  { id: 90, label: "Last 90 days" },
  { id: 365, label: "Last 12 months" },
];

/** Numbers below are for 30 days; other periods scale from them. */
export const periodScale = (p: Period) =>
  ({ 7: 0.26, 30: 1, 90: 2.7, 365: 10.4 })[p];

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

/* -------------------------------- Overview -------------------------------- */

export type Metric = "followers" | "likes" | "comments";
export const METRICS: {
  id: Metric;
  label: string;
  noun: string;
  goal: number;
}[] = [
  { id: "followers", label: "Followers", noun: "new followers", goal: 800 },
  { id: "likes", label: "Likes", noun: "likes", goal: 12_000 },
  { id: "comments", label: "Comments", noun: "comments", goal: 1_600 },
];

/** What each channel brought in today, per metric. */
export const today: Record<Metric, Record<Channel, number>> = {
  followers: { facebook: 88, x: 112, instagram: 371 },
  likes: { facebook: 2_940, x: 1_120, instagram: 6_385 },
  comments: { facebook: 412, x: 96, instagram: 503 },
};

/** Each channel's audience and its engagement over 30 days. */
export type ChannelStats = {
  followers: number;
  change: number;
  likes: number;
  comments: number;
  shares: number;
};
export const channels: Record<Channel, ChannelStats> = {
  facebook: {
    followers: 52_340,
    change: 4.9,
    likes: 4_120,
    comments: 3_960,
    shares: 4_030,
  },
  x: {
    followers: 31_580,
    change: -0.9,
    likes: 7_540,
    comments: 1_140,
    shares: 6_120,
  },
  instagram: {
    followers: 100_240,
    change: 6.2,
    likes: 50_310,
    comments: 2_270,
    shares: 6_040,
  },
};
export const followersChange = 3.2;

/* -------------------------------- Engagement -------------------------------- */

export type Granularity = "monthly" | "weekly";

/** Engagements per channel, twelve points ending with the period that holds `today`. */
export function engagementSeries(
  granularity: Granularity,
  now: Date,
): { date: Date; values: Record<Channel, number> }[] {
  // Hand-shaped years (thousands), so the lines cross and rise.
  const SHAPE: Record<Channel, number[]> = {
    facebook: [19, 18.4, 17.6, 18.8, 23, 33, 46, 51, 48, 39, 35, 41],
    x: [0.5, 21, 38, 37, 28.6, 33, 50, 56, 57.5, 52, 44, 47],
    instagram: [10, 19, 26.4, 23.6, 18.6, 20.4, 30, 45, 56.5, 55, 49, 53],
  };
  const rand = random(granularity === "monthly" ? 7 : 11);
  return Array.from({ length: 12 }, (_, i) => {
    const back = 11 - i;
    const date =
      granularity === "monthly"
        ? new Date(now.getFullYear(), now.getMonth() - back, 1)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate() - back * 7);
    const k = granularity === "monthly" ? 1000 : 260;
    const values = Object.fromEntries(
      (Object.keys(SHAPE) as Channel[]).map((c) => [
        c,
        Math.round(
          SHAPE[c][i] *
            (granularity === "weekly" ? 0.85 + rand() * 0.3 : 1) *
            k,
        ),
      ]),
    ) as Record<Channel, number>;
    return { date, values };
  });
}

/* -------------------------------- Activity -------------------------------- */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Three-hour slots, starting at their hour; quiet hours (3–6 AM) are left out. */
export const SLOTS = [6, 9, 12, 15, 18, 21, 0];
export type ActivityMetric = "engagement" | "reach";

/** Engagements per channel for each day (rows: slots, columns: days). Lunch and evenings run hot, weekends late. */
export function activity(metric: ActivityMetric): Record<Channel, number[][]> {
  const rand = random(metric === "reach" ? 5 : 3);
  const base = [0.22, 0.42, 1, 0.55, 0.78, 1, 0.3];
  const lean: Record<Channel, number[]> = {
    facebook: [0.9, 1, 1.1, 0.8, 0.9, 0.7, 0.5],
    x: [1, 1.2, 1, 1, 0.8, 0.8, 0.7],
    instagram: [0.6, 0.7, 1, 0.9, 1.1, 1.25, 0.9],
  };
  const scale = metric === "reach" ? 9 : 1;
  return Object.fromEntries(
    (Object.keys(lean) as Channel[]).map((c) => [
      c,
      SLOTS.map((_, s) =>
        DAYS.map((_, d) => {
          const weekend = d >= 5;
          const shift = weekend ? (s >= 4 ? 1.25 : s <= 1 ? 0.6 : 1) : 1;
          return Math.round(
            1600 * base[s] * lean[c][s] * shift * (0.4 + rand() * 1.2) * scale,
          );
        }),
      ),
    ]),
  ) as Record<Channel, number[][]>;
}

/* ---------------------------------- Ages ---------------------------------- */

export type AgeBand = { label: string; share: number };
/** Shares by age, per channel and in total. Order is the order slices are drawn, clockwise from the top. */
export const ages: Record<Channel | "all", AgeBand[]> = {
  all: [
    { label: "35+", share: 7 },
    { label: "25–34", share: 13 },
    { label: "13–17", share: 15 },
    { label: "18–24", share: 65 },
  ],
  facebook: [
    { label: "35+", share: 24 },
    { label: "25–34", share: 31 },
    { label: "13–17", share: 6 },
    { label: "18–24", share: 39 },
  ],
  x: [
    { label: "35+", share: 15 },
    { label: "25–34", share: 34 },
    { label: "13–17", share: 9 },
    { label: "18–24", share: 42 },
  ],
  instagram: [
    { label: "35+", share: 4 },
    { label: "25–34", share: 11 },
    { label: "13–17", share: 19 },
    { label: "18–24", share: 66 },
  ],
};

/* -------------------------------- Countries -------------------------------- */

export type CountryMetric = "followers" | "reach";
export type Country = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  share: Record<CountryMetric, number>;
};
export const countries: Country[] = [
  {
    code: "US",
    name: "United States",
    lat: 39,
    lon: -98,
    share: { followers: 38, reach: 34 },
  },
  {
    code: "GB",
    name: "United Kingdom",
    lat: 53,
    lon: -2,
    share: { followers: 21, reach: 17 },
  },
  {
    code: "DE",
    name: "Germany",
    lat: 51,
    lon: 10,
    share: { followers: 14, reach: 12 },
  },
  {
    code: "JP",
    name: "Japan",
    lat: 37,
    lon: 139,
    share: { followers: 9, reach: 13 },
  },
  {
    code: "BR",
    name: "Brazil",
    lat: -12,
    lon: -51,
    share: { followers: 8, reach: 11 },
  },
  {
    code: "IN",
    name: "India",
    lat: 22,
    lon: 79,
    share: { followers: 6, reach: 9 },
  },
  {
    code: "AU",
    name: "Australia",
    lat: -25,
    lon: 134,
    share: { followers: 4, reach: 4 },
  },
];

/**
 * Land on a 64 × 39 Mercator grid from 82°N to 56°S, one hex row per line (a set bit is land).
 * Rasterised from public-domain 1:110m land polygons.
 */
export const WORLD = {
  cols: 64,
  top: 82,
  bottom: -56,
  rows: [
    "0001fff800000000",
    "0001fffc28000000",
    "0001eff830804000",
    "0003fff838004000",
    "0003dff820002000",
    "0018cff80020f040",
    "003103f00020f000",
    "003203f00041fe00",
    "003fe3f0004fffe0",
    "1efdf1f01c0ffffd",
    "9fffd1e01e7fffff",
    "ffffbbcc3fffffff",
    "1fff11886fffffff",
    "1ffe30006ffffffc",
    "00ff38016fffff88",
    "007fbc013fffff98",
    "007ffc01ffffff80",
    "003ff801ffffffc0",
    "003ff001f9ffff40",
    "003fe0031ffffe00",
    "001fc001c3fffd80",
    "000fc003fffffc00",
    "000e0007ffbff800",
    "00068007ffe6e000",
    "00008007ff847000",
    "00003807ff820000",
    "00003e007f006800",
    "00003f803e002d80",
    "00003fc03e001040",
    "00003f803e800140",
    "00001f803c8007c0",
    "00001f003c800fe0",
    "00001e001c000fe0",
    "00001e0018000ce0",
    "00001c0000000041",
    "0000180000000002",
    "0000300000000000",
    "0000300000000000",
    "0000100000000000",
  ],
};

/* ------------------------------ Header popovers ------------------------------ */

export const UPCOMING = [
  {
    id: "u1",
    channel: "instagram" as Channel,
    text: "Behind the scenes: the spring lookbook shoot",
    inMinutes: 95,
  },
  {
    id: "u2",
    channel: "x" as Channel,
    text: "Thread: five things we learned shipping v2",
    inMinutes: 260,
  },
  {
    id: "u3",
    channel: "facebook" as Channel,
    text: "Live Q&A with the design team, Thursday 6 PM",
    inMinutes: 1_440,
  },
];

export const CONNECTABLE = [
  { id: "youtube", name: "YouTube", hint: "Videos, Shorts and channel stats" },
  { id: "linkedin", name: "LinkedIn", hint: "Company page and posts" },
  { id: "threads", name: "Threads", hint: "Posts and replies" },
] as const;
