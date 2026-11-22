import {
  CreditCard,
  KeyRound,
  LayoutDashboard,
  type LucideIcon,
  PlugZap,
  Rocket,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

export const categories: { title: string; description: string; articles: number; icon: LucideIcon }[] = [
  {
    title: "Getting started",
    description: "Set up your workspace, invite your team and import data.",
    articles: 14,
    icon: Rocket,
  },
  {
    title: "Dashboards",
    description: "Build widgets, share views and schedule reports.",
    articles: 22,
    icon: LayoutDashboard,
  },
  { title: "Team & permissions", description: "Roles, groups, SSO and seat management.", articles: 11, icon: Users },
  {
    title: "Billing & plans",
    description: "Invoices, payment methods, upgrades and refunds.",
    articles: 9,
    icon: CreditCard,
  },
  { title: "Automations", description: "Triggers, scheduled workflows and run history.", articles: 17, icon: Workflow },
  { title: "Integrations", description: "Connect Slack, GitHub, Linear and 40+ tools.", articles: 26, icon: PlugZap },
  {
    title: "API & webhooks",
    description: "Authentication, rate limits and event payloads.",
    articles: 19,
    icon: KeyRound,
  },
  {
    title: "Security & privacy",
    description: "2FA, audit logs, data retention and compliance.",
    articles: 8,
    icon: ShieldCheck,
  },
];

export const popularArticles = [
  { title: "Invite teammates and assign roles", category: "Team & permissions", minutes: 3 },
  { title: "Connect Slack to get alerts in a channel", category: "Integrations", minutes: 4 },
  { title: "Create and rotate API keys safely", category: "API & webhooks", minutes: 5 },
  { title: "Share a dashboard with people outside Panelo", category: "Dashboards", minutes: 2 },
  { title: "Change your plan or number of seats", category: "Billing & plans", minutes: 3 },
  { title: "Set up SAML single sign-on with Okta", category: "Security & privacy", minutes: 7 },
];

export const faqs = [
  {
    question: "Can I change plans in the middle of a billing cycle?",
    answer:
      "Yes. Upgrades apply immediately and you are charged a prorated amount for the rest of the cycle. Downgrades take effect at the start of the next cycle, so you keep your current limits until then.",
  },
  {
    question: "How do I export my workspace data?",
    answer:
      "Go to Settings → General and choose Export workspace. We email a download link for a ZIP of CSV and JSON files within a few minutes. Links expire after 24 hours.",
  },
  {
    question: "What happens when a teammate leaves?",
    answer:
      "Deactivate them from the Team page. Their dashboards, tasks and docs stay in place and can be reassigned, and their seat is freed on your next invoice.",
  },
  {
    question: "Which regions is my data stored in?",
    answer:
      "Workspaces are hosted in the US by default. Team and Enterprise plans can choose EU (Frankfurt) hosting when the workspace is created.",
  },
  {
    question: "Do you offer discounts for startups or nonprofits?",
    answer:
      "Eligible startups get 50% off the Team plan for the first year, and registered nonprofits get 30% off any plan. Contact support with your details to apply.",
  },
];
