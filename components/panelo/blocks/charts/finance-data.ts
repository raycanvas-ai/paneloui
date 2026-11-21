/* Finance demo data for the balance chart (shared with dashboard-pages-8). */

/** Card surface shared by every widget. */
export const card = 'rounded-lg border border-border/70 bg-card shadow-xs'
/** Widget title. */
export const cardTitle = 'text-base font-medium leading-6 tracking-tight'
/** Focus ring for hand-rolled controls. */
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
/** "$150,800"; `cents` for "−$50.00" style amounts. */
export const money = (v: number, cents = false) => (cents ? usdCents : usd).format(v).replace('-', '−')

/* -------------------------------------------------------------------------- */
/*  Current balance: monthly totals by category, Jan–Nov 2027                   */
/* -------------------------------------------------------------------------- */

export const categories = [
    { key: 'merchandise', label: 'Merchandise', swatch: 'bg-tone-blue-solid/75' },
    // Violet → rose through oklch lands on fuchsia; the theme has no fuchsia token of its own.
    { key: 'recurrings', label: 'Recurrings', swatch: 'bg-[color-mix(in_oklch,var(--tone-violet-solid),var(--ai-from))]' },
    { key: 'savings', label: 'Savings', swatch: 'bg-tone-yellow-solid' },
] as const
export type CategoryKey = (typeof categories)[number]['key']
export type Month = { label: string; name: string } & Record<CategoryKey, number>

const m = (label: string, name: string, merchandise: number, recurrings: number, savings: number): Month => ({ label, name, merchandise, recurrings, savings })

export const months: Month[] = [
    m('Jan 27', 'January 2027', 70_400, 13_100, 20_700),
    m('Feb 27', 'February 2027', 57_200, 34_100, 19_300),
    m('Mar 27', 'March 2027', 51_300, 58_200, 19_400),
    m('Apr 27', 'April 2027', 14_200, 12_400, 14_100),
    m('May 27', 'May 2027', 38_900, 13_300, 18_200),
    m('Jun 27', 'June 2027', 84_100, 35_000, 18_900),
    m('Jul 27', 'July 2027', 102_300, 32_300, 12_300),
    m('Aug 27', 'August 2027', 73_200, 14_800, 25_400),
    m('Sep 27', 'September 2027', 52_400, 29_100, 26_300),
    m('Oct 27', 'October 2027', 88_700, 17_600, 20_200),
    m('Nov 27', 'November 2027', 90_910, 44_170, 15_720),
]

export const total = (month: Month) => month.merchandise + month.recurrings + month.savings
export const CHART_MAX = 180_000
export const CHART_STEP = 30_000
