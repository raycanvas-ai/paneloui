/* -------------------------------------------------------------------------- */
/*  Sample data for the appointment calendar: a small fitness studio. The week */
/*  is laid out around whichever week is current, so the demo is always live. */
/*  Swap in your own staff, services, customers, appointments and waitlist.   */
/* -------------------------------------------------------------------------- */

export type Tone =
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "violet"
  | "yellow"
  | "pink"
  | "neutral";

export type Staff = { id: string; name: string; initials: string; tone: Tone };
export type Customer = {
  id: string;
  name: string;
  initials: string;
  tone: Tone;
  phone?: string;
};
export type Service = {
  id: string;
  name: string;
  minutes: number;
  price: number;
};
export type Status =
  "booked" | "confirmed" | "completed" | "no-show" | "cancelled";

export type Appointment = {
  id: string;
  customer: string;
  service: string;
  staff: string;
  start: Date;
  end: Date;
  status: Status;
  notes?: string;
  /** A class with several people, shown with a group mark. */
  group?: boolean;
};

/** Someone waiting for a slot: who, for what, with whom if they asked, and since when. */
export type WaitlistEntry = {
  id: string;
  customer: string;
  service: string;
  staff?: string;
  since: Date;
};

/** A past booking, for the stat cards: just the day and how it ended. */
export type HistoryEntry = { day: Date; status: Status; waitHours?: number };

export const STATUSES: { id: Status; name: string; tone: Tone }[] = [
  { id: "booked", name: "Booked", tone: "blue" },
  { id: "confirmed", name: "Confirmed", tone: "cyan" },
  { id: "completed", name: "Completed", tone: "green" },
  { id: "no-show", name: "No-show", tone: "pink" },
  { id: "cancelled", name: "Cancelled", tone: "neutral" },
];

export const staff: Staff[] = [
  { id: "mia", name: "Mia Torres", initials: "MT", tone: "pink" },
  { id: "leo", name: "Leo Grant", initials: "LG", tone: "green" },
  { id: "ava", name: "Ava Lindholm", initials: "AL", tone: "violet" },
  { id: "sam", name: "Sam Okoro", initials: "SO", tone: "yellow" },
  { id: "zoe", name: "Zoe Hart", initials: "ZH", tone: "orange" },
];

export const services: Service[] = [
  { id: "vinyasa", name: "Vinyasa Yoga", minutes: 60, price: 32 },
  { id: "pt", name: "Personal Training", minutes: 30, price: 65 },
  { id: "dance", name: "Dance Cardio", minutes: 75, price: 28 },
  { id: "reformer", name: "Pilates Reformer", minutes: 45, price: 45 },
  { id: "mobility", name: "Mobility & Stretch", minutes: 45, price: 25 },
  { id: "intro", name: "Intro Package", minutes: 60, price: 99 },
];

export const customers: Customer[] = [
  ["noor", "Noor Haddad", "green"],
  ["bruno", "Bruno Silva", "blue"],
  ["clara", "Clara Weiss", "pink"],
  ["dmitri", "Dmitri Volkov", "violet"],
  ["elena", "Elena Rossi", "orange"],
  ["farid", "Farid Nasser", "cyan"],
  ["greta", "Greta Lund", "yellow"],
  ["hugo", "Hugo Martin", "green"],
  ["imani", "Imani Brooks", "violet"],
  ["jonah", "Jonah Reed", "blue"],
  ["keiko", "Keiko Mori", "pink"],
  ["lena", "Lena Fischer", "orange"],
  ["milo", "Milo Chen", "cyan"],
  ["nadia", "Nadia Karim", "yellow"],
  ["oscar", "Oscar Diaz", "green"],
  ["priya", "Priya Shah", "violet"],
].map(([id, name, tone]) => ({
  id,
  name,
  tone: tone as Tone,
  initials: name
    .split(" ")
    .map((w) => w[0])
    .join(""),
  phone: "+1 555 01" + String(id.length * 7).padStart(2, "0"),
}));

/** Monday 00:00 of the week holding `date`. */
export function mondayOf(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** Small seeded PRNG (mulberry32): the same history on every render, server and client alike. */
function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The studio's week around `today`, as weekday offsets from Monday with start and
 * end in hours. Past appointments are completed, today's are confirmed, later ones booked.
 */
export function sampleAppointments(today: Date): Appointment[] {
  const monday = mondayOf(today);
  const at = (day: number, hour: number) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + day);
    d.setMinutes(Math.round(hour * 60));
    return d;
  };
  const now = +today;
  const list: [
    string,
    number,
    number,
    number,
    string,
    string,
    string,
    Partial<Appointment>?,
  ][] = [
    [
      "a1",
      0,
      10,
      11.5,
      "noor",
      "pt",
      "leo",
      { notes: "Knee rehab: no jumps." },
    ],
    ["a2", 0, 12, 13, "clara", "dance", "sam"],
    ["a3", 0, 13, 14, "bruno", "vinyasa", "zoe", { status: "no-show" }],
    ["a4", 0, 15, 17, "dmitri", "pt", "leo"],
    [
      "a5",
      1,
      8,
      9,
      "elena",
      "vinyasa",
      "mia",
      { group: true, notes: "Bring her own mat." },
    ],
    ["a6", 1, 9, 9.75, "farid", "vinyasa", "ava"],
    [
      "a7",
      1,
      10,
      10.75,
      "greta",
      "vinyasa",
      "mia",
      { notes: "First class after surgery." },
    ],
    ["a8", 1, 10.75, 12, "hugo", "dance", "mia"],
    ["a9", 1, 12.75, 13.5, "imani", "vinyasa", "mia"],
    ["a10", 1, 14, 15.25, "jonah", "dance", "mia"],
    ["a11", 2, 9.5, 10.5, "keiko", "vinyasa", "ava"],
    ["a12", 2, 12, 13, "lena", "intro", "ava"],
    ["a13", 2, 13.5, 14.5, "milo", "pt", "ava"],
    ["a14", 2, 14.75, 15.5, "nadia", "reformer", "zoe"],
    ["a15", 2, 17, 18, "oscar", "pt", "mia"],
    ["a16", 3, 9, 9.75, "elena", "vinyasa", "mia"],
    ["a17", 3, 9.75, 11, "priya", "dance", "mia"],
    ["a18", 3, 16, 16.75, "clara", "mobility", "sam"],
    ["a19", 4, 14, 15, "noor", "pt", "leo"],
    ["a20", 9, 10, 11, "bruno", "reformer", "zoe"],
    ["a21", -3, 11, 12, "imani", "vinyasa", "ava"],
  ];
  return list.map(([id, day, from, to, customer, service, who, extra]) => {
    const start = at(day, from);
    const end = at(day, to);
    const status: Status =
      +end < now
        ? "completed"
        : +start - now < 24 * 3_600_000
          ? "confirmed"
          : "booked";
    return { id, customer, service, staff: who, start, end, status, ...extra };
  });
}

/** Eight people waiting, joined over the last day. */
export function sampleWaitlist(today: Date): WaitlistEntry[] {
  const ago = (h: number) => new Date(+today - h * 3_600_000);
  return [
    {
      id: "w1",
      customer: "hugo",
      service: "pt",
      staff: "leo",
      since: ago(0.5),
    },
    { id: "w2", customer: "keiko", service: "reformer", since: ago(1.2) },
    {
      id: "w3",
      customer: "farid",
      service: "vinyasa",
      staff: "mia",
      since: ago(2),
    },
    { id: "w4", customer: "lena", service: "mobility", since: ago(3.5) },
    { id: "w5", customer: "oscar", service: "dance", since: ago(5) },
    { id: "w6", customer: "nadia", service: "pt", since: ago(7) },
    { id: "w7", customer: "milo", service: "intro", since: ago(20) },
    {
      id: "w8",
      customer: "greta",
      service: "reformer",
      staff: "zoe",
      since: ago(26),
    },
  ];
}

/** Two weeks of past bookings for the stat cards: about twenty a day, mostly completed. */
export function sampleHistory(today: Date): HistoryEntry[] {
  const rand = random(31);
  const out: HistoryEntry[] = [];
  for (let back = 1; back <= 14; back++) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - back,
    );
    // The recent week was busier and kept more people waiting less, so the trends say something.
    const recent = back <= 7;
    const count = Math.round((recent ? 20 : 18) + rand() * 4 - 2);
    for (let i = 0; i < count; i++) {
      const roll = rand();
      const status: Status =
        roll < (recent ? 0.07 : 0.06)
          ? "no-show"
          : roll < 0.12
            ? "cancelled"
            : "completed";
      out.push({
        day,
        status,
        waitHours: rand() < 0.3 ? (recent ? 1 : 1.2) + rand() * 1.1 : undefined,
      });
    }
  }
  return out;
}
