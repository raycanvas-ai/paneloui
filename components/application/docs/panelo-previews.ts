import type { ComponentType } from "react"

import { PRO_LOADERS } from "@pro"

// Loads the component behind a catalog item for /preview/[slug], so each preview ships only its own code.
export const PANELO_LOADERS: Record<string, () => Promise<ComponentType>> = {
    ...PRO_LOADERS,
    "dashboard-pages-13": () => import("@/components/panelo/blocks/dashboard-pages/thirteen").then((m) => m.default),
    "calendars-3": () => import("@/components/panelo/blocks/calendars/one").then((m) => m.default),
    "calendars-4": () => import("@/components/panelo/blocks/calendars/two").then((m) => m.default),
    "stats-1": () => import("@/components/panelo/blocks/stats/one").then((m) => m.default),
    "stats-2": () => import("@/components/panelo/blocks/stats/two").then((m) => m.default),
    "stats-3": () => import("@/components/panelo/blocks/stats/three").then((m) => m.default),
    "tables-2": () => import("@/components/panelo/blocks/tables/two").then((m) => m.default),
    "tables-1": () => import("@/components/panelo/blocks/tables/one").then((m) => m.default),
    "sidebars-3": () => import("@/components/panelo/blocks/sidebars/one").then((m) => m.default),
    "elements-1": () => import("@/components/panelo/blocks/elements/one").then((m) => m.default),
    "elements-2": () => import("@/components/panelo/blocks/elements/two").then((m) => m.default),
    "profile-pages-1": () => import("@/components/panelo/blocks/profile-pages/one").then((m) => m.default),
    "login-pages-1": () => import("@/components/panelo/blocks/login-pages/one").then((m) => m.default),
    "login-pages-3": () => import("@/components/panelo/blocks/login-pages/three").then((m) => m.default),
    "login-pages-2": () => import("@/components/panelo/blocks/login-pages/two").then((m) => m.default),
    "sales-trend": () => import("@/components/panelo/blocks/charts/sales-chart").then((m) => m.SalesTrendPanel),
    "revenue-chart": () => import("@/components/panelo/blocks/charts/revenue-chart").then((m) => m.RevenueChart),
    "trends-chart": () => import("@/components/panelo/blocks/charts/trends-chart").then((m) => m.TrendsChart),
    "balance-chart": () => import("@/components/panelo/blocks/charts/balance-chart").then((m) => m.BalanceChart),
    "activity-heatmap": () => import("@/components/panelo/blocks/charts/activity-heatmap").then((m) => m.ActivityHeatmap),
    "contribution-chart": () => import("@/components/panelo/blocks/charts/contribution-chart").then((m) => m.ContributionChart),
    "link-graph": () => import("@/components/panelo/blocks/charts/link-graph").then((m) => m.LinkGraph),
    "pie-chart": () => import("@/components/panelo/blocks/charts/pie-chart").then((m) => m.PieChart),
}
