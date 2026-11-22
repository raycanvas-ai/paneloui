import { format, parseISO, subDays } from "date-fns";

import { getOrderLines, getOrderTotals, orders } from "../../orders/_components/orders-data";
import { getWeeklySales, LOW_STOCK_THRESHOLD, products } from "../../products/_components/products-data";

export type RangeKey = "7d" | "30d" | "90d";

export const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

/** Latest order in the sample data; every series ends here so the lists and charts agree. */
const END = parseISO("2026-09-15");

/* ------------------------------------------------------------------ Sales */

export type SalesPoint = { label: string; current: number; previous: number };

function wave(index: number, phase: number) {
  return 1 + 0.16 * Math.sin(index * 0.85 + phase) + 0.07 * Math.cos(index * 2.1 + phase * 2);
}

/** Daily sales with a gentle upward drift, scaled so the window sums to `total`. */
function daily(days: number, total: number): SalesPoint[] {
  const raw = Array.from({ length: days }, (_, index) => ({
    label: format(subDays(END, days - 1 - index), "MMM d"),
    current: wave(index, 0) * (1 + 0.004 * index),
    previous: wave(index, 1.3) * 0.92,
  }));
  const scale = total / raw.reduce((sum, point) => sum + point.current, 0);
  const points = raw.map((point) => ({
    label: point.label,
    current: Math.round(point.current * scale),
    previous: Math.round(point.previous * scale),
  }));
  // Rounding drifts by a few dollars; the last day absorbs it so the window sums to `total` exactly.
  points[points.length - 1].current += total - points.reduce((sum, point) => sum + point.current, 0);
  return points;
}

/** 90 days reads better as weeks than as 90 thin points. */
function weekly(points: SalesPoint[]): SalesPoint[] {
  return Array.from({ length: Math.ceil(points.length / 7) }, (_, week) => {
    const slice = points.slice(week * 7, week * 7 + 7);
    return {
      label: slice[0].label,
      current: slice.reduce((sum, point) => sum + point.current, 0),
      previous: slice.reduce((sum, point) => sum + point.previous, 0),
    };
  });
}

// 30-day totals match the orders screen: $96,420 net revenue across 1,284 orders.
export const salesSeries: Record<RangeKey, SalesPoint[]> = {
  "7d": daily(7, 23_870),
  "30d": daily(30, 96_420),
  "90d": weekly(daily(91, 281_300)),
};

const AOV: Record<RangeKey, number> = { "7d": 78.4, "30d": 75.09, "90d": 73.62 };
const PREVIOUS_AOV: Record<RangeKey, number> = { "7d": 76.1, "30d": 76.86, "90d": 72.4 };
const CONVERSION: Record<RangeKey, number> = { "7d": 3.1, "30d": 2.9, "90d": 2.7 };
const PREVIOUS_CONVERSION: Record<RangeKey, number> = { "7d": 2.8, "30d": 2.7, "90d": 2.6 };

function change(current: number, previous: number) {
  return previous ? Math.round(((current - previous) / previous) * 1000) / 10 : 0;
}

export function getSummary(range: RangeKey) {
  const series = salesSeries[range];
  const net = series.reduce((sum, point) => sum + point.current, 0);
  const previousNet = series.reduce((sum, point) => sum + point.previous, 0);
  const orderCount = Math.round(net / AOV[range]);
  const previousOrders = Math.round(previousNet / PREVIOUS_AOV[range]);
  const sessions = Math.round(orderCount / (CONVERSION[range] / 100));

  return {
    net,
    netDelta: change(net, previousNet),
    orders: orderCount,
    ordersDelta: change(orderCount, previousOrders),
    aov: AOV[range],
    aovDelta: change(AOV[range], PREVIOUS_AOV[range]),
    conversion: CONVERSION[range],
    conversionDelta: change(CONVERSION[range], PREVIOUS_CONVERSION[range]),
    sessions,
  };
}

/* ----------------------------------------------------------------- Funnel */

/** Share of sessions reaching each step; the last step is the conversion rate. */
const FUNNEL_STEPS = [
  { label: "Sessions", share: 1 },
  { label: "Viewed a product", share: 0.62 },
  { label: "Added to cart", share: 0.17 },
  { label: "Reached checkout", share: 0.064 },
];

export function getFunnel(range: RangeKey) {
  const { sessions, orders: purchased } = getSummary(range);
  return [
    ...FUNNEL_STEPS.map((step) => ({ label: step.label, value: Math.round(sessions * step.share) })),
    { label: "Purchased", value: purchased },
  ];
}

/* --------------------------------------------------------------- Channels */

// Shares follow the order mix in the sample data: mostly online, then Instagram, then in-store.
const CHANNELS = [
  { name: "Online Store", share: 0.62, delta: 9.4 },
  { name: "Instagram Shop", share: 0.24, delta: 21.7 },
  { name: "Point of Sale", share: 0.14, delta: -3.2 },
] as const;

export function getChannels(range: RangeKey) {
  const { net } = getSummary(range);
  return CHANNELS.map((channel) => ({ ...channel, amount: Math.round(net * channel.share) }));
}

/* ------------------------------------------------------------------ Lists */

export const recentOrders = [...orders]
  .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
  .map((order) => ({
    ...order,
    lead: getOrderLines(order)[0]?.product,
    totals: getOrderTotals(order),
  }));

export const pipeline = [
  { status: "pending", label: "Awaiting payment" },
  { status: "paid", label: "To fulfil" },
  { status: "fulfilled", label: "Fulfilled" },
  { status: "refunded", label: "Refunded" },
].map((stage) => ({ ...stage, count: orders.filter((order) => order.status === stage.status).length }));

export const bestSellers = products
  .filter((product) => product.status === "active")
  .map((product) => {
    const units = getWeeklySales(product).reduce((sum, week) => sum + week.units, 0);
    return { product, units, revenue: units * product.price };
  })
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);

export const lowStock = products
  .filter((product) => product.status === "active" && product.stock <= LOW_STOCK_THRESHOLD)
  .sort((a, b) => a.stock - b.stock);
