export interface TodoItem {
  id: string;
  label: string;
  done?: boolean;
}

export interface TodoSection {
  id: string;
  title: string;
  defaultOpen: boolean;
  items: TodoItem[];
}

export interface CalendarEvent {
  id: string;
  /** Column index, 0 = first rendered day. */
  day: number;
  emoji: string;
  title: string;
  /** Label as shown on the card; layout comes from `start`/`end`. */
  time: string;
  /** Decimal hours, e.g. 8.5 = 8:30 AM. */
  start: number;
  end: number;
  attendees?: string[];
  overflow?: number;
  cta?: { label: string; color: string };
}

export const todoSections: TodoSection[] = [
  {
    id: "this-week",
    title: "This week",
    defaultOpen: true,
    items: [
      { id: "w1", label: "Weekly Sprint Planning" },
      { id: "w2", label: "Daily Stand-up", done: true },
      { id: "w3", label: "UX Design Review" },
      { id: "w4", label: "Backend Sync Call" },
    ],
  },
  {
    id: "this-month",
    title: "This month",
    defaultOpen: true,
    items: [
      { id: "m1", label: "Feature Freeze: Task Board" },
      { id: "m2", label: "Internal Demo Day" },
      { id: "m3", label: "API Strategy Workshop" },
      { id: "m4", label: "LinkedIn Live – Productivity" },
      { id: "m5", label: "Client Feedback Call" },
      { id: "m6", label: "Figma-to-Code Hand-off" },
    ],
  },
  {
    id: "unschedule",
    title: "Unschedule",
    defaultOpen: true,
    items: [
      { id: "u1", label: "Webinar: Scaling Agile with Microteams" },
      { id: "u2", label: "Client Feedback Call – Beta Group A" },
      { id: "u3", label: "LinkedIn Live – Building Productivity" },
      { id: "u4", label: "OKR Alignment Meeting" },
    ],
  },
  {
    id: "personal",
    title: "Personal",
    defaultOpen: false,
    items: [
      { id: "p1", label: "Dentist appointment" },
      { id: "p2", label: "Renew gym membership" },
    ],
  },
];

const ZOOM = "#468ae6";
const MEET = "#ec8d47";

export const calendarEvents: CalendarEvent[] = [
  {
    id: "webinar-beta",
    day: 0,
    emoji: "💼",
    title: "Webinar: Scaling Agile with Client Feedback Call – Beta Group A",
    time: "9 - 12:30 PM",
    start: 9,
    end: 12,
    attendees: ["Ava Reid", "Liam Cole", "Noah Pike", "Mia Vance"],
    overflow: 2,
    cta: { label: "Go to Zoom link", color: ZOOM },
  },
  {
    id: "api-strategy",
    day: 1,
    emoji: "🔌",
    title: "API Strategy Workshop",
    time: "8:30 - 9 PM",
    start: 8.5,
    end: 9.5,
  },
  {
    id: "analytics-deep-dive",
    day: 2,
    emoji: "📈",
    title: "Analytics Deep Dive: Task Completion Trends",
    time: "9 - 12:30 PM",
    start: 9,
    end: 11,
    attendees: ["Ravi Nair", "Elle Fox"],
    cta: { label: "Open Meet", color: MEET },
  },
  {
    id: "client-feedback",
    day: 1,
    emoji: "💼",
    title: "Client Feedback Call – Beta Group A",
    time: "11 - 12:30 PM",
    start: 11,
    end: 13,
    attendees: ["Ava Reid", "Liam Cole", "Noah Pike", "Mia Vance"],
  },
  {
    id: "shopping",
    day: 3,
    emoji: "🛍️",
    title: "Shopping Time",
    time: "11 - 12 PM",
    start: 11,
    end: 11.75,
  },
  { id: "lunch-sun", day: 0, emoji: "🍔", title: "Lunch Break", time: "1:30 - 2 PM", start: 13, end: 13.75 },
  { id: "lunch-mon", day: 1, emoji: "🍔", title: "Lunch Break", time: "1:30 - 2 PM", start: 13, end: 13.75 },
  {
    id: "webinar-microteams",
    day: 2,
    emoji: "🖥️",
    title: "Webinar: Scaling Agile with Microteams",
    time: "1 - 2:30 PM",
    start: 13,
    end: 14.5,
    attendees: ["Ava Reid", "Liam Cole", "Noah Pike", "Mia Vance"],
    overflow: 2,
  },
  { id: "lunch-wed", day: 3, emoji: "🍔", title: "Lunch Break", time: "1:30 - 2 PM", start: 13, end: 13.75 },
];
