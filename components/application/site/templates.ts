// The whole-app templates Panelo sells. Sources live in templates/<slug> (free, public repo) and
// components/panelo/pro/templates/<slug> (Pro, private repo); scripts/build-registry.mts packs each into
// a tarball: public/t/<slug>.tgz for free ones, registry-pro/templates/<slug>.tgz behind /t/pro for Pro.

export type Template = {
  slug: string;
  name: string;
  tier: "free" | "pro";
  tagline: string;
  /** Routes with a page of their own (dynamic ones counted once). */
  pages: number;
  /** A running copy of the template, on its own subdomain. */
  demo: string;
  /** Screenshots in public/templates/<slug>/, first one is the cover. */
  shots: { file: string; label: string }[];
  screens: { area: string; items: string[] }[];
  highlights: string[];
};

export const SITE = "https://www.paneloui.com";

export const TEMPLATES: Template[] = [
  {
    slug: "panelo-admin",
    name: "Panelo Admin",
    tier: "free",
    tagline: "A complete admin for SaaS products, internal tools and commerce back offices.",
    pages: 43,
    demo: "https://demo-admin.paneloui.com/dashboard/default",
    shots: [
      { file: "default", label: "Overview" },
      { file: "analytics", label: "Analytics" },
      { file: "ecommerce", label: "Ecommerce" },
      { file: "kanban", label: "Kanban" },
      { file: "mail", label: "Mail" },
      { file: "login", label: "Sign in" },
    ],
    screens: [
      { area: "Dashboards", items: ["Overview", "Ecommerce", "Finance", "Analytics", "Portfolio"] },
      { area: "Apps", items: ["Chat", "Mail", "Calendar", "Kanban", "Docs", "Automations"] },
      { area: "Commerce", items: ["Products", "Product detail", "Orders", "Order detail", "Checkout", "Pricing"] },
      { area: "Management", items: ["Users", "User profile", "Roles & permissions", "Companies", "Invoices"] },
      { area: "Account", items: ["General", "Security", "Notifications", "Billing", "API keys", "Onboarding"] },
      { area: "Pages", items: ["Notifications", "Activity log", "Search", "Help center", "Changelog", "Coming soon", "404", "500", "Maintenance"] },
      { area: "Auth", items: ["Login", "Register", "Forgot password", "Reset password", "Verify email", "Two-factor", "Lock screen"] },
    ],
    highlights: [
      "Light and dark, plus Ember, Graphite and Harbor presets",
      "Theme, font and width preferences that apply before first paint",
      "Shared sample data, so orders, products and invoices agree across pages",
      "Working drag-and-drop board, mail, chat, filters, CSV export and ⌘K search",
    ],
  },
  {
    slug: "propflow",
    name: "Propflow",
    tier: "pro",
    tagline: "A real-estate CRM: listings, viewings, clients and reports, ready for your agency.",
    pages: 13,
    demo: "https://demo-propflow.paneloui.com/dashboard/overview",
    shots: [
      { file: "overview", label: "Overview" },
      { file: "properties", label: "Properties" },
      { file: "calendar", label: "Tours" },
      { file: "clients", label: "Clients" },
      { file: "reports", label: "Reports" },
      { file: "login", label: "Sign in" },
    ],
    screens: [
      { area: "Dashboard", items: ["KPIs", "Viewing activity", "Next viewings", "Clients by status"] },
      { area: "Properties", items: ["Grid and map", "List with bulk actions", "Filters", "Add property"] },
      { area: "Property", items: ["Gallery", "Details", "Availability rules", "Viewers as list or board"] },
      { area: "New listing", items: ["Details", "Specifications", "Photo upload", "Viewing schedule"] },
      { area: "Clients", items: ["Inline status and feedback", "Detail sheet", "Viewing history"] },
      { area: "Calendar", items: ["Day-grouped tours with route", "Month grid", "CSV export"] },
      { area: "Reports", items: ["Price change", "Deal conversion", "Agent performance", "CSV and PDF export"] },
      { area: "Auth", items: ["Sign in", "Sign up", "Email code", "Invite team"] },
    ],
    highlights: [
      "Estate, Sand, Ember and Harbor themes, each light and dark",
      "Four-step listing wizard with drag-and-drop photos",
      "Tours grouped by day with a route view and CSV export",
      "Reports with CSV and PDF export",
    ],
  },
];

export const templateBySlug = (slug: string) => TEMPLATES.find((t) => t.slug === slug);

/** The one command that gets a template; Pro reads the licence key from the shell. */
export function downloadCommand(t: Template) {
  return t.tier === "free"
    ? `curl -fsSL ${SITE}/t/${t.slug}.tgz | tar -xz && cd ${t.slug}`
    : `curl -fsSL -H "Authorization: Bearer $PANELO_LICENSE_KEY" ${SITE}/t/pro/${t.slug}.tgz | tar -xz && cd ${t.slug}`;
}
