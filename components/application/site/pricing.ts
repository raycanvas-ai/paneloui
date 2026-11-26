import { ALL_ENTRIES } from "@/components/application/docs/components-index";

// The one source for Panelo's plans: the pricing cards, the structured data on the home page and
// /llms.txt all read these, so a price can't say one thing on the page and another to a search engine.

const freeCount = ALL_ENTRIES.filter((e) => e.tier === "free").length;

// Paid plans sell at `price`: Dodo's products are priced there, with the launch discount already taken
// off, so checkout keeps its code box free for partner codes. Keep LAUNCH_OFF in step with those prices.
export const LAUNCH_OFF = 50;
// When the early-bird offer ends (end of November, IST). The launch bar counts down to it and hides after.
// Keep in step with the code's expiry in Dodo.
export const LAUNCH_ENDS = new Date("2026-11-30T23:59:59+05:30").getTime();
const SHARED = ["Use it in unlimited projects", "Keep the code forever"];
const PRO = ["Every Pro dashboard page", "Every Pro calendar", "Pro app templates, from Dec 1", "Style skills: your coding agent builds new pages in a Pro page's style", "Agent-ready UI SDK parts", "Light and dark themes"];

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

/** List price before the launch discount, shown struck through. */
export const listPrice = (plan: Plan) => (plan.price === null ? null : plan.price + LAUNCH_OFF);
