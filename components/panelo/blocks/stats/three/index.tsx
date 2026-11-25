"use client";

import { CryptoOverview } from "./overview";

/* -------------------------------------------------------------------------- */
/*  stats/three preview: the crypto portfolio page, live.                      */
/* -------------------------------------------------------------------------- */

export { CryptoOverview } from "./overview";
export type { CryptoOverviewProps } from "./overview";
export { PortfolioChart, Sparkline } from "./chart";
export {
  CardTitle,
  Change,
  CoinMark,
  CurrencyContext,
  Panel,
  Segmented,
  SortButton,
  useMoney,
} from "./parts";
export type { Currency, Sort } from "./parts";
export {
  COINS,
  GAINERS,
  HOLDINGS,
  LEADERS,
  MARKETS,
  portfolio,
  TICKERS,
  trend,
} from "./data";
export type { Coin, CoinId, Gainer, MarketRow, Range } from "./data";

// The whole page, full-bleed: drop it into a route.
export default function CryptoOverviewPage() {
  return <CryptoOverview className="min-h-svh" />;
}
