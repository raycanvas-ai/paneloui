/**
 * The catalogue: the Panelo components (components/panelo), grouped by the
 * block categories of the Panelo registry. Plain data, shared by the
 * landing, the docs sidebar, the /components index and each item's page.
 */

export type Entry = {
  name: string;
  href: string;
  description: string;
  tier: "free" | "pro";
  status: "shipped" | "planned";
  /** Pro only: the registry item of a skill that teaches the buyer's agent this page's style (its `skill/` folder). */
  style?: string;
};

/** How a section previews its entries: a live demo, a scaled chart, or a whole screen from /preview/[slug]. */
export type SectionKind = "chart" | "screen";

export type Section = {
  /** The registry's category slug, also the section's anchor on /components. */
  id: string;
  title: string;
  blurb: string;
  kind: SectionKind;
  entries: Entry[];
  /** Halves the column count: a whole app screen is unreadable at a third of the width. */
  wide?: boolean;
};

const free = (name: string, slug: string, description: string): Entry => ({ name, href: `/components/${slug}`, description, tier: "free", status: "shipped" });
const pro = (name: string, slug: string, description: string, style?: string): Entry => ({ name, href: `/components/${slug}`, description, tier: "pro", status: "shipped", style });

export const COMPONENT_SECTIONS: Section[] = [
  {
    id: "analytics",
    title: "Analytics",
    blurb: "Analytics dashboards, KPI overviews and portfolios.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Overview Analytics Dashboard", "dashboard-pages-3", "Overview dashboard with revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart."),
      pro("Marketing Analytics Dashboard", "dashboard-pages-12", "Marketing report: a headline that says what changed, four KPIs that redraw a dot-matrix chart against the previous period with campaign markers, a ranked channel ledger, a dot-matrix pipeline and a lead inbox with AI scores. One range drives every number."),
      free("Social Overview", "stats-1", "Social media KPI page: a stat card per channel with week-on-week change, a revenue area chart with hover and keyboard readout, audience by location, age and gender, a posting week with post cards, and per-post insights. Date range, CSV export, Keyline icons."),
      free("Dashboard Overview", "stats-2", "Social dashboard: a goal gauge with a segment per channel, channel cards, follower share and a year of engagement with a split readout, a day-by-hour activity heatmap with channel filters and a named peak, audience by age and a dot-matrix world map by country."),
      free("Crypto Portfolio", "stats-3", "Crypto portfolio page: tickers, market leaders by volume, a portfolio line with a scrubber and readout, a markets table with search, filters, sort, trend window and CSV export, a live balance with deposit, withdraw, swap and transfer, top assets and a gainers watchlist."),
    ],
  },
  {
    id: "tables",
    title: "Tables",
    blurb: "Data tables with sorting, filtering and pagination.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Business Partner CRM", "dashboard-pages-4", "CRM dashboard with a navigation sidebar and a dense data table plus selection, filter and sort toolbar."),
      free("Records Table", "tables-2", "Database-style records table for any row type: saved views, column filters, header sort, search, row selection, drag to reorder, pages, CSV export and live presence. Pinned first column on small screens, Keyline icons."),
      free("Task Table", "tables-1", "Project task table with search, filters, sort and per-group pages: an Overview of grouped project panels, a List and a classic Table view with sortable columns. Container-responsive, Keyline icons."),
    ],
  },
  {
    id: "workflows",
    title: "Workflows",
    blurb: "Workflow builders and AI automation.",
    kind: "screen",
    wide: true,
    entries: [
      pro("AI Workflow Builder", "dashboard-pages-2", "AI workflow builder with chat-driven automation thread, workflow preview tabs, node-graph editor, and sample output table."),
      pro("Workflow Builder", "dashboard-pages-10", "Node-based workflow builder: icon rail, searchable node library, a pan-and-zoom canvas with draggable nodes and live edges, and a settings panel that follows the selection."),
      pro("AI Automation Dashboard", "dashboard-pages-11", "AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel, and an Ask AI assistant panel."),
    ],
  },
  {
    id: "projects",
    title: "Projects",
    blurb: "Project overviews, project docs and task boards.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Project Overview Dashboard", "dashboard-pages-5", "Project dashboard with a collapsible sidebar, breadcrumb bar, project hero, section tabs and a two-column overview."),
      pro("Fintech Project Page", "dashboard-pages-6", "Project page with a workspace sidebar, project document, properties panel and a filterable timeline."),
      pro("Issue Tracker", "dashboard-pages-14", "A team's issues grouped by status in an inset panel: filters as editable chips with a menu per field, a quick filter by person, status, priority and assignee changed in place, sub-issues that fold under their parent, blocking relations and a hover card per issue.", "issue-tracker-style"),
      pro("Task Board Dashboard", "dashboard-pages-9", "Task overview with a greeting, AI announcement, four stat cards, board view tabs and a drag-and-drop kanban with keyboard moves."),
    ],
  },
  {
    id: "calendars",
    title: "Calendars",
    blurb: "Calendars, schedules and agenda views.",
    kind: "screen",
    wide: true,
    entries: [
      free("Home Care Schedule", "dashboard-pages-13", "Home-care dispatch board: caregivers on a timeline with live status, drive times and a now line, visit cards, day and week views, area filters and new visits with clash checks."),
      pro("Time Tracking Calendar", "calendars-1", "Time-tracking week: log entries from a top bar, drag to move or resize, click or drag to add, labels, favourites, search, and a Customize panel that remembers your layout."),
      pro("Issue Calendar", "calendars-2", "Month and week calendar of issues: multi-day spans, drag to reschedule or stretch, a category panel you can drag from, tick-off sync, filters, search and a phone agenda."),
      free("Planner Calendar", "calendars-3", "Week planner with a to-do sidebar: day, week and month views, a live now-line and next-up card, event cards with members, join link and replies, click-to-add events and a month picker. Sidebar folds to a drawer, Keyline icons."),
      free("Appointment Calendar", "calendars-4", "Booking calendar for studios, salons and clinics: day, week, month and staff views, status and staff filters, stat cards with week-on-week trends, click-a-slot booking, appointment cards with status, a waitlist with auto-fill and undo. Keyline icons."),
    ],
  },
  {
    id: "inbox",
    title: "Inbox",
    blurb: "Team inbox with threads, replies and a details panel.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Team Inbox", "dashboard-pages-7", "Team inbox with an icon rail, searchable conversation list, threaded conversation with reply box and a details panel."),
    ],
  },
  {
    id: "settings",
    title: "Settings",
    blurb: "Settings pages that drop into any app.",
    kind: "screen",
    wide: true,
    entries: [
      free("Appearance Settings", "settings-1", "Appearance settings page with no app shell: company logo upload, brand colour swatches with a custom hex that tints the page live, theme and table-density picture cards, a sidebar switch and select, and Save and Cancel."),
    ],
  },
  {
    id: "profile-pages",
    title: "Profiles",
    blurb: "Profile pages for people, creators and teams.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Team Member Profile", "profile-pages-2", "Profile with a banner and verified avatar, a ringing video call and a message drawer that replies, an expanding about with contact details, and sortable role cards that open each role's story."),
      free("Designer Profile", "profile-pages-1", "Designer profile with cover and verified avatar, follow, hire request and message thread, an about card that expands, save-to-list, skills that filter a case-study carousel, and a detail view per project."),
    ],
  },
  {
    id: "login-pages",
    title: "Logins",
    blurb: "Sign-in, sign-up and authentication pages.",
    kind: "screen",
    entries: [
      free("Split Login Page", "login-pages-1", "Split-screen login with an email/password form, social sign-in buttons, and an animated orbit of app logos."),
      free("Painted Login Page", "login-pages-3", "Editorial login on a paper card over a generated pointillist painting that paints itself in, with a serif headline and a submit that appears when the form is ready."),
      free("Sign Up Flow", "login-pages-2", "Three-step sign-up beside a violet art panel that tracks progress: account with validation, workspace with a live URL, then profile."),
    ],
  },
  {
    id: "sidebars",
    title: "Sidebars",
    blurb: "App sidebars with navigation and workspace switchers.",
    kind: "screen",
    entries: [
      pro("App Sidebar", "sidebars-1", "Icon rail and panel in five layouts: rail with panel, panel alone, rail with icons, rail alone and icons alone, with a command menu, collapsible sections and projects."),
      pro("Sidebar Collection", "sidebars-2", "Five product sidebars from one kit: workspace, enterprise, chat, HR and assistant. Folding trees and sections, section search, inline create, chat filters, command search, trial and upgrade cards."),
      free("Resource Sidebar", "sidebars-3", "Icon rail beside a resource panel: pages with a More flyout, a scrolling list of emoji collections and a pinned import action. Four layouts, every list a prop, Keyline icons."),
    ],
  },
  {
    id: "charts",
    title: "Charts",
    blurb: "Area, bar and line chart cards.",
    kind: "chart",
    entries: [
      free("Sales Trend", "sales-trend", "User-growth pixel chart with a weekly, monthly or yearly toggle and a hover readout."),
      free("Revenue Lines", "revenue-chart", "Dual-line revenue chart with keyboard-navigable points and a hover readout."),
      free("Trends Chart", "trends-chart", "Three-series marketing trends chart with keyboard navigation."),
      free("Balance Chart", "balance-chart", "Stacked monthly balance bars with a breakdown on hover and a table view."),
      free("Activity Heatmap", "activity-heatmap", "Hour-by-day heatmap with a forecast in grey, day to year views, keyboard navigation and a spreadsheet view."),
      free("Contribution Chart", "contribution-chart", "A year of daily activity as a calendar heatmap or an isometric 3D city of bars, with streak and busiest-day stats, linked hover and keyboard navigation."),
      free("Link Graph", "link-graph", "Network of who mentions, links to and is cited by a site: hubs, clusters and an outer ring of mentions, with search, filters and a 3D view you can orbit."),
      free("Rounded Pie", "pie-chart", "Part-to-whole pie with rounded slices and even gaps, shaded by share, with a linked legend that lifts each slice."),
    ],
  },
  {
    id: "elements",
    title: "Elements",
    blurb: "Dashboard sections, cards and empty states.",
    kind: "screen",
    entries: [
      free("AI Workforce Section", "elements-1", "AI workforce showcase with an agent card strip, centered headline, and add-agent call to action."),
      free("AI Workforce Command", "elements-2", "AI workforce section with a command palette of agents and actions."),
    ],
  },
];

export const ALL_ENTRIES = COMPONENT_SECTIONS.flatMap((section) => section.entries);

export const sectionOf = (href: string) => COMPONENT_SECTIONS.find((section) => section.entries.some((e) => e.href === href));

const slugOf = (href: string) => href.replace("/components/", "");

/** Each catalogue entry is its own registry item; its UI SDK parts come along as dependencies. */
export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export const PACKAGE_MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];
/** How each package manager runs a one-off CLI, and adds packages. */
export const RUNNER: Record<PackageManager, string> = { pnpm: "pnpm dlx", npm: "npx", yarn: "yarn", bun: "bunx --bun" };
export const ADD: Record<PackageManager, string> = { pnpm: "pnpm add", npm: "npm install", yarn: "yarn add", bun: "bun add" };

export function installCommand(href: string, pm: PackageManager = "npm"): string {
  // @panelo is in the shadcn CLI's built-in registry index (shadcn-ui/ui#12850), so free items need no
  // components.json setup. Pro items come from the keyed registry (@panelo-pro), set up on the account page.
  const pro = ALL_ENTRIES.find((e) => e.href === href)?.tier === "pro";
  return `${RUNNER[pm]} shadcn@latest add ${pro ? `@panelo-pro/${slugOf(href)}` : `@panelo/${slugOf(href)}`}`;
}
