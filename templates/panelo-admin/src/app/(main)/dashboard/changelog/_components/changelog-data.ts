export type ChangeKind = "new" | "improved" | "fixed";

export type Release = {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: Partial<Record<ChangeKind, string[]>>;
};

export const releases: Release[] = [
  {
    version: "2.8.0",
    date: "2026-09-12",
    title: "One colour system across every page",
    summary:
      "Brand, status and chart colours now come from a single token scale, so every screen follows your theme preset in light and dark mode.",
    changes: {
      new: [
        "Success, warning and info status tokens with solid and foreground variants.",
        "Categorical chart scale that stays distinguishable in greyscale and for red-green colour blindness.",
      ],
      improved: [
        "Invoice builder rebuilt as a split form and live preview with Standard, Split and Recurring modes.",
        "Hand-picked hex colours on nine pages replaced with theme tokens.",
      ],
      fixed: ["Charts no longer render at the wrong size and snap into place after the first paint."],
    },
  },
  {
    version: "2.7.2",
    date: "2026-08-29",
    title: "Faster tables and quieter scrollbars",
    summary: "Large tables on the Users and Companies pages scroll smoothly again, even with 5,000+ rows.",
    changes: {
      improved: [
        "Row virtualisation for tables over 200 rows.",
        "Scrollbars fade out on macOS instead of staying visible.",
      ],
      fixed: [
        "Status tabs on the Users page showed a permanent horizontal scrollbar.",
        "Date range picker closed when switching months on touch devices.",
      ],
    },
  },
  {
    version: "2.7.0",
    date: "2026-08-14",
    title: "Automations run history",
    summary: "See every automation run with its trigger, duration and output, and replay failed runs in one click.",
    changes: {
      new: [
        "Run history with filters for status, trigger and date.",
        "Replay a failed run with the original payload.",
        "Slack alerts when an automation fails three times in a row.",
      ],
      improved: ["Automation builder validates missing fields before you publish."],
    },
  },
  {
    version: "2.6.0",
    date: "2026-07-30",
    title: "Roles and fine-grained permissions",
    summary: "Create custom roles and control access per project, down to who can export data or manage billing.",
    changes: {
      new: ["Custom roles with 24 individual permissions.", "Project-level access overrides."],
      improved: ["Invite flow suggests a role based on the teammate's email domain."],
      fixed: ["Viewers could open the billing page from a direct link."],
    },
  },
];
