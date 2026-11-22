import { differenceInCalendarDays, format, isSameDay, parseISO } from "date-fns";

import { rootUser } from "@/data/users";

export type FolderId = "inbox" | "starred" | "sent" | "drafts" | "archive" | "spam" | "trash";
export type LabelId = "product" | "finance" | "design" | "urgent";
/** A view is a folder or a label; the list filters by whichever is selected. */
export type View = FolderId | `label:${LabelId}`;

export interface Person {
  name: string;
  email: string;
}

export interface MailMessage {
  id: string;
  from: Person;
  body: string;
  /** Local ISO without a zone, so server and client format the same wall time. */
  at: string;
}

export interface Email {
  id: string;
  /** `starred` is a virtual folder, so stored mail never lives in it. */
  folder: Exclude<FolderId, "starred">;
  subject: string;
  to: Person[];
  messages: MailMessage[];
  unread: boolean;
  starred: boolean;
  labels: LabelId[];
  attachments: { name: string; size: string }[];
}

export const me: Person = { name: rootUser.name, email: rootUser.email };

/** Fixed "now" for relative times, matching the date the rest of the sample data is set on. */
export const NOW = "2026-09-15T16:40:00";

export const FOLDERS: { id: FolderId; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "starred", label: "Starred" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
  { id: "archive", label: "Archive" },
  { id: "spam", label: "Spam" },
  { id: "trash", label: "Trash" },
];

export const LABELS: { id: LabelId; label: string; dot: string }[] = [
  { id: "product", label: "Product", dot: "bg-[var(--tone-primary)]" },
  { id: "finance", label: "Finance", dot: "bg-success-solid" },
  { id: "design", label: "Design", dot: "bg-chart-2" },
  { id: "urgent", label: "Urgent", dot: "bg-destructive" },
];

const maya = { name: "Maya Chen", email: "maya@panelo.dev" };
const noah = { name: "Noah Williams", email: "noah@panelo.dev" };
const priya = { name: "Priya Raman", email: "priya@panelo.dev" };
const sofia = { name: "Sofia Alvarez", email: "sofia@panelo.dev" };
const daniel = { name: "Daniel Okafor", email: "daniel@panelo.dev" };

export const initialEmails: Email[] = [
  {
    id: "m1",
    folder: "inbox",
    subject: "Northline invoice INV-2036 is 12 days overdue",
    to: [me],
    unread: true,
    starred: true,
    labels: ["finance", "urgent"],
    attachments: [{ name: "INV-2036.pdf", size: "182 KB" }],
    messages: [
      {
        id: "m1-1",
        from: { name: "Ingrid Vogel", email: "ap@northline.de" },
        at: "2026-09-15T15:12:00",
        body: "Hi,\n\nApologies for the delay on INV-2036. Our approval chain changed after the reorg and your invoice sat with the wrong cost centre. It is now approved and scheduled for our Thursday payment run.\n\nCould you confirm the EUR account details are unchanged? I have attached the copy we have on file.\n\nBest,\nIngrid",
      },
    ],
  },
  {
    id: "m2",
    folder: "inbox",
    subject: "Store redesign: checkout review notes",
    to: [me, priya],
    unread: true,
    starred: false,
    labels: ["design", "product"],
    attachments: [
      { name: "checkout-v3.fig", size: "4.8 MB" },
      { name: "review-notes.md", size: "6 KB" },
    ],
    messages: [
      {
        id: "m2-1",
        from: sofia,
        at: "2026-09-15T11:05:00",
        body: "Morning both,\n\nI went through the new checkout with the support team. Three things came up: the promo field is easy to miss on mobile, the shipping estimate jumps when the address autocompletes, and people want to see the order summary before entering a card.\n\nI mocked a fix for each in the attached file. Can we review at 3?",
      },
      {
        id: "m2-2",
        from: priya,
        at: "2026-09-15T12:20:00",
        body: "3 works. I'd push the summary change to next sprint, it touches the payment step and needs QA on Instagram Shop orders too.",
      },
    ],
  },
  {
    id: "m3",
    folder: "inbox",
    subject: "AWS bill is tracking 13% over the cloud budget",
    to: [me],
    unread: true,
    starred: false,
    labels: ["finance"],
    attachments: [],
    messages: [
      {
        id: "m3-1",
        from: noah,
        at: "2026-09-15T09:48:00",
        body: "Heads up: September infrastructure is at $96K against an $85K budget. Most of it is the analytics cluster we scaled for the backfill and never scaled down.\n\nI can drop it back to three nodes tonight, which saves roughly $9K a month. Okay to go ahead?",
      },
    ],
  },
  {
    id: "m4",
    folder: "inbox",
    subject: "Your Stripe payout of $84,210.00 is on its way",
    to: [me],
    unread: false,
    starred: false,
    labels: [],
    attachments: [],
    messages: [
      {
        id: "m4-1",
        from: { name: "Stripe", email: "notifications@stripe.com" },
        at: "2026-09-15T07:30:00",
        body: "A payout of $84,210.00 USD to your Mercury account ending 4821 has been initiated and should arrive within 1 business day.\n\nPayout ID: po_1Q8xLm2eZvKYlo2C",
      },
    ],
  },
  {
    id: "m5",
    folder: "inbox",
    subject: "Q4 roadmap draft for review",
    to: [me, noah, sofia],
    unread: false,
    starred: true,
    labels: ["product"],
    attachments: [{ name: "Q4-roadmap.pdf", size: "1.2 MB" }],
    messages: [
      {
        id: "m5-1",
        from: maya,
        at: "2026-09-14T17:55:00",
        body: "Here's the first cut of the Q4 roadmap. Big bets are the Atlas CRM import rewrite and usage-based billing. I've left two open slots for whatever comes out of the customer interviews.\n\nComments in the doc by Wednesday please, we lock it Friday.",
      },
      {
        id: "m5-2",
        from: me,
        at: "2026-09-14T19:10:00",
        body: "Looks solid. Can we size the billing work before Friday? I suspect it pulls in the invoices page too.",
      },
      {
        id: "m5-3",
        from: maya,
        at: "2026-09-15T08:40:00",
        body: "Good call, I'll ask Daniel for an estimate today.",
      },
    ],
  },
  {
    id: "m6",
    folder: "inbox",
    subject: "Interview loop for the senior designer role",
    to: [me],
    unread: false,
    starred: false,
    labels: ["design"],
    attachments: [],
    messages: [
      {
        id: "m6-1",
        from: daniel,
        at: "2026-09-14T13:22:00",
        body: "We have four candidates through the portfolio stage. I'd like you on the final panel for two of them, Tuesday and Thursday afternoon. I'll send calendar holds once you confirm.",
      },
    ],
  },
  {
    id: "m7",
    folder: "inbox",
    subject: "Treasury interest statement for August",
    to: [me],
    unread: false,
    starred: false,
    labels: ["finance"],
    attachments: [{ name: "treasury-aug-2026.pdf", size: "96 KB" }],
    messages: [
      {
        id: "m7-1",
        from: { name: "Mercury", email: "statements@mercury.com" },
        at: "2026-09-12T10:00:00",
        body: "Your Treasury account ending 7710 earned $9,392.00 in August at 4.6% APY. Your statement is attached.",
      },
    ],
  },
  {
    id: "m8",
    folder: "inbox",
    subject: "Bright Enterprises renewal: pricing question",
    to: [me],
    unread: false,
    starred: false,
    labels: ["urgent"],
    attachments: [],
    messages: [
      {
        id: "m8-1",
        from: { name: "Jordan Pike", email: "jordan@brightenterprises.com" },
        at: "2026-09-10T16:05:00",
        body: "Hi,\n\nAhead of our renewal on the 28th, finance is asking whether the 12% multi-year discount still applies if we add the analytics add-on mid-term. A quick yes or no is enough for now.\n\nThanks,\nJordan",
      },
    ],
  },
  {
    id: "m9",
    folder: "sent",
    subject: "Re: Brand refresh kickoff",
    to: [sofia],
    unread: false,
    starred: false,
    labels: ["design"],
    attachments: [],
    messages: [
      {
        id: "m9-1",
        from: me,
        at: "2026-09-13T14:30:00",
        body: "Thanks Sofia, the moodboard is great. Let's keep the green but push the neutrals warmer. Can you share two type pairings by Monday?",
      },
    ],
  },
  {
    id: "m10",
    folder: "sent",
    subject: "Offsite agenda",
    to: [maya, noah, priya, sofia, daniel],
    unread: false,
    starred: false,
    labels: [],
    attachments: [{ name: "offsite-agenda.pdf", size: "240 KB" }],
    messages: [
      {
        id: "m10-1",
        from: me,
        at: "2026-09-11T09:15:00",
        body: "Agenda for next week is attached. Morning is planning, afternoon is open for team demos. Dinner is booked for 7.",
      },
    ],
  },
  {
    id: "m11",
    folder: "drafts",
    subject: "Hiring plan for H1",
    to: [daniel],
    unread: false,
    starred: false,
    labels: [],
    attachments: [],
    messages: [
      {
        id: "m11-1",
        from: me,
        at: "2026-09-14T22:02:00",
        body: "Daniel, before the board deck goes out I want to agree the H1 headcount. My view is two engineers, one designer, and",
      },
    ],
  },
  {
    id: "m12",
    folder: "archive",
    subject: "Your Vercel deployment is ready",
    to: [me],
    unread: false,
    starred: false,
    labels: [],
    attachments: [],
    messages: [
      {
        id: "m12-1",
        from: { name: "Vercel", email: "notifications@vercel.com" },
        at: "2026-09-09T18:44:00",
        body: "panelo-web deployed to production from main (commit 4f2a91c). Build took 48s.",
      },
    ],
  },
  {
    id: "m13",
    folder: "spam",
    subject: "You've been selected for an exclusive SEO audit",
    to: [me],
    unread: true,
    starred: false,
    labels: [],
    attachments: [],
    messages: [
      {
        id: "m13-1",
        from: { name: "Growth Partners", email: "offers@growthpartners.biz" },
        at: "2026-09-13T03:12:00",
        body: "Our AI found 47 critical issues on your site. Reply YES to unlock your free audit worth $2,000.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ Helpers */

export function lastMessage(email: Email) {
  return email.messages[email.messages.length - 1];
}

export function inView(email: Email, view: View) {
  const live = email.folder !== "trash" && email.folder !== "spam";
  if (view.startsWith("label:")) return live && email.labels.includes(view.slice(6) as LabelId);
  if (view === "starred") return live && email.starred;
  return email.folder === view;
}

export function viewLabel(view: View) {
  if (view.startsWith("label:")) return LABELS.find((label) => `label:${label.id}` === view)?.label ?? "Label";
  return FOLDERS.find((folder) => folder.id === view)?.label ?? "Inbox";
}

/** Today shows the time, this week the weekday, older mail the date. */
export function listTime(at: string) {
  const date = parseISO(at);
  const now = parseISO(NOW);
  if (isSameDay(date, now)) return format(date, "h:mm a");
  if (differenceInCalendarDays(now, date) < 7) return format(date, "EEE");
  return format(date, "MMM d");
}

export function fullTime(at: string) {
  return format(parseISO(at), "EEE, MMM d · h:mm a");
}
