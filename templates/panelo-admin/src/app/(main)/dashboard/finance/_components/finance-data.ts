import { addMonths, format, parseISO, subMonths } from "date-fns";

export type RangeKey = "6m" | "12m";

export const RANGES: { key: RangeKey; label: string; months: number }[] = [
  { key: "6m", label: "6 months", months: 6 },
  { key: "12m", label: "12 months", months: 12 },
];

/** Every figure on the screen is as of this day, matching the orders and store data. */
export const AS_OF = parseISO("2026-09-15");

const monthLabel = (date: Date) => format(date, "MMM ''yy");

/* -------------------------------------------------------------- Accounts */

export const accounts = [
  { name: "Operating", bank: "Mercury", last4: "4821", balance: 1_284_500 },
  { name: "Treasury", bank: "4.6% APY", last4: "7710", balance: 2_450_000, apy: 4.6 },
  { name: "Payroll", bank: "Mercury", last4: "1907", balance: 312_000 },
  { name: "EUR account", bank: "Wise", last4: "3390", balance: 186_300, note: "€171,900" },
];

export const cashOnHand = accounts.reduce((sum, account) => sum + account.balance, 0);
export const monthlyInterest = Math.round((2_450_000 * 0.046) / 12);

/* ------------------------------------------------------- Income statement */

// Oct '25 → Sep '26, in dollars. Revenue climbs while spend holds flat, so burn falls every month.
const REVENUE = [452, 468, 481, 497, 515, 529, 548, 561, 574, 588, 597, 612].map((k) => k * 1000);
const EXPENSES = [790, 795, 802, 786, 781, 790, 784, 779, 776, 781, 778, 780].map((k) => k * 1000);
/** Series A landed in January; it's the one month cash goes up. */
const RAISE = { index: 3, amount: 3_500_000, label: "Series A" };

export const months = REVENUE.map((revenue, index) => {
  const expenses = EXPENSES[index];
  return {
    label: monthLabel(subMonths(AS_OF, REVENUE.length - 1 - index)),
    revenue,
    expenses,
    burn: expenses - revenue,
  };
});

export const current = months[months.length - 1];
export const previous = months[months.length - 2];
export const runwayMonths = Math.floor(cashOnHand / current.burn);
export const cashZeroDate = format(addMonths(AS_OF, runwayMonths), "MMM yyyy");
export const grossMargin = { value: 78.4, previous: 76.9 };
export const raise = { label: RAISE.label, amount: RAISE.amount, month: months[RAISE.index].label };

/* ------------------------------------------------------------------- Cash */

export type CashPoint = { label: string; cash: number | null; forecast: number | null };

/** Month-end balances, walked back from today's cash so the chart ends on the accounts total. */
const actualCash = (() => {
  const balances = [cashOnHand];
  for (let index = months.length - 1; index > 0; index--) {
    const raised = index === RAISE.index ? RAISE.amount : 0;
    balances.unshift(balances[0] + months[index].burn - raised);
  }
  return balances;
})();

/** Burn keeps easing by about $7K a month, the trend of the last quarter. */
const FORECAST_BURN = [161, 154, 147, 141, 135, 129].map((k) => k * 1000);

const forecastCash = (() => {
  const balances: number[] = [];
  let balance = cashOnHand;
  for (const burn of FORECAST_BURN) {
    balance -= burn;
    balances.push(balance);
  }
  return balances;
})();

export function getCashSeries(range: RangeKey): CashPoint[] {
  const count = RANGES.find((item) => item.key === range)?.months ?? 12;
  const past = months.map((month, index) => ({
    label: month.label,
    cash: actualCash[index],
    // The forecast starts on the last actual point so the dashed line joins it.
    forecast: index === months.length - 1 ? actualCash[index] : null,
  }));
  const ahead = forecastCash.map((cash, index) => ({
    label: monthLabel(addMonths(AS_OF, index + 1)),
    cash: null,
    forecast: cash,
  }));
  return [...past.slice(-count), ...ahead];
}

export function getMonths(range: RangeKey) {
  const count = RANGES.find((item) => item.key === range)?.months ?? 12;
  return months.slice(-count);
}

/* ---------------------------------------------------------------- Budgets */

// September spend by category; actuals sum to that month's expenses.
export const budgets = [
  { category: "Payroll", spent: 468_000, budget: 470_000 },
  { category: "Cloud & infrastructure", spent: 96_000, budget: 85_000 },
  { category: "Marketing", spent: 88_000, budget: 100_000 },
  { category: "Software & tools", spent: 52_000, budget: 55_000 },
  { category: "Office & operations", spent: 41_000, budget: 45_000 },
  { category: "Travel & other", spent: 35_000, budget: 40_000 },
];

/* ------------------------------------------------------------ Receivables */

export const aging = [
  { label: "Current", amount: 214_600, tone: "bg-[var(--tone-primary)]" },
  { label: "1–30 days", amount: 86_400, tone: "bg-warning-solid" },
  { label: "31–60 days", amount: 31_200, tone: "bg-chart-5" },
  { label: "60+ days", amount: 12_800, tone: "bg-destructive" },
];

export const receivables = [
  { number: "INV-2041", client: "Bright Enterprises", amount: 64_000, due: "2026-09-28" },
  { number: "INV-2036", client: "Northline GmbH", amount: 41_200, due: "2026-09-03" },
  { number: "INV-2029", client: "Cansaas Agency", amount: 18_600, due: "2026-08-08" },
  { number: "INV-2017", client: "Halcyon Labs", amount: 12_800, due: "2026-07-06" },
];

/* --------------------------------------------------------------- Payables */

export const upcomingPayments = [
  { payee: "Payroll run", detail: "Payroll ····1907", amount: 312_000, due: "2026-09-30", auto: true },
  { payee: "Amazon Web Services", detail: "Card ····6038", amount: 48_200, due: "2026-10-01", auto: true },
  { payee: "Office lease", detail: "ACH · Operating", amount: 22_000, due: "2026-10-01", auto: false },
  { payee: "Google Workspace", detail: "Card ····6038", amount: 3_840, due: "2026-10-03", auto: true },
  { payee: "Q3 estimated tax", detail: "ACH · Operating", amount: 64_000, due: "2026-10-15", auto: false },
];

/* ----------------------------------------------------------- Transactions */

export const transactions = [
  { name: "Stripe payout", category: "Revenue", amount: 84_210, date: "2026-09-15" },
  { name: "Bright Enterprises", category: "Invoice INV-2032", amount: 52_000, date: "2026-09-14" },
  { name: "Gusto", category: "Payroll taxes", amount: -41_800, date: "2026-09-14" },
  { name: "Vercel", category: "Cloud & infrastructure", amount: -6_420, date: "2026-09-13" },
  { name: "Figma", category: "Software & tools", amount: -2_250, date: "2026-09-12" },
  { name: "Delta Air Lines", category: "Travel & other", amount: -1_184, date: "2026-09-12" },
];

export function percentChange(value: number, base: number) {
  return base ? Math.round(((value - base) / base) * 1000) / 10 : 0;
}

export const compact = (value: number) =>
  value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(2)}M` : `$${Math.round(value / 1000)}K`;
