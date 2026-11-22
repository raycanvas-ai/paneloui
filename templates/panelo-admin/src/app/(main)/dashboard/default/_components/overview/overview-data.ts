export type RangeKey = "day" | "week" | "6m";
export type MetricKey = "gross" | "net" | "mrr";

export const RANGES: { key: RangeKey; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "6m", label: "6 Months" },
];

export const METRICS: { key: MetricKey; label: string }[] = [
  { key: "gross", label: "Gross Revenue" },
  { key: "net", label: "Net Revenue" },
  { key: "mrr", label: "MRR" },
];

/* ---------------------------------------------------------------- KPI row */

/** Six readings a day across the week; the Wednesday peak is the headline. */
const mrrShape = [
  22, 29, 15, 22, 29, 15, 41, 24, 36, 24, 35, 24, 25, 35, 41, 54, 46, 41, 35, 41, 53, 41, 46, 44, 46, 41, 41, 35, 29,
  41, 35, 44, 41, 36, 29, 29, 41, 35, 41, 47, 43, 41,
];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const mrrSeries = mrrShape.map((height, i) => ({
  slot: `${days[Math.floor(i / 6)]} ${String(4 * (i % 6)).padStart(2, "0")}:00`,
  day: days[Math.floor(i / 6)],
  peak: i === 20,
  mrr: Math.round((height / 53) * 482_340),
}));

export const arrSeries = [
  { day: "Sun", arr: 4.52, forecast: null },
  { day: "Mon", arr: 5.41, forecast: null },
  { day: "Tue", arr: 5.22, forecast: null },
  { day: "Wed", arr: 5.63, forecast: null },
  { day: "Thu", arr: 5.79, forecast: 5.79 },
  { day: "Fri", arr: null, forecast: 5.11 },
  { day: "Sat", arr: null, forecast: 5.36 },
];

export const subscriptionSeries = [
  { month: "Jan", subscriptions: 6_640 },
  { month: "Feb", subscriptions: 5_560 },
  { month: "Mar", subscriptions: 2_870 },
  { month: "Apr", subscriptions: 6_640 },
  { month: "May", subscriptions: 7_530 },
  { month: "Jun", subscriptions: 6_460 },
  { month: "Jul", subscriptions: 8_942 },
  { month: "Aug", subscriptions: 2_870 },
  { month: "Sep", subscriptions: 6_640 },
  { month: "Oct", subscriptions: 7_530 },
  { month: "Nov", subscriptions: 6_460 },
  { month: "Dec", subscriptions: 6_640 },
];

export const churnRows = [
  { label: "This Year", value: 2.1 },
  { label: "Last Year", value: 2.8 },
];

/* ------------------------------------------------------------ Revenue card */

type Point = { label: string; current: number; previous: number };

function series(labels: string[], base: number[], lag: number[]): Point[] {
  return labels.map((label, i) => ({ label, current: base[i], previous: lag[i] }));
}

const weekLabels = ["20 Mar", "21 Mar", "22 Mar", "23 Mar", "24 Mar", "25 Mar", "26 Mar"];

export const revenueSeries: Record<RangeKey, Point[]> = {
  day: series(
    ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:00"],
    [1.2, 2.4, 4.8, 7.1, 8.4, 6.9, 5.4],
    [1.6, 2.1, 3.9, 6.2, 7.0, 6.1, 5.9],
  ),
  week: series(weekLabels, [5.4, 7.6, 6.9, 10.1, 5.8, 8.6, 8.7], [4.6, 5.6, 6.4, 6.3, 4.1, 7.4, 7.0]),
  "6m": series(
    ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    [6.1, 7.4, 6.8, 9.2, 8.1, 10.4],
    [5.2, 6.6, 7.9, 6.4, 7.2, 8.3],
  ),
};

/** Headline figures shown beside the chart, per range and metric. */
export const revenueHeadline: Record<RangeKey, Record<MetricKey, { total: string; delta: number }>> = {
  day: {
    gross: { total: "$48.2K", delta: 3.1 },
    net: { total: "$41.6K", delta: 2.4 },
    mrr: { total: "$16.1K", delta: 1.2 },
  },
  week: {
    gross: { total: "$1.28M", delta: 6.4 },
    net: { total: "$1.09M", delta: 5.2 },
    mrr: { total: "$482.3K", delta: 12.4 },
  },
  "6m": {
    gross: { total: "$7.42M", delta: 9.8 },
    net: { total: "$6.31M", delta: 8.1 },
    mrr: { total: "$5.79M", delta: 9.8 },
  },
};

/* --------------------------------------------------------- Plan + activity */

export const planDistribution = [
  { plan: "Starter", revenue: 201_500, users: 4_120 },
  { plan: "Growth", revenue: 161_360, users: 3_250 },
  { plan: "Enterprise", revenue: 119_480, users: 1_572 },
];

export const atRiskCustomers = [
  { name: "Apex Solutions", plan: "Enterprise", health: 52 },
  { name: "Northwind Labs", plan: "Growth", health: 58 },
  { name: "BrightCore Inc.", plan: "Growth", health: 68 },
  { name: "Vertex Media", plan: "Starter", health: 71 },
];

export const activity = [
  { id: "a1", time: "9:42", who: "Michael Carter", text: "Michael Carter upgraded to Enterprise Plan" },
  { id: "a2", time: "9:15", who: null, text: "Invoice INV-2042 failed for Bright Path AI" },
  { id: "a3", time: "8:54", who: "Sarah Johnson", text: "Sarah Johnson requested refund ($299)" },
];

/* ----------------------------------------------------------------- Deals */

export type Risk = "High" | "Medium" | "Low";

export interface Deal {
  id: string;
  customer: string;
  plan: "Starter" | "Growth" | "Enterprise";
  region: "AMER" | "EMEA" | "APAC";
  arr: number;
  health: number;
  renewal: string;
  renewalInDays: number;
  risk: Risk;
  usage: number;
  expansion: Risk;
  owner: string;
}

export const deals: Deal[] = [
  {
    id: "apex",
    customer: "Apex Solutions",
    plan: "Enterprise",
    region: "AMER",
    arr: 85_000,
    health: 52,
    renewal: "June 28, 2026",
    renewalInDays: 14,
    risk: "High",
    usage: 41,
    expansion: "Low",
    owner: "Sarah Johnson",
  },
  {
    id: "brightcore",
    customer: "BrightCore Inc.",
    plan: "Growth",
    region: "EMEA",
    arr: 126_000,
    health: 68,
    renewal: "Jul 10, 2026",
    renewalInDays: 26,
    risk: "Medium",
    usage: 63,
    expansion: "Medium",
    owner: "David Miller",
  },
  {
    id: "northwind",
    customer: "Northwind Labs",
    plan: "Growth",
    region: "AMER",
    arr: 74_500,
    health: 58,
    renewal: "Aug 02, 2026",
    renewalInDays: 49,
    risk: "Medium",
    usage: 55,
    expansion: "Medium",
    owner: "Priya Raman",
  },
  {
    id: "vertex",
    customer: "Vertex Media",
    plan: "Starter",
    region: "APAC",
    arr: 22_400,
    health: 71,
    renewal: "Sep 19, 2026",
    renewalInDays: 97,
    risk: "Low",
    usage: 78,
    expansion: "High",
    owner: "Tom Becker",
  },
  {
    id: "helios",
    customer: "Helios Freight",
    plan: "Enterprise",
    region: "EMEA",
    arr: 168_000,
    health: 84,
    renewal: "Nov 04, 2026",
    renewalInDays: 143,
    risk: "Low",
    usage: 88,
    expansion: "High",
    owner: "Sarah Johnson",
  },
  {
    id: "orbit",
    customer: "Orbit Analytics",
    plan: "Growth",
    region: "APAC",
    arr: 58_900,
    health: 47,
    renewal: "Jun 30, 2026",
    renewalInDays: 16,
    risk: "High",
    usage: 34,
    expansion: "Low",
    owner: "David Miller",
  },
  {
    id: "lumen",
    customer: "Lumen Retail",
    plan: "Starter",
    region: "AMER",
    arr: 18_200,
    health: 76,
    renewal: "Oct 12, 2026",
    renewalInDays: 120,
    risk: "Low",
    usage: 69,
    expansion: "Medium",
    owner: "Priya Raman",
  },
];

export const PLANS = ["Starter", "Growth", "Enterprise"] as const;
export const REGIONS = ["AMER", "EMEA", "APAC"] as const;
export const OWNERS = ["Sarah Johnson", "David Miller", "Priya Raman", "Tom Becker"] as const;

export const currency = (value: number) => `$${value.toLocaleString("en-US")}`;
export const compact = (value: number) => value.toLocaleString("en-US");
