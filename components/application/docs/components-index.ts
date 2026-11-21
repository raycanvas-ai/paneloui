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
};

/** How a section previews its entries: a live demo, a scaled chart, or a whole screen from /preview/[slug]. */
export type SectionKind = "component" | "chart" | "screen";

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
const pro = (name: string, slug: string, description: string): Entry => ({ name, href: `/components/${slug}`, description, tier: "pro", status: "shipped" });

export const COMPONENT_SECTIONS: Section[] = [
  {
    id: "components",
    title: "Components",
    blurb: "shadcn-compatible parts built on Vercel's UI SDK.",
    kind: "component",
    entries: [
      free("Accordion", "ui-accordion", "Stacked sections that expand one or many at a time."),
      free("Animated Group", "ui-animated-group", "Staggered entrance animation for a set of items."),
      free("Aspect Ratio", "ui-aspect-ratio", "Box that keeps a fixed width-to-height ratio."),
      free("Avatar", "ui-avatar", "Image with an initials fallback."),
      free("Badge", "ui-badge", "Small status label in four variants."),
      free("Border Beam", "ui-border-beam", "Light beam that travels around a card border."),
      free("Brand Logos", "ui-logos", "Vector marks for Vercel, Claude, npm, pnpm, Yarn, Bun and more."),
      free("Breadcrumb", "ui-breadcrumb", "Path trail with separators."),
      free("Button", "ui-button", "Default, outline, secondary, ghost, destructive and link actions."),
      free("Card", "ui-card", "Surface with header, content and footer slots."),
      free("Chart", "ui-chart", "Recharts wrapper with themed colors, tooltip and legend."),
      free("Collapsible", "ui-collapsible", "Show and hide a single panel."),
      free("Dialog", "ui-dialog", "Modal with title, description and close actions."),
      free("Dropdown Menu", "ui-dropdown-menu", "Menus with items, checkboxes, radios, labels and submenus."),
      free("Infinite Slider", "ui-infinite-slider", "Endless marquee for logos and testimonials."),
      free("Input", "ui-input", "Text field with focus and invalid states."),
      free("Label", "ui-label", "Accessible label for a form control."),
      free("Popover", "ui-popover", "Floating panel anchored to a trigger."),
      free("Progress", "ui-progress", "Horizontal bar for upload and task progress."),
      free("Progressive Blur", "ui-progressive-blur", "Layered blur that fades content into an edge."),
      free("Radio Group", "ui-radio-group", "Single choice from a short list."),
      free("Scroll Area", "ui-scroll-area", "Scroll container with a styled, auto-hiding scrollbar."),
      free("Select", "ui-select", "Single-choice list with keyboard typeahead."),
      free("Separator", "ui-separator", "Horizontal or vertical divider."),
      free("Sheet", "ui-sheet", "Drawer from any edge with swipe to close."),
      free("Skeleton", "ui-skeleton", "Loading placeholder."),
      free("Switch", "ui-switch", "On/off toggle for settings."),
      free("Tabs", "ui-tabs", "Tab list with panels and arrow-key navigation."),
      free("Text Effect", "ui-text-effect", "Animated text reveal by word, character or line."),
      free("Textarea", "ui-textarea", "Multiline field that grows with its content."),
      free("Toggle", "ui-toggle", "Two-state button."),
      free("Toggle Group", "ui-toggle-group", "Set of toggles with single or multiple selection."),
      free("Tooltip", "ui-tooltip", "Hint on hover and focus."),
    ],
  },
  {
    id: "dashboard-pages",
    title: "Dashboard Pages",
    blurb: "Full dashboard pages with sidebar context.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Companies CRM Table", "dashboard-pages-1", "CRM companies table with a resizable sidebar, saved views, sort and filter menus, column visibility, row selection, footer calculations, and CSV export."),
      pro("AI Workflow Builder", "dashboard-pages-2", "AI workflow builder with chat-driven automation thread, workflow preview tabs, node-graph editor, and sample output table."),
      pro("Overview Analytics Dashboard", "dashboard-pages-3", "Overview dashboard with revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart."),
      pro("Business Partner CRM", "dashboard-pages-4", "CRM dashboard with a navigation sidebar and a dense data table plus selection, filter and sort toolbar."),
      pro("Project Overview Dashboard", "dashboard-pages-5", "Project dashboard with a collapsible sidebar, breadcrumb bar, project hero, section tabs and a two-column overview."),
      pro("Fintech Project Page", "dashboard-pages-6", "Project page with a workspace sidebar, project document, properties panel and a filterable timeline."),
      pro("Team Inbox", "dashboard-pages-7", "Team inbox with an icon rail, searchable conversation list, threaded conversation with reply box and a details panel."),
      pro("Custom Finance Dashboard", "dashboard-pages-8", "Finance dashboard with a stacked monthly balance chart, payment card and Quick Send, client news, suggestions, plans, weekly limits, budget split and recent transactions."),
      pro("Task Board Dashboard", "dashboard-pages-9", "Task overview with a greeting, AI announcement, four stat cards, board view tabs and a drag-and-drop kanban with keyboard moves."),
      pro("Workflow Builder", "dashboard-pages-10", "Node-based workflow builder: icon rail, searchable node library, a pan-and-zoom canvas with draggable nodes and live edges, and a settings panel that follows the selection."),
      pro("AI Automation Dashboard", "dashboard-pages-11", "AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel, and an Ask AI assistant panel."),
      pro("Marketing Analytics Dashboard", "dashboard-pages-12", "Marketing analytics dashboard with a KPI strip, a three-series trend chart, a tabbed lead inbox with AI score, and channel panels."),
    ],
  },
  {
    id: "login-pages",
    title: "Login Pages",
    blurb: "Sign-in, sign-up and authentication pages.",
    kind: "screen",
    entries: [
      free("Split Login Page", "login-pages-1", "Split-screen login with an email/password form, social sign-in buttons, and an animated orbit of app logos."),
    ],
  },
  {
    id: "sidebars",
    title: "Sidebars",
    blurb: "App sidebars with navigation and workspace switchers.",
    kind: "screen",
    entries: [
      free("Workspace Sidebar", "sidebars-1", "App sidebar with workspace switcher, collapsible dashboard and folder groups, and a pinned footer."),
      free("Workspace Sidebar with Drawer", "sidebars-2", "Workspace sidebar with a workspace switcher, collapsible folders and a mobile drawer."),
    ],
  },
  {
    id: "dashboard-headers",
    title: "Dashboard Headers",
    blurb: "Dashboard topbars with breadcrumbs and actions.",
    kind: "screen",
    entries: [
      free("Dashboard Header", "dashboard-headers-1", "Dashboard header with breadcrumb navigation, share dropdown, and page actions toolbar."),
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
      free("Budget Card", "budget-card", "Budget lines as a legend and one proportional split bar."),
    ],
  },
  {
    id: "calendars",
    title: "Calendars",
    blurb: "Calendars, schedules and agenda views.",
    kind: "screen",
    wide: true,
    entries: [
      pro("Calendar Workspace", "calendars-1", "Calendar workspace with month and week views, a mini month, a schedule panel and a collapsible icon sidebar."),
      pro("Project Calendar", "calendars-2", "Project calendar with multi-day tasks you can drag or move with the keyboard (and AI agents can move), a task editor and a mobile drawer."),
    ],
  },
];

export const ALL_ENTRIES = COMPONENT_SECTIONS.flatMap((section) => section.entries);

export const sectionOf = (href: string) => COMPONENT_SECTIONS.find((section) => section.entries.some((e) => e.href === href));

const slugOf = (href: string) => href.replace("/components/", "");

/** The registry item each catalogue entry installs: components come with agent-ui, everything else is its own item. */
// ponytail: motion, logo and border-beam demos aren't in a registry item yet, so they show no install line.
const NOT_IN_REGISTRY = new Set(["ui-animated-group", "ui-border-beam", "ui-logos", "ui-infinite-slider", "ui-progressive-blur", "ui-text-effect"]);

export function installCommand(href: string): string | undefined {
  const slug = slugOf(href);
  const kind = sectionOf(href)?.kind;
  if (NOT_IN_REGISTRY.has(slug)) return undefined;
  const item = kind === "component" ? "agent-ui" : slug;
  return `npx shadcn@latest add @panelo/${item}`;
}
