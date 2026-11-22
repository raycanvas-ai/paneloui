export type PlanId = "starter" | "growth" | "scale";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** Whole dollars per seat, per month. */
  monthly: number;
  /** Whole dollars per seat, per month, when billed yearly. */
  annual: number;
  highlights: string[];
}

export const CURRENT_PLAN: PlanId = "starter";
export const RECOMMENDED_PLAN: PlanId = "growth";

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams getting their first workflows off the ground.",
    monthly: 19,
    annual: 15,
    highlights: ["Up to 5 seats", "10 projects", "5 GB file storage", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing teams that need automation, reporting and guest access.",
    monthly: 49,
    annual: 39,
    highlights: [
      "Up to 50 seats",
      "Unlimited projects",
      "100 GB file storage",
      "Workflow automations",
      "Priority support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    description: "For organizations with security reviews, SSO and compliance needs.",
    monthly: 129,
    annual: 103,
    highlights: [
      "Unlimited seats",
      "1 TB file storage",
      "SAML SSO and SCIM",
      "Audit log exports",
      "Dedicated success manager",
    ],
  },
];

type Cell = boolean | string;

export const comparison: { group: string; rows: { feature: string; values: Record<PlanId, Cell> }[] }[] = [
  {
    group: "Workspace",
    rows: [
      { feature: "Seats", values: { starter: "5", growth: "50", scale: "Unlimited" } },
      { feature: "Projects", values: { starter: "10", growth: "Unlimited", scale: "Unlimited" } },
      { feature: "File storage", values: { starter: "5 GB", growth: "100 GB", scale: "1 TB" } },
      { feature: "Version history", values: { starter: "7 days", growth: "90 days", scale: "Unlimited" } },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Guest access", values: { starter: false, growth: true, scale: true } },
      { feature: "Workflow automations", values: { starter: false, growth: true, scale: true } },
      { feature: "Custom reports", values: { starter: false, growth: true, scale: true } },
    ],
  },
  {
    group: "Security",
    rows: [
      { feature: "Two-factor authentication", values: { starter: true, growth: true, scale: true } },
      { feature: "SAML SSO and SCIM", values: { starter: false, growth: false, scale: true } },
      { feature: "Audit log", values: { starter: false, growth: "30 days", scale: "Unlimited" } },
    ],
  },
  {
    group: "Support",
    rows: [
      { feature: "Response time", values: { starter: "48 hours", growth: "4 hours", scale: "1 hour" } },
      { feature: "Dedicated success manager", values: { starter: false, growth: false, scale: true } },
    ],
  },
];

export const faqs = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. Upgrades apply immediately and we charge the prorated difference. Downgrades take effect at the end of your current billing period.",
  },
  {
    question: "How does per-seat billing work?",
    answer:
      "You pay for active members only. Guests are free, and a seat is released the moment you deactivate someone, so you are never billed for people who left.",
  },
  {
    question: "What happens when I cancel?",
    answer:
      "Your workspace stays read-only for 30 days so you can export everything. After that, data is permanently deleted from our servers and backups.",
  },
  {
    question: "Do you offer discounts for nonprofits or education?",
    answer: "Registered nonprofits and accredited schools get 50% off any plan. Contact sales with proof of status.",
  },
];
