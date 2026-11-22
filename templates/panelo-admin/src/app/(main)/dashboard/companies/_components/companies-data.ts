export type Tone = "blue" | "purple" | "green" | "teal" | "amber" | "olive" | "red" | "gray";

/**
 * Badge palettes: fill / hairline / label. The dark values are sampled off the
 * reference mock, so they stay as hex; light mode pairs each with the matching
 * Tailwind tint, because the sampled fills go black on a white ground.
 */
export const TONES: Record<Tone, string> = {
  blue: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  purple: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  teal: "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  olive: "border-yellow-500/25 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  red: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  gray: "border-border bg-muted text-muted-foreground",
};

export interface Tag {
  label: string;
  tone: Tone;
}

export interface Company {
  id: string;
  name: string;
  tags: Tag[];
  /** Rendered as a "+N" chip after the visible tags. */
  moreTags?: number;
  owner: string;
  openDeals: number;
  pipeline: number;
  win: number;
  lastDate: string;
  lastLabel: string;
  health: "Healthy" | "At Risk" | "Watch";
}

const t = (label: string, tone: Tone): Tag => ({ label, tone });

export const companies: Company[] = [
  {
    id: "lvmh",
    name: "LVMH",
    tags: [t("Enterprise", "blue"), t("Upsell", "purple")],
    moreTags: 2,
    owner: "Sarah Nguyen",
    openDeals: 7,
    pipeline: 420000,
    win: 70,
    lastDate: "Feb 21",
    lastLabel: "QBR Call",
    health: "Healthy",
  },
  {
    id: "disney",
    name: "Disney",
    tags: [t("Enterprise", "blue"), t("New Logo", "green")],
    owner: "James Taylor",
    openDeals: 4,
    pipeline: 311242,
    win: 51,
    lastDate: "Feb 22",
    lastLabel: "Demo",
    health: "Healthy",
  },
  {
    id: "paypal",
    name: "Paypal",
    tags: [t("Enterprise", "blue")],
    owner: "Maria Keller",
    openDeals: 5,
    pipeline: 124232,
    win: 22,
    lastDate: "Mar 12",
    lastLabel: "Security",
    health: "At Risk",
  },
  {
    id: "united",
    name: "United Airlines",
    tags: [t("Renewal", "green")],
    owner: "Nia Jameson",
    openDeals: 2,
    pipeline: 221231,
    win: 77,
    lastDate: "Mar 17",
    lastLabel: "Legal",
    health: "Healthy",
  },
  {
    id: "apple",
    name: "Apple",
    tags: [t("Pilot", "amber")],
    owner: "Alex Santos",
    openDeals: 6,
    pipeline: 530111,
    win: 82,
    lastDate: "Mar 12",
    lastLabel: "Exec",
    health: "Healthy",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    tags: [t("Strategic", "red"), t("Expansion", "green")],
    owner: "Mark Darnalds",
    openDeals: 8,
    pipeline: 320222,
    win: 86,
    lastDate: "Mar 15",
    lastLabel: "Pilot",
    health: "Healthy",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    tags: [t("Upsell", "purple"), t("Expansion", "green")],
    moreTags: 2,
    owner: "Drew Nash",
    openDeals: 3,
    pipeline: 122230,
    win: 51,
    lastDate: "Mar 18",
    lastLabel: "Pricing",
    health: "Watch",
  },
  {
    id: "intercom",
    name: "Intercom",
    tags: [t("Enterprise", "blue"), t("Mid-Market", "green")],
    owner: "Lina Wong",
    openDeals: 5,
    pipeline: 230112,
    win: 61,
    lastDate: "Mar 28",
    lastLabel: "Product",
    health: "Healthy",
  },
  {
    id: "attio",
    name: "Attio",
    tags: [t("Mid-Market", "green"), t("Upsell", "purple")],
    moreTags: 2,
    owner: "Jamie Fox",
    openDeals: 2,
    pipeline: 420222,
    win: 38,
    lastDate: "Jun 14",
    lastLabel: "Pricing",
    health: "Watch",
  },
  {
    id: "google",
    name: "Google",
    tags: [t("SMB", "olive"), t("Enterprise", "blue")],
    moreTags: 2,
    owner: "Kate Chen",
    openDeals: 8,
    pipeline: 112277,
    win: 24,
    lastDate: "Jun 7",
    lastLabel: "Renewal",
    health: "At Risk",
  },
  {
    id: "netflix",
    name: "Netflix",
    tags: [t("Mid-Market", "green")],
    owner: "Ricky Brown",
    openDeals: 3,
    pipeline: 221221,
    win: 72,
    lastDate: "Jun 18",
    lastLabel: "Pilot",
    health: "Healthy",
  },
  {
    id: "spotify",
    name: "Spotify",
    tags: [t("Land & Expand", "teal")],
    moreTags: 2,
    owner: "Hannah Mills",
    openDeals: 5,
    pipeline: 170991,
    win: 55,
    lastDate: "Jul 1",
    lastLabel: "Expansion",
    health: "Healthy",
  },
  {
    id: "shopify",
    name: "Shopify",
    tags: [t("Co-Sell", "amber"), t("Expansion", "green")],
    owner: "Emma Green",
    openDeals: 9,
    pipeline: 139007,
    win: 45,
    lastDate: "Jul 18",
    lastLabel: "Renewal",
    health: "Watch",
  },
  {
    id: "zoom",
    name: "Zoom",
    tags: [t("Expansion", "green")],
    moreTags: 2,
    owner: "Oliver Chan",
    openDeals: 8,
    pipeline: 289921,
    win: 38,
    lastDate: "Aug 8",
    lastLabel: "Partner",
    health: "Watch",
  },
  {
    id: "slack",
    name: "Slack",
    tags: [t("Mid-Market", "green"), t("Co-Sell", "amber")],
    owner: "Ava Brooks",
    openDeals: 4,
    pipeline: 333221,
    win: 23,
    lastDate: "Aug 12",
    lastLabel: "Discovery",
    health: "At Risk",
  },
  {
    id: "stripe",
    name: "Stripe",
    tags: [t("Expansion", "green"), t("SMB", "olive")],
    moreTags: 2,
    owner: "Noah Lee",
    openDeals: 3,
    pipeline: 442231,
    win: 44,
    lastDate: "Sept 09",
    lastLabel: "Demo",
    health: "Watch",
  },
  {
    id: "snowflake",
    name: "Snowflake",
    tags: [t("Enterprise", "blue"), t("Mid-Market", "green")],
    owner: "Grace Miller",
    openDeals: 6,
    pipeline: 520000,
    win: 24,
    lastDate: "Sept 11",
    lastLabel: "Pricing",
    health: "At Risk",
  },
  {
    id: "hubspot",
    name: "Hubspot",
    tags: [t("Expansion", "green"), t("Co-Sell", "amber")],
    moreTags: 2,
    owner: "Chloe Park",
    openDeals: 2,
    pipeline: 210123,
    win: 52,
    lastDate: "Sept 18",
    lastLabel: "QBR Call",
    health: "Healthy",
  },
  {
    id: "figma",
    name: "Figma",
    tags: [t("Enterprise", "blue"), t("Upsell", "purple")],
    owner: "Owen Reid",
    openDeals: 4,
    pipeline: 268540,
    win: 63,
    lastDate: "Sept 24",
    lastLabel: "Demo",
    health: "Healthy",
  },
  {
    id: "notion",
    name: "Notion",
    tags: [t("SMB", "olive"), t("Land & Expand", "teal")],
    owner: "Priya Shah",
    openDeals: 6,
    pipeline: 198410,
    win: 41,
    lastDate: "Sept 29",
    lastLabel: "Renewal",
    health: "Watch",
  },
];

/** Deterministic per-company sparkline so server and client render the same bars. */
export function activityTrend(seed: string, bars = 14): number[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: bars }, (_, i) => {
    h = Math.imul(h ^ (i + 1), 16777619);
    // Skewed low so a few tall spikes stand out, like the reference.
    return 0.14 + (((h >>> 8) & 0xff) / 255) ** 1.9 * 0.86;
  });
}
