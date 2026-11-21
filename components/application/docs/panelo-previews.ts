import type { ComponentType } from "react"

import { PRO_LOADERS } from "@pro"

// Loads the component behind a catalog item for /preview/[slug], so each preview ships only its own code.
export const PANELO_LOADERS: Record<string, () => Promise<ComponentType>> = {
    ...PRO_LOADERS,
    "dashboard-headers-1": () => import("@/components/panelo/blocks/dashboard-headers/one").then((m) => m.default),
    "elements-1": () => import("@/components/panelo/blocks/elements/one").then((m) => m.default),
    "elements-2": () => import("@/components/panelo/blocks/elements/two").then((m) => m.default),
    "login-pages-1": () => import("@/components/panelo/blocks/login-pages/one").then((m) => m.default),
    "sidebars-1": () => import("@/components/panelo/blocks/sidebars/one").then((m) => m.default),
    "sidebars-2": () => import("@/components/panelo/blocks/sidebars/two").then((m) => m.default),
    "sales-trend": () => import("@/components/panelo/blocks/charts/sales-chart").then((m) => m.SalesTrendPanel),
    "revenue-chart": () => import("@/components/panelo/blocks/charts/revenue-chart").then((m) => m.RevenueChart),
    "trends-chart": () => import("@/components/panelo/blocks/charts/trends-chart").then((m) => m.TrendsChart),
    "balance-chart": () => import("@/components/panelo/blocks/charts/balance-chart").then((m) => m.BalanceChart),
    "budget-card": () => import("@/components/panelo/blocks/charts/budget-card").then((m) => m.BudgetCard),
}
