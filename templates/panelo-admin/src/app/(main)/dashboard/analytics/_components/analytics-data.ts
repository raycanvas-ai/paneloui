import { format, parseISO, subDays } from "date-fns";

export type RangeKey = "7d" | "30d" | "90d";
export type MetricKey = "visitors" | "sessions" | "bounce" | "engagement";

export const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

/** Same "today" as the store and finance screens. */
const END = parseISO("2026-09-15");

/* ------------------------------------------------------------ Daily series */

type Day = { label: string; visitors: number; sessions: number; bounce: number; engagement: number };

/** Deterministic wave, never Math.random, so server and client render the same numbers. */
function wave(index: number, phase: number) {
  return 1 + 0.12 * Math.sin(index * 0.7 + phase) + 0.05 * Math.cos(index * 1.9 + phase * 1.5);
}

function weekendDip(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6 ? 0.78 : 1;
}

function days(count: number, offset: number, growth: number): Day[] {
  return Array.from({ length: count }, (_, index) => {
    const date = subDays(END, count - 1 - index + offset);
    const visitors = Math.round(4_800 * wave(index, offset) * weekendDip(date) * (1 + growth * index));
    return {
      label: format(date, "MMM d"),
      visitors,
      sessions: Math.round(visitors * (1.36 + 0.04 * Math.sin(index))),
      bounce: Math.round((41 - 3 * Math.sin(index * 0.5 + offset)) * 10) / 10,
      engagement: Math.round(168 + 14 * Math.cos(index * 0.6 + offset)),
    };
  });
}

/** 90 days reads better as weeks than as 90 thin points. */
function weekly(points: Day[]): Day[] {
  return Array.from({ length: Math.ceil(points.length / 7) }, (_, week) => {
    const slice = points.slice(week * 7, week * 7 + 7);
    const visitors = slice.reduce((sum, point) => sum + point.visitors, 0);
    return {
      label: slice[0].label,
      visitors,
      sessions: slice.reduce((sum, point) => sum + point.sessions, 0),
      bounce: Math.round((slice.reduce((sum, point) => sum + point.bounce * point.visitors, 0) / visitors) * 10) / 10,
      engagement: Math.round(slice.reduce((sum, point) => sum + point.engagement, 0) / slice.length),
    };
  });
}

function period(range: RangeKey, previous: boolean) {
  const count = RANGES.find((item) => item.key === range)?.days ?? 30;
  // The previous period sits immediately before and grows a little slower.
  const points = days(range === "90d" ? 91 : count, previous ? count : 0, previous ? 0.001 : 0.003);
  return range === "90d" ? weekly(points) : points;
}

export function getSeries(range: RangeKey) {
  const current = period(range, false);
  const before = period(range, true);
  return current.map((point, index) => ({ ...point, previous: before[index] }));
}

/* ---------------------------------------------------------------- Totals */

function summarise(points: Day[]) {
  const visitors = points.reduce((sum, point) => sum + point.visitors, 0);
  return {
    visitors,
    sessions: points.reduce((sum, point) => sum + point.sessions, 0),
    bounce: Math.round((points.reduce((sum, point) => sum + point.bounce * point.visitors, 0) / visitors) * 10) / 10,
    engagement: Math.round(points.reduce((sum, point) => sum + point.engagement, 0) / points.length),
  };
}

function change(value: number, base: number) {
  return base ? Math.round(((value - base) / base) * 1000) / 10 : 0;
}

export function getTotals(range: RangeKey) {
  const now = summarise(period(range, false));
  const then = summarise(period(range, true));
  return {
    now,
    change: {
      visitors: change(now.visitors, then.visitors),
      sessions: change(now.sessions, then.sessions),
      bounce: change(now.bounce, then.bounce),
      engagement: change(now.engagement, then.engagement),
    } satisfies Record<MetricKey, number>,
  };
}

export const METRICS: {
  key: MetricKey;
  label: string;
  /** Bounce rate falling is good news, so its change reads inverted. */
  lowerIsBetter?: boolean;
  format: (value: number) => string;
  axis: (value: number) => string;
}[] = [
  {
    key: "visitors",
    label: "Visitors",
    format: (value) => value.toLocaleString("en-US"),
    axis: (value) => `${Math.round(value / 1000)}k`,
  },
  {
    key: "sessions",
    label: "Sessions",
    format: (value) => value.toLocaleString("en-US"),
    axis: (value) => `${Math.round(value / 1000)}k`,
  },
  {
    key: "bounce",
    label: "Bounce rate",
    lowerIsBetter: true,
    format: (value) => `${value}%`,
    axis: (value) => `${value}%`,
  },
  {
    key: "engagement",
    label: "Avg. engagement",
    format: (value) => `${Math.floor(value / 60)}m ${String(value % 60).padStart(2, "0")}s`,
    axis: (value) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`,
  },
];

/* -------------------------------------------------------------- Channels */

const CHANNELS = [
  { name: "Organic search", share: 0.38, conversion: 3.4, change: 6.2 },
  { name: "Direct", share: 0.24, conversion: 4.1, change: 2.8 },
  { name: "Referral", share: 0.14, conversion: 2.9, change: 11.5 },
  { name: "Social", share: 0.12, conversion: 1.6, change: -4.3 },
  { name: "Email", share: 0.08, conversion: 5.2, change: 9.1 },
  { name: "Paid search", share: 0.04, conversion: 2.2, change: -12.6 },
];

/** Channel visitors add up to the range total exactly; the largest channel absorbs rounding. */
export function getChannels(range: RangeKey) {
  const total = getTotals(range).now.visitors;
  const rows = CHANNELS.map((channel) => ({ ...channel, visitors: Math.round(total * channel.share) }));
  rows[0].visitors += total - rows.reduce((sum, row) => sum + row.visitors, 0);
  return rows;
}

/* ----------------------------------------------------------------- Pages */

const PAGES = [
  { path: "/", title: "Home", share: 0.27 },
  { path: "/pricing", title: "Pricing", share: 0.14 },
  { path: "/docs/getting-started", title: "Getting started", share: 0.11 },
  { path: "/blog/designing-dashboards", title: "Designing dashboards that last", share: 0.07 },
  { path: "/changelog", title: "Changelog", share: 0.05 },
  { path: "/integrations/slack", title: "Slack integration", share: 0.04 },
];

/** Pageviews run at about 2.3 per session. */
export function getPages(range: RangeKey) {
  const pageviews = Math.round(getTotals(range).now.sessions * 2.3);
  return { pageviews, rows: PAGES.map((page) => ({ ...page, views: Math.round(pageviews * page.share) })) };
}

/* --------------------------------------------------------------- Devices */

const DEVICES = [
  { name: "Desktop", share: 0.58 },
  { name: "Mobile", share: 0.36 },
  { name: "Tablet", share: 0.06 },
];

export function getDevices(range: RangeKey) {
  const total = getTotals(range).now.visitors;
  return DEVICES.map((device) => ({ ...device, visitors: Math.round(total * device.share) }));
}

/* ------------------------------------------------------------- Retention */

/** Share of each signup week still active N weeks later; newer cohorts have fewer weeks to show. */
export const cohorts = [
  { week: "Aug 3", size: 1_284, retained: [100, 46, 38, 33, 31, 29] },
  { week: "Aug 10", size: 1_402, retained: [100, 48, 39, 35, 32] },
  { week: "Aug 17", size: 1_356, retained: [100, 51, 42, 37] },
  { week: "Aug 24", size: 1_519, retained: [100, 49, 41] },
  { week: "Aug 31", size: 1_611, retained: [100, 53] },
  { week: "Sep 7", size: 1_688, retained: [100] },
];

/* ------------------------------------------------------------------ Live */

/** Active visitors per minute over the last 30 minutes, oldest first. */
export const liveMinutes = Array.from({ length: 30 }, (_, index) =>
  Math.round(212 + 48 * Math.sin(index * 0.45) + 22 * Math.cos(index * 1.3)),
);

export const liveNow = liveMinutes[liveMinutes.length - 1];

const LIVE_PAGES = [
  { path: "/pricing", share: 0.31 },
  { path: "/", share: 0.24 },
  { path: "/docs/getting-started", share: 0.18 },
  { path: "/changelog", share: 0.09 },
];

export const livePages = LIVE_PAGES.map((page) => ({ path: page.path, visitors: Math.round(liveNow * page.share) }));
