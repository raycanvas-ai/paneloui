// Every size on this screen is written at the reference crop's scale (1458px
// wide); UI_SCALE in workflow-page.tsx trims the whole thing to the inset.

export type NodeKind = "trigger" | "delay" | "email" | "sms" | "task";
export type Tone = "blue" | "pink" | "green";

export interface FilterRow {
  id: string;
  join?: string;
  field: string;
  operator: string;
  value: string;
}

export interface WorkflowNode {
  id: string;
  kind: NodeKind;
  /** Trigger copy is three runs so the middle one can render as a chip. */
  lead?: string;
  chip?: string;
  tail?: string;
  amount?: string;
  unit?: string;
  title?: string;
  subject?: string;
  body?: string;
  filters?: FilterRow[];
}

export const TONE_TILE: Record<Tone, string> = {
  blue: "bg-chart-1/10 text-chart-1",
  pink: "bg-chart-3/10 text-chart-3",
  green: "bg-success/10 text-success",
};

export const NODE_TONE: Record<NodeKind, Tone> = {
  trigger: "blue",
  delay: "pink",
  email: "green",
  sms: "green",
  task: "green",
};

export const initialNodes: WorkflowNode[] = [
  {
    id: "n1",
    kind: "trigger",
    lead: "New",
    chip: "Prospect or Customer",
    tail: "appears in system",
    filters: [
      { id: "f1", field: "Property size", operator: "is bigger than", value: "2000m²" },
      { id: "f2", join: "AND", field: "property distance", operator: "is more than", value: "30 mins away" },
      {
        id: "f3",
        join: "AND",
        field: "services",
        operator: "does not contain",
        value: "lawn mowing, trimming, planting",
      },
    ],
  },
  { id: "n2", kind: "delay", amount: "15", unit: "minutes" },
  {
    id: "n3",
    kind: "email",
    title: "Send email to the user",
    subject: "Welcome to Panelo – Let's Get Started 🚀",
    body: "Hi {{User Name}},\n\nWelcome to Panelo – we're thrilled to have you with us!\n\nPanelo is all about helping you get things done faster and more efficiently, without the clutter or confusion. Whether you're here to streamline your workflow, stay organized, or just move smarter through your day – you've made the right call.",
  },
  { id: "n4", kind: "delay", amount: "2", unit: "days" },
  {
    id: "n5",
    kind: "sms",
    title: "Send SMS to the user",
    body: "Welcome to Panelo, {{User Name}}! 🚀\n\nWe're excited to have you on board. Your faster, smarter way to get things done starts now.\n\nGot questions? We're here to help – just reply anytime!",
  },
];

export interface LibraryItem {
  id: string;
  title: string;
  description?: string;
  tone: Tone;
  icon: string;
  adds: NodeKind;
}

export interface LibrarySection {
  id: string;
  label: string;
  items: LibraryItem[];
}

export const library: LibrarySection[] = [
  {
    id: "triggers",
    label: "Triggers",
    items: [
      {
        id: "new-user",
        title: "New user",
        description:
          "This trigger is activated when new user (could be any type: Lead, Prospect or Customer) appears in the workspace",
        tone: "blue",
        icon: "user-plus",
        adds: "trigger",
      },
      {
        id: "any-user",
        title: "Any user",
        description: "Ideal for running one-off campaigns for subset (or all) of existing users.",
        tone: "blue",
        icon: "user-search",
        adds: "trigger",
      },
      {
        id: "status-change",
        title: "User status change",
        description: "Activated when user status changes, e.g. Lead → Prospect, or Prospect → Customer.",
        tone: "blue",
        icon: "user-cog",
        adds: "trigger",
      },
      {
        id: "new-message",
        title: "New message",
        description: "Triggers when the user sends a message (SMS, email).",
        tone: "blue",
        icon: "message",
        adds: "trigger",
      },
      {
        id: "estimate-accepted",
        title: "Estimate accepted",
        description: "The estimate gets accepted by the user.",
        tone: "blue",
        icon: "square-check",
        adds: "trigger",
      },
      {
        id: "estimate-rejected",
        title: "Estimate rejected",
        description: "The estimate gets rejected by the user.",
        tone: "blue",
        icon: "square-x",
        adds: "trigger",
      },
      {
        id: "job-completion",
        title: "Job completion",
        description: "Triggers when crew marks job as completed.",
        tone: "blue",
        icon: "circle-check",
        adds: "trigger",
      },
      {
        id: "job-schedule",
        title: "Job schedule",
        description: "This trigger activates when job gets scheduled in the system.",
        tone: "blue",
        icon: "calendar",
        adds: "trigger",
      },
    ],
  },
  {
    id: "special",
    label: "Special",
    items: [
      {
        id: "after",
        title: "After...",
        description: "Add time delay before an action.",
        tone: "pink",
        icon: "hourglass",
        adds: "delay",
      },
      {
        id: "when",
        title: "When...",
        description: "This is time-based trigger for recurring or one-off events.",
        tone: "pink",
        icon: "calendar",
        adds: "delay",
      },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    items: [
      { id: "send-email", title: "Send email", tone: "green", icon: "mail", adds: "email" },
      { id: "send-sms", title: "Send SMS", tone: "green", icon: "smartphone", adds: "sms" },
      { id: "add-task", title: "Add task", tone: "green", icon: "circle-check-big", adds: "task" },
    ],
  },
];

/** Option sets behind the inline editors — the chips are real controls. */
export const TRIGGER_SUBJECTS = ["Lead", "Prospect", "Customer", "Prospect or Customer", "Any user"];
export const DELAY_UNITS = ["minutes", "hours", "days", "weeks"];
export const DELAY_MINUTES: Record<string, number> = { minutes: 1, hours: 60, days: 1440, weeks: 10080 };
export const FILTER_FIELDS = [
  "Property size",
  "property distance",
  "services",
  "plan",
  "lifetime value",
  "signup source",
];
export const FILTER_OPERATORS = [
  "is",
  "is not",
  "is bigger than",
  "is more than",
  "is less than",
  "contains",
  "does not contain",
];
export const JOIN_OPERATORS = ["AND", "OR"];
