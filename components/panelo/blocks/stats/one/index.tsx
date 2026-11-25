"use client";

import { SocialOverview } from "./overview";

/* -------------------------------------------------------------------------- */
/*  stats/one preview: the social overview page, live.                        */
/* -------------------------------------------------------------------------- */

export { SocialOverview } from "./overview";
export type { SocialOverviewProps } from "./overview";
export { AreaChart } from "./chart";
export {
  Bar,
  BrandColors,
  BrandIcon,
  Delta,
  Panel,
  PlatformSelect,
} from "./parts";
export {
  audiences,
  insightsFor,
  kpis,
  PLATFORMS,
  posts,
  RANGES,
  revenueChange,
  revenueSeries,
} from "./data";
export type {
  Audience,
  Breakdown,
  Device,
  Insight,
  Kpi,
  Platform,
  Post,
  Range,
} from "./data";

// The whole page, full-bleed: drop it into a route.
export default function SocialOverviewPage() {
  return <SocialOverview className="min-h-svh" />;
}
