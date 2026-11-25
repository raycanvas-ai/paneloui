"use client";

import { DashboardOverview } from "./overview";

/* -------------------------------------------------------------------------- */
/*  stats/two preview: the dashboard overview page, live.                      */
/* -------------------------------------------------------------------------- */

export { DashboardOverview } from "./overview";
export type { DashboardOverviewProps } from "./overview";
export { DotMap, Gauge, Heatmap, LineChart, Pie } from "./charts";
export { CardHeader, Delta, Flag, Glyph, Panel, Pick, SERIES } from "./parts";
export {
  activity,
  ages,
  channels,
  CHANNELS,
  countries,
  engagementSeries,
  PERIODS,
  today,
  WORLD,
} from "./data";
export type { Channel, ChannelStats, Country, Period } from "./data";

// The whole page, full-bleed: drop it into a route.
export default function DashboardOverviewPage() {
  return <DashboardOverview className="min-h-svh" />;
}
