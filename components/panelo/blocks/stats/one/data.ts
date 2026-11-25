/* -------------------------------------------------------------------------- */
/*  Sample data for the social overview: four channels, a week of revenue,    */
/*  audience breakdowns and a posting calendar. The posts sit in whichever    */
/*  week is current, so the demo is always live. Swap in your own numbers.    */
/* -------------------------------------------------------------------------- */

export type Platform = "youtube" | "instagram" | "facebook" | "x";
export type Range = 7 | 30 | 90;

export const PLATFORMS: { id: Platform; name: string; audience: string }[] = [
  { id: "youtube", name: "YouTube", audience: "Subscribers" },
  { id: "instagram", name: "Instagram", audience: "Followers" },
  { id: "facebook", name: "Facebook", audience: "Followers" },
  { id: "x", name: "X", audience: "Followers" },
];

export const RANGES: { id: Range; label: string }[] = [
  { id: 7, label: "Last 07 Days" },
  { id: 30, label: "Last 30 Days" },
  { id: 90, label: "Last 90 Days" },
];

/** Audience size now, and how many it gained (or lost) over each range. */
export type Kpi = {
  platform: Platform;
  total: number;
  change: Record<Range, number>;
};

export const kpis: Kpi[] = [
  {
    platform: "youtube",
    total: 684_210,
    change: { 7: 6_148, 30: 24_920, 90: 71_300 },
  },
  {
    platform: "instagram",
    total: 512_640,
    change: { 7: 2_816, 30: 13_420, 90: 46_880 },
  },
  {
    platform: "facebook",
    total: 371_930,
    change: { 7: -1_942, 30: -7_310, 90: -12_640 },
  },
  { platform: "x", total: 14_820, change: { 7: 57, 30: 312, 90: 1_104 } },
];

/** Small seeded PRNG (mulberry32): the same series on the server and in the browser. */
function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A week per channel, hand-shaped: a dip mid-week, a climb, a peak, a dip and a strong finish. */
const WEEK: Record<Platform, number[]> = {
  youtube: [1010, 760, 300, 690, 1180, 1690, 2120],
  instagram: [820, 940, 610, 880, 1240, 1410, 1560],
  facebook: [640, 590, 520, 480, 560, 610, 540],
  x: [120, 160, 140, 210, 190, 260, 240],
};

/**
 * Revenue for a channel over a range, one point a day (a week per point for 90 days), ending today.
 * The last week always matches the hand-shaped week above; earlier days are seeded noise around it.
 */
export function revenueSeries(
  platform: Platform,
  range: Range,
  today: Date,
): { date: Date; value: number }[] {
  const week = WEEK[platform];
  const rand = random(platform.length * 97 + range);
  const sum = week.reduce((a, b) => a + b, 0);
  const count = range === 90 ? 13 : range;
  return Array.from({ length: count }, (_, i) => {
    const back = (count - 1 - i) * (range === 90 ? 7 : 1);
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - back,
    );
    if (range === 90)
      return {
        date,
        value: back === 0 ? sum : Math.round(sum * (0.55 + rand() * 0.8)),
      };
    return {
      date,
      value:
        back < 7
          ? week[6 - back]
          : Math.round((sum / 7) * (0.55 + rand() * 0.8)),
    };
  });
}

/** Revenue change against the range before it, in percent. */
export const revenueChange: Record<Platform, Record<Range, number>> = {
  youtube: { 7: 12.28, 30: 8.4, 90: 21.6 },
  instagram: { 7: 6.1, 30: 4.75, 90: 14.2 },
  facebook: { 7: -3.4, 30: -1.9, 90: 2.3 },
  x: { 7: 18.5, 30: 9.2, 90: 27.4 },
};

/** Who the audience is, per channel: where they live, how old they are and how they identify. */
export type Breakdown = { label: string; value: number }[];
export type Audience = {
  location: Breakdown;
  age: Breakdown;
  gender: Breakdown;
};

const scale = (rows: Breakdown, k: number): Breakdown =>
  rows.map((r) => ({ ...r, value: Math.round(r.value * k) }));
const LOCATION: Breakdown = [
  { label: "Brazil", value: 168_240 },
  { label: "United States", value: 104_870 },
  { label: "Indonesia", value: 86_315 },
  { label: "Germany", value: 41_902 },
  { label: "Portugal", value: 30_664 },
];
const AGE: Breakdown = [
  { label: "18 – 24", value: 142_660 },
  { label: "25 – 34", value: 198_310 },
  { label: "35 – 44", value: 101_450 },
  { label: "45 – 54", value: 46_220 },
  { label: "55 and over", value: 24_000 },
];
const GENDER: Breakdown = [
  { label: "Women", value: 281_950 },
  { label: "Men", value: 214_080 },
  { label: "Not specified", value: 16_610 },
];
export const audiences: Record<Platform, Audience> = Object.fromEntries(
  kpis.map((k) => {
    const f = k.total / 512_640;
    return [
      k.platform,
      {
        location: scale(LOCATION, f),
        age: scale(AGE, f),
        gender: scale(GENDER, f),
      },
    ];
  }),
) as Record<Platform, Audience>;

/** How a post did, against the account's average. */
export type Insight = {
  label: string;
  value: number;
  signed?: boolean;
  average: number;
  change: number;
};
export type Device = {
  label: string;
  share: number;
  change: number;
};

export type Post = {
  id: string;
  platform: Platform;
  /** Day offset from Monday of the current week, and minutes after midnight. */
  day: number;
  minutes: number;
  text: string;
  /** A link at the end of the text, shown in the accent colour. */
  link?: string;
  images: string[];
  insights?: { metrics: Insight[]; devices: Device[] };
};

const metrics = (
  reach: number,
  engaged: number,
  followers: number,
  visits: number,
  k = 1,
): Insight[] => [
  { label: "Accounts reached", value: reach, average: 35, change: 27 * k },
  { label: "Accounts engaged", value: engaged, average: 78, change: -1.37 * k },
  {
    label: "Followers",
    value: followers,
    signed: true,
    average: 56,
    change: 2.15 * k,
  },
  {
    label: "Profile visits",
    value: visits,
    signed: true,
    average: 37,
    change: -3.15 * k,
  },
];
const devices = (desktop: number, tablet: number): Device[] => [
  { label: "Desktop", share: desktop, change: -3.2 },
  { label: "Tablet", share: tablet, change: -5.8 },
  {
    label: "Mobile",
    share: 100 - desktop - tablet,
    change: 12.3,
  },
];

const TERRACES = "/carousel/terraces.webp";
const LAKE = "/carousel/lake.webp";
const PALMS = "/carousel/palms.webp";
const WATERFALL = "/carousel/waterfall.webp";
const FOREST = "/carousel/forest.webp";
const COAST = "/carousel/coast.webp";
const VALLEY = "/carousel/valley.webp";
const PEAKS = "/carousel/peaks.webp";

export const posts: Post[] = [
  {
    id: "p1",
    platform: "instagram",
    day: 0,
    minutes: 600,
    text: "Mist lifting off the tea terraces at six, the quiet hour before the buses arrive.",
    images: [TERRACES, LAKE, PALMS, WATERFALL, FOREST, COAST, VALLEY],
    insights: {
      metrics: metrics(361_208, 248_115, 2_904, 24_318),
      devices: devices(18, 6),
    },
  },
  {
    id: "p2",
    platform: "facebook",
    day: 0,
    minutes: 600,
    text: "Mist lifting off the tea terraces at six, the quiet hour before the buses arrive.",
    images: [PALMS],
    insights: {
      metrics: metrics(118_420, 64_903, 811, 7_260, 0.6),
      devices: devices(31, 9),
    },
  },
  {
    id: "p3",
    platform: "x",
    day: 0,
    minutes: 600,
    text: "Three days on the coast road, eleven beaches, one flat tyre. Full route here:",
    link: "trvl.to/k7Rq2",
    images: [],
    insights: {
      metrics: metrics(42_116, 18_774, 214, 3_087, 1.4),
      devices: devices(41, 4),
    },
  },
  {
    id: "p4",
    platform: "x",
    day: 0,
    minutes: 840,
    text: "Chasing waterfalls before breakfast is my favourite way to start a trip.",
    images: [WATERFALL],
  },
  {
    id: "p5",
    platform: "instagram",
    day: 0,
    minutes: 840,
    text: "Chasing waterfalls before breakfast is my favourite way to start a trip.",
    images: [WATERFALL, FOREST, VALLEY, PEAKS, LAKE],
  },
  {
    id: "p6",
    platform: "instagram",
    day: 1,
    minutes: 540,
    text: "A slow morning on the lake, no plan beyond coffee.",
    images: [LAKE, PEAKS],
    insights: {
      metrics: metrics(204_530, 131_022, 1_388, 11_904, 0.8),
      devices: devices(15, 7),
    },
  },
  {
    id: "p7",
    platform: "youtube",
    day: 1,
    minutes: 1080,
    text: "New film: ten days through the highlands on a single tank.",
    images: [VALLEY, PEAKS, FOREST],
  },
  {
    id: "p8",
    platform: "facebook",
    day: 2,
    minutes: 720,
    text: "Packing list for the rainy season, tested the hard way.",
    images: [FOREST],
  },
  {
    id: "p9",
    platform: "instagram",
    day: 3,
    minutes: 630,
    text: "Golden hour from the ridge, worth every switchback.",
    images: [PEAKS, COAST],
  },
  {
    id: "p10",
    platform: "x",
    day: 4,
    minutes: 900,
    text: "Thread: what I would skip if I did this route again.",
    images: [],
  },
  {
    id: "p11",
    platform: "instagram",
    day: 5,
    minutes: 570,
    text: "Palms, salt and a very patient hammock.",
    images: [PALMS, COAST, LAKE],
  },
];

/** Insights for a post that came without any: seeded by its id, so they hold still between renders. */
export function insightsFor(id: string): {
  metrics: Insight[];
  devices: Device[];
} {
  const rand = random([...id].reduce((n, c) => n * 31 + c.charCodeAt(0), 7));
  const reach = Math.round(40_000 + rand() * 260_000);
  const desktop = Math.round(10 + rand() * 25);
  return {
    metrics: metrics(
      reach,
      Math.round(reach * (0.4 + rand() * 0.3)),
      Math.round(reach / 120),
      Math.round(reach / 14),
      0.5 + rand(),
    ),
    devices: devices(desktop, Math.round(3 + rand() * 8)),
  };
}

export const NOTIFICATIONS = [
  {
    id: "n1",
    text: "Your Instagram post reached 300k accounts",
    ago: "12 min",
  },
  { id: "n2", text: "Two posts go out at 2:00 PM today", ago: "1 h" },
  { id: "n3", text: "Facebook followers dipped 4.7% this week", ago: "3 h" },
];
