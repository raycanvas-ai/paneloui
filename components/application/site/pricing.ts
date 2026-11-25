import { ALL_ENTRIES } from "@/components/application/docs/components-index";

// The one source for Panelo's plans: the pricing cards, the structured data on the home page and
// /llms.txt all read these, so a price can't say one thing on the page and another to a search engine.

const freeCount = ALL_ENTRIES.filter((e) => e.tier === "free").length;

// Paid plans charge list price minus the launch code, which /checkout applies before the buyer
// arrives (app/checkout/route.ts). Keep LAUNCH_OFF in step with that code in Dodo.
export const LAUNCH_OFF = 50;
// When the early-bird offer ends (end of November, IST). The launch bar counts down to it and hides after.
// Keep in step with the code's expiry in Dodo.
export const LAUNCH_ENDS = new Date("2026-11-30T23:59:59+05:30").getTime();

// Partner deals: dollars off on top of the launch price, for the listed plans. Each is a flat Dodo code of
// LAUNCH_OFF + extra, restricted in Dodo to the same plans' products. /deal/<code> stores it in DEAL_COOKIE,
// /checkout applies it in place of the launch code, and the pricing cards show the deal price. Only codes
// listed here are honoured.
type PaidPlan = NonNullable<Plan["plan"]>;
export const DEALS: Record<string, { extra: number; partner: string; plans: PaidPlan[] }> = {
  // Shadcn Labs' audience: Lifetime for $149 ($80 off the $229 list price).
  SHADCNLABS20: { extra: 30, partner: "Shadcn Labs", plans: ["lifetime"] },
};
export const DEAL_COOKIE = "panelo_deal";

/** The deal a Cookie header (or document.cookie) carries, if it names one listed in DEALS. */
export function dealFrom(cookies: string | null | undefined) {
  const code = cookies?.match(new RegExp(`(?:^|;\\s*)${DEAL_COOKIE}=([A-Z0-9]+)`))?.[1];
  return code && Object.hasOwn(DEALS, code) ? { code, ...DEALS[code] } : null;
}
export type Deal = NonNullable<ReturnType<typeof dealFrom>>;

/** The extra a deal takes off this plan: its `extra` for the plans it lists, nothing for the rest. */
export const dealExtra = (deal: Deal | null, plan: Plan["plan"]) => (deal && plan && deal.plans.includes(plan) ? deal.extra : 0);
const SHARED = ["Use it in unlimited projects", "Keep the code forever"];
const PRO = ["Every Pro dashboard page", "Every Pro calendar", "Pro app templates, from Dec 1", "Agent-ready UI SDK parts", "Light and dark themes"];

// `plan` names the product /checkout sells; the free plan links to the catalogue instead.
export type Plan = { name: string; blurb: string; price: number | null; cta: string; plan?: "year" | "lifetime" | "startups"; featured?: boolean; features: string[] };

export const PLANS: Plan[] = [
  {
    name: "Starter",
    blurb: "The fundamentals of Panelo, free. Perfect for indie developers.",
    price: null,
    cta: "Browse free",
    features: ["Free user license", ...SHARED, "Free component updates", `${freeCount} free components`, "Free app template, from Dec 1", "Agent-ready UI SDK parts", "Light and dark themes"],
  },
  {
    name: "1 Year of Updates",
    blurb: "Every Panelo Pro page, calendar and block.",
    price: 129,
    cta: "Buy now",
    plan: "year",
    features: ["Single-user license", ...SHARED, "Pro updates for 1 year", ...PRO],
  },
  {
    name: "Lifetime Access",
    blurb: "Every Panelo Pro page, calendar and block, updated forever.",
    price: 179,
    cta: "Buy now",
    plan: "lifetime",
    featured: true,
    features: ["Single-user license", ...SHARED, "Pro updates forever", ...PRO],
  },
  {
    name: "Unlimited for Startups",
    blurb: "Everything in Pro, licensed for up to 5 developers.",
    price: 299,
    cta: "Buy now",
    plan: "startups",
    features: ["5-user license", ...SHARED, "Pro updates forever", ...PRO],
  },
];

/** List price before the launch code: what Dodo's product is priced at. */
export const listPrice = (plan: Plan) => (plan.price === null ? null : plan.price + LAUNCH_OFF);
