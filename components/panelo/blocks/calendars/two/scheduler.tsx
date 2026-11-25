"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Clock,
  Info,
  Menu,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Undo,
  User,
  Users,
  Receipt,
  X,
} from "@keyline-icons/react";
import {
  Pause as PauseFill,
  Play as PlayFill,
  Sparkles as SparklesFill,
  Users as UsersFill,
} from "@keyline-icons/react/fill";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/panelo/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/panelo/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/panelo/ui/tooltip";
import { cn } from "@/components/panelo/lib/utils";

import {
  AppointmentDetails,
  AppointmentForm,
  Avatar,
  focusRing,
  TEAL,
  type CardCtx,
} from "./appointment-card";
import * as sample from "./data";
import type {
  Appointment,
  Customer,
  HistoryEntry,
  Service,
  Staff,
  Status,
  WaitlistEntry,
} from "./data";
import {
  accent,
  addDays,
  at,
  fill,
  fmt,
  lanes,
  minutesOf,
  money,
  range,
  sameDay,
  startOfDay,
  startOfWeek,
  tint,
  tone,
} from "./lib";

/* -------------------------------------------------------------------------- */
/*  Appointment calendar for a studio, salon or clinic.                        */
/*  - Day, Week, Month and Staff (a column per person) views.                 */
/*  - Filter by status and staff; stat cards with week-on-week trends.        */
/*  - Click a free slot (or "Add appointment", N) to book; click a booking    */
/*    to change its status, edit or cancel it. Nothing saves until Save.      */
/*  - A waitlist you can book from, or auto-fill into free slots (undoable).  */
/*  - Today's revenue and a shift timer in the header.                        */
/*  Every list is a prop; it adapts to its own width (container queries).     */
/* -------------------------------------------------------------------------- */

export type View = "day" | "week" | "month" | "staff";

export type SchedulerProps = {
  title?: string;
  staff?: Staff[];
  customers?: Customer[];
  services?: Service[];
  defaultAppointments?: Appointment[];
  onAppointmentsChange?: (appointments: Appointment[]) => void;
  defaultWaitlist?: WaitlistEntry[];
  /** Past bookings for the stat cards. */
  history?: HistoryEntry[];
  defaultView?: View;
  /** Weekdays the studio is closed (0 = Sunday). */
  closedDays?: number[];
  /** Opening hours, used for "next free slot" and auto-fill. */
  openHour?: number;
  closeHour?: number;
  /** Hour the grid opens at, and the height of one hour in px. */
  startHour?: number;
  hourHeight?: number;
  /** Who's signed in: the avatar at the top right. */
  user?: { name: string; initials: string };
  /** Pin "now" (tests, screenshots). Otherwise the real clock, read after mount. */
  now?: Date;
  /** Listen for N, T, arrows, / and W. Give it to one calendar per page. */
  shortcuts?: boolean;
  className?: string;
};

// The server renders this moment; the browser swaps in the real clock after mount, so hydration matches.
const SERVER_NOW = new Date(2026, 10, 24, 11, 30);
const GUTTER = 50;
const RAIL = 35;
const pad2 = (n: number) => String(n).padStart(2, "0");
/** "10:30", 12-hour with no meridiem: the gutter already says AM or PM. */
const short = (d: Date) =>
  `${pad2(d.getHours() % 12 || 12)}:${pad2(d.getMinutes())}`;

export function Scheduler({
  title = "Appointments",
  staff = sample.staff,
  customers = sample.customers,
  services = sample.services,
  defaultAppointments,
  onAppointmentsChange,
  defaultWaitlist,
  history: historyProp,
  defaultView = "week",
  closedDays = [0],
  openHour = 8,
  closeHour = 20,
  startHour = 8,
  hourHeight = 67,
  user = { name: "Bea Flores", initials: "BF" },
  now: nowProp,
  shortcuts = false,
  className,
}: SchedulerProps) {
  const [clockNow, setClockNow] = useState<Date>(nowProp ?? SERVER_NOW);
  const [live, setLive] = useState(Boolean(nowProp));
  const now = nowProp ?? clockNow;
  const [appointments, setAppointmentsState] = useState<Appointment[]>(
    () =>
      defaultAppointments ?? sample.sampleAppointments(nowProp ?? SERVER_NOW),
  );
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(
    () => defaultWaitlist ?? sample.sampleWaitlist(nowProp ?? SERVER_NOW),
  );
  const [history, setHistory] = useState<HistoryEntry[]>(
    () => historyProp ?? sample.sampleHistory(nowProp ?? SERVER_NOW),
  );
  const [view, setView] = useState<View>(defaultView);
  const [focus, setFocus] = useState(startOfDay(now));
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [statsOpen, setStatsOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [fromWaitlist, setFromWaitlist] = useState<string | null>(null);
  const [panel, setPanel] = useState<"waitlist" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    undo?: () => void;
  } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const setAppointments = (next: Appointment[]) => {
    setAppointmentsState(next);
    onAppointmentsChange?.(next);
  };

  // The real clock after mount (see SERVER_NOW); the sample studio moves with it so the demo week is this week.
  useEffect(() => {
    if (nowProp) return;
    const real = new Date();
    setClockNow(real);
    setFocus(startOfDay(real));
    if (!defaultAppointments)
      setAppointmentsState(sample.sampleAppointments(real));
    if (!defaultWaitlist) setWaitlist(sample.sampleWaitlist(real));
    if (!historyProp) setHistory(sample.sampleHistory(real));
    setLive(true);
    const timer = setInterval(() => setClockNow(new Date()), 30_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowProp]);

  useEffect(() => {
    if (scroller.current && view !== "month")
      scroller.current.scrollTop =
        startHour * hourHeight + Math.round(hourHeight * 0.46);
  }, [view, startHour, hourHeight]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const staffById = useMemo(
    () => new Map(staff.map((s) => [s.id, s])),
    [staff],
  );
  const customerById = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  );
  const serviceById = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services],
  );

  const visible = appointments.filter(
    (a) =>
      (!statuses.length || statuses.includes(a.status)) &&
      (!people.length || people.includes(a.staff)),
  );
  const weekStart = startOfWeek(focus);
  const days =
    view === "week"
      ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      : [focus];
  const shownStaff = staff.filter(
    (s) => !people.length || people.includes(s.id),
  );
  const isClosed = (d: Date) => closedDays.includes(d.getDay());

  /* ------------------------------- Actions ------------------------------- */

  const page = (dir: -1 | 1) =>
    setFocus(
      view === "month"
        ? new Date(focus.getFullYear(), focus.getMonth() + dir, 1)
        : addDays(focus, view === "week" ? dir * 7 : dir),
    );
  const open = (a: Appointment) => {
    if (view !== "staff" && !days.some((d) => sameDay(d, a.start)))
      setFocus(startOfDay(a.start));
    if (view === "staff" && !sameDay(focus, a.start))
      setFocus(startOfDay(a.start));
    setSelected(a.id);
    setEditing(null);
  };
  const close = () => {
    if (draft) setAppointments(appointments.filter((a) => a.id !== draft));
    setSelected(null);
    setEditing(null);
    setDraft(null);
    setFromWaitlist(null);
  };
  const startDraft = (
    start: Date,
    minutes = 60,
    prefill: Partial<Appointment> = {},
  ) => {
    const base = appointments.filter((a) => a.id !== draft);
    const a: Appointment = {
      id: `new-${Date.now()}`,
      customer: "",
      service: "",
      staff: prefill.staff ?? shownStaff[0]?.id ?? staff[0].id,
      start,
      end: new Date(+start + minutes * 60_000),
      status: "booked",
      ...prefill,
    };
    setAppointments([...base, a]);
    if (
      view === "month" ||
      (view !== "staff" && !days.some((d) => sameDay(d, start)))
    ) {
      if (view === "month") setView("week");
      setFocus(startOfDay(start));
    }
    setSelected(a.id);
    setEditing(a.id);
    setDraft(a.id);
    requestAnimationFrame(() => {
      const el = scroller.current;
      if (el)
        el.scrollTop = Math.max(0, (minutesOf(start) / 60) * hourHeight - 120);
    });
  };
  const save: CardCtx["save"] = (id, patch, repeatWeeks) => {
    const base = appointments.find((a) => a.id === id);
    if (!base) return;
    const updated = { ...base, ...patch };
    const copies = Array.from(
      { length: Math.max(0, repeatWeeks - 1) },
      (_, i) => ({
        ...updated,
        id: `${id}-r${i + 1}`,
        start: addDaysKeepTime(updated.start, 7 * (i + 1)),
        end: addDaysKeepTime(updated.end, 7 * (i + 1)),
      }),
    );
    setAppointments([
      ...appointments.map((a) => (a.id === id ? updated : a)),
      ...copies,
    ]);
    if (fromWaitlist)
      setWaitlist(waitlist.filter((w) => w.id !== fromWaitlist));
    // A new booking is done once saved; an edit goes back to its details.
    if (draft === id) setSelected(null);
    setEditing(null);
    setDraft(null);
    setFromWaitlist(null);
    if (!days.some((d) => sameDay(d, updated.start)) && view !== "staff")
      setFocus(startOfDay(updated.start));
    if (copies.length)
      setToast({ message: `Booked ${copies.length + 1} weekly sessions` });
  };
  const cancelAppointment = (id: string) => {
    const before = appointments;
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, status: "cancelled" as Status } : a,
      ),
    );
    setSelected(null);
    setToast({
      message: "Appointment cancelled",
      undo: () => setAppointments(before),
    });
  };
  const setStatus = (id: string, status: Status) =>
    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    );

  /** The first open slot of `minutes` for `who` (any staff when unset), from `from`, inside opening hours, skipping closed days. */
  const nextFree = (
    minutes: number,
    who: string | undefined,
    from: Date,
    list = appointments,
  ) => {
    const busy = (s: string, a: Date, b: Date) =>
      list.some(
        (x) =>
          x.staff === s &&
          x.status !== "cancelled" &&
          +x.start < +b &&
          +x.end > +a,
      );
    let t = new Date(Math.ceil(+from / (30 * 60_000)) * 30 * 60_000);
    for (let i = 0; i < 14 * 48; i++, t = new Date(+t + 30 * 60_000)) {
      const end = new Date(+t + minutes * 60_000);
      if (
        isClosed(t) ||
        t.getHours() < openHour ||
        minutesOf(end) > closeHour * 60 ||
        !sameDay(t, end)
      )
        continue;
      const pick = who
        ? busy(who, t, end)
          ? undefined
          : who
        : staff.find((s) => !busy(s.id, t, end))?.id;
      if (pick) return { start: t, staff: pick };
    }
    return null;
  };
  const addAppointment = () => {
    const slot = nextFree(
      60,
      undefined,
      +focus > +now ? at(focus, openHour * 60) : now,
    );
    if (slot) startDraft(slot.start, 60, { staff: slot.staff });
  };
  const bookFromWaitlist = (w: WaitlistEntry) => {
    const s = serviceById.get(w.service);
    const slot = nextFree(s?.minutes ?? 60, w.staff, now);
    if (!slot)
      return setToast({ message: "No free slot in the next two weeks" });
    setPanel(null);
    startDraft(slot.start, s?.minutes ?? 60, {
      customer: w.customer,
      service: w.service,
      staff: slot.staff,
    });
    setFromWaitlist(w.id);
  };
  // Books everyone it can into their first free slot, in the order they joined; one Undo puts it all back.
  const autoFill = () => {
    const before = { appointments, waitlist };
    let list = appointments;
    const booked: string[] = [];
    for (const w of [...waitlist].sort((a, b) => +a.since - +b.since)) {
      const s = serviceById.get(w.service);
      const slot = nextFree(s?.minutes ?? 60, w.staff, now, list);
      if (!slot) continue;
      list = [
        ...list,
        {
          id: `auto-${w.id}`,
          customer: w.customer,
          service: w.service,
          staff: slot.staff,
          start: slot.start,
          end: new Date(+slot.start + (s?.minutes ?? 60) * 60_000),
          status: "booked",
        },
      ];
      booked.push(w.id);
    }
    if (!booked.length)
      return setToast({
        message: "Nothing to fill: the waitlist is empty or the week is full",
      });
    setAppointments(list);
    setWaitlist(waitlist.filter((w) => !booked.includes(w.id)));
    setToast({
      message: `Booked ${booked.length} from the waitlist`,
      undo: () => (
        setAppointments(before.appointments),
        setWaitlist(before.waitlist)
      ),
    });
  };

  // Keyboard: N new, T today, arrows page, / search, W waitlist.
  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        el.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
        el.closest('[role="dialog"],[role="menu"],[role="listbox"]')
      )
        return;
      const act: Record<string, () => void> = {
        n: addAppointment,
        t: () => setFocus(startOfDay(now)),
        ArrowLeft: () => page(-1),
        ArrowRight: () => page(1),
        "/": () => setSearchOpen(true),
        w: () => setPanel(panel ? null : "waitlist"),
      };
      const run = act[e.key] ?? act[e.key.toLowerCase()];
      if (!run) return;
      e.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const ctx: CardCtx = {
    staff,
    customers,
    services,
    appointments,
    staffById,
    customerById,
    serviceById,
    draft,
    close,
    edit: (id) => setEditing(id),
    stopEditing: () => setEditing(null),
    save,
    cancelAppointment,
    setStatus,
  };
  const grid: GridCtx = {
    card: ctx,
    now,
    live,
    hourHeight,
    selected,
    editing,
    draft,
    open,
    close,
    startDraft,
    isClosed,
  };

  /* ------------------------------- Derived ------------------------------- */

  const todays = appointments.filter(
    (a) =>
      sameDay(a.start, now) &&
      a.status !== "cancelled" &&
      a.status !== "no-show",
  );
  const revenue = todays.reduce(
    (n, a) => n + (serviceById.get(a.service)?.price ?? 0),
    0,
  );
  const stats = useMemo(() => computeStats(history, now), [history, now]);
  const label = fmt(view === "week" ? weekStart : focus, { month: "short" });
  const year = (view === "week" ? weekStart : focus).getFullYear();

  return (
    <div
      className={cn(
        "@container relative flex h-full min-h-0 flex-col overflow-hidden bg-card font-sans text-foreground",
        className,
      )}
    >
      {/* ------------------------------ Header ------------------------------ */}
      <header className="flex h-[42px] shrink-0 items-center gap-2 ps-[23px] pe-[14px]">
        <h1 className="min-w-0 flex-1 truncate text-[21.5px] leading-7 font-semibold tracking-[-0.015em]">
          {title}
        </h1>
        <RevenueChip total={revenue} items={todays} serviceById={serviceById} />
        <ShiftTimer />
        <span
          aria-hidden
          className="mx-2 hidden h-8 w-px bg-border/80 @2xl:block"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Signed in as ${user.name}`}
            className={cn(
              "grid size-9 cursor-pointer place-items-center rounded-full text-[13px] font-semibold text-white",
              focusRing,
            )}
            style={{
              background:
                "color-mix(in oklch, var(--tone-orange-solid) 85%, var(--destructive))",
            }}
          >
            {user.initials}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[12px] font-normal">
              Shortcuts: N new · T today · ← → move · / search · W waitlist
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ------------------------------ Toolbar ------------------------------ */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-2 ps-[23px] pe-[17px] pt-[18px] pb-1">
        <button
          type="button"
          onClick={() => setFocus(startOfDay(now))}
          className={cn(pillButton, "px-[9px]")}
        >
          Today
        </button>
        <span className="ms-2.5 text-[15px] leading-5 tabular-nums">
          <span className="font-semibold">{label}</span>{" "}
          <span className="text-foreground/75">{year}</span>
        </span>
        <span className="ms-[7px] flex items-center gap-2">
          <RoundButton
            label={`Previous ${view === "staff" ? "day" : view}`}
            onClick={() => page(-1)}
            icon={ChevronLeft}
          />
          <RoundButton
            label={`Next ${view === "staff" ? "day" : view}`}
            onClick={() => page(1)}
            icon={ChevronRight}
          />
        </span>
        {/* Narrow: date and Add share the first row; views and filters wrap below. */}
        <div className="order-last flex basis-full flex-wrap items-center gap-2 @3xl:order-none @3xl:basis-auto">
          <span
            aria-hidden
            className="mx-3 hidden h-6 w-px bg-border/80 @3xl:block"
          />
          <div
            role="radiogroup"
            aria-label="View"
            className="flex h-[32px] basis-full items-center rounded-[10px] bg-foreground/[0.045] p-[3px] @md:basis-auto"
          >
            {(["day", "week", "month", "staff"] as View[]).map((v, i, all) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "relative h-full flex-1 cursor-pointer rounded-[8px] px-[13px] text-[14px] leading-4 font-medium capitalize text-foreground/45 transition-colors hover:text-foreground/75",
                  i > 0 &&
                    view !== v &&
                    view !== all[i - 1] &&
                    "before:absolute before:inset-y-2 before:start-0 before:w-px before:bg-foreground/10",
                  view === v &&
                    "bg-card text-[color:var(--tone-cyan-solid)] shadow-[0_1px_2px_rgb(0_0_0/0.08)]",
                  focusRing,
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <FilterMenu
            label={
              statuses.length
                ? statuses.length === 1
                  ? STATUS_NAME[statuses[0]]
                  : `${statuses.length} statuses`
                : "All status"
            }
            icon={CircleCheck}
            options={sample.STATUSES.map((s) => ({
              id: s.id,
              name: s.name,
              mark: (
                <span
                  className="size-2 rounded-full"
                  style={{ background: tone(s.tone) }}
                />
              ),
            }))}
            value={statuses}
            onChange={(v) => setStatuses(v as Status[])}
          />
          <FilterMenu
            label={
              people.length
                ? people.length === 1
                  ? staffById.get(people[0])!.name.split(" ")[0]
                  : `${people.length} staff`
                : "All staff"
            }
            icon={User}
            options={staff.map((s) => ({
              id: s.id,
              name: s.name,
              mark: (
                <span
                  className="size-2 rounded-full"
                  style={{ background: tone(s.tone) }}
                />
              ),
            }))}
            value={people}
            onChange={setPeople}
          />
        </div>
        <div className="ms-auto flex items-center gap-3.5">
          <button
            type="button"
            onClick={addAppointment}
            className={cn(
              "flex h-9 cursor-pointer items-center gap-3 rounded-[9px] px-2 text-[15px] @md:ps-3.5 @md:pe-[7px] leading-5 font-medium text-white shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.2)] transition-[filter] hover:brightness-95",
              focusRing,
            )}
            style={{ background: TEAL }}
          >
            <Plus className="size-5 @md:hidden" aria-hidden />
            <span className="sr-only @md:not-sr-only">Add appointment</span>
            <kbd
              aria-hidden
              className="hidden h-[22px] min-w-[26px] place-items-center rounded-[6px] bg-white/20 px-1.5 font-sans @md:grid text-[12.5px] leading-none font-medium"
            >
              N
            </kbd>
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={statsOpen ? "Hide stats" : "Show stats"}
                aria-expanded={statsOpen}
                onClick={() => setStatsOpen(!statsOpen)}
                className={cn(
                  "grid size-[34px] cursor-pointer place-items-center rounded-full bg-foreground/[0.045] text-foreground/60 transition-colors hover:bg-foreground/[0.08] hover:text-foreground",
                  focusRing,
                )}
              >
                <ChevronUp
                  className={cn(
                    "size-4 transition-transform duration-200",
                    !statsOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {statsOpen ? "Hide stats" : "Show stats"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* ------------------------------ Stats ------------------------------ */}
      <div
        className={cn(
          "grid shrink-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          statsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden" inert={!statsOpen}>
          <div className="flex snap-x scroll-px-[23px] gap-[14px] overflow-x-auto px-[23px] pt-4 pb-5 [scrollbar-width:none] @4xl:grid @4xl:grid-cols-4 @4xl:overflow-visible @4xl:ps-[23px] @4xl:pe-4">
            {stats.map((s) => (
              <StatCard key={s.title} stat={s} />
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------ Calendar ------------------------------ */}
      <div className="relative flex min-h-0 flex-1 border-t border-border/80 bg-card">
        {view === "month" ? (
          <MonthGrid
            focus={focus}
            now={now}
            live={live}
            appointments={visible}
            grid={grid}
            onDay={(d) => (setFocus(d), setView("day"))}
          />
        ) : (
          <div
            ref={scroller}
            className="relative min-h-0 min-w-0 flex-1 overflow-auto [scrollbar-width:thin]"
          >
            <TimeGrid
              columns={
                view === "staff"
                  ? shownStaff.map((s) => ({
                      key: s.id,
                      day: focus,
                      staffId: s.id,
                      items: visible.filter(
                        (a) => a.staff === s.id && sameDay(a.start, focus),
                      ),
                    }))
                  : days.map((d) => ({
                      key: String(+d),
                      day: d,
                      items: visible.filter((a) => sameDay(a.start, d)),
                    }))
              }
              view={view}
              grid={grid}
              staffById={staffById}
              minColumn={view === "week" ? 132 : view === "staff" ? 150 : 300}
            />
          </div>
        )}

        {/* The waitlist rail on the right edge. */}
        <div
          className="hidden shrink-0 flex-col items-center border-s border-border/80 bg-card pt-[14px] @3xl:flex"
          style={{ width: RAIL }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Waitlist, ${waitlist.length} waiting`}
                aria-expanded={panel === "waitlist"}
                onClick={() => setPanel(panel ? null : "waitlist")}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-3 rounded-[6px] py-1 text-foreground/60 hover:text-foreground",
                  focusRing,
                )}
              >
                <Menu className="size-4 text-foreground/45" aria-hidden />
                {waitlist.length ? (
                  <span
                    aria-hidden
                    className="mt-5 -mb-2 size-[6px] rounded-full bg-destructive/85"
                  />
                ) : (
                  <span className="mt-5" />
                )}
                <span className="relative rotate-180 text-[13px] leading-none whitespace-nowrap [writing-mode:vertical-rl]">
                  <span className="font-semibold text-foreground/80">
                    {waitlist.length}
                  </span>{" "}
                  waitlist
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Open the waitlist · W</TooltipContent>
          </Tooltip>
        </div>

        {panel === "waitlist" ? (
          <WaitlistPanel
            entries={waitlist}
            now={now}
            customerById={customerById}
            serviceById={serviceById}
            staffById={staffById}
            onBook={bookFromWaitlist}
            onRemove={(id) => setWaitlist(waitlist.filter((w) => w.id !== id))}
            onFill={autoFill}
            onClose={() => setPanel(null)}
          />
        ) : null}
      </div>

      {/* ------------------------------ Floating tools ------------------------------ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex flex-col items-center gap-2">
        {toast ? (
          <div
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-[10px] bg-foreground px-3.5 py-2 text-[13px] text-background shadow-[0_12px_32px_-8px_rgb(0_0_0/0.35)]"
          >
            {toast.message}
            {toast.undo ? (
              <button
                type="button"
                onClick={() => (toast.undo!(), setToast(null))}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-[6px] px-1.5 py-0.5 font-medium text-[color:var(--tone-cyan-solid)] hover:bg-background/10",
                  focusRing,
                )}
              >
                <Undo className="size-3.5" aria-hidden />
                Undo
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-[12px] bg-[color-mix(in_oklch,var(--foreground)_92%,var(--tone-cyan-solid))] px-2 py-1 text-background shadow-[0_14px_34px_-10px_rgb(0_0_0/0.45)] dark:bg-[color-mix(in_oklch,var(--muted)_92%,white)] dark:text-foreground">
          <SearchPopover
            open={searchOpen}
            onOpenChange={setSearchOpen}
            appointments={appointments}
            customerById={customerById}
            serviceById={serviceById}
            onPick={(a) => (setSearchOpen(false), open(a))}
          />
          <span
            aria-hidden
            className="mx-1.5 h-5 w-px bg-background/20 dark:bg-foreground/20"
          />
          <DockButton
            label={`Waitlist · ${waitlist.length}`}
            onClick={() => setPanel(panel ? null : "waitlist")}
            icon={UsersFill}
          />
          <DockButton
            label="Auto-fill from the waitlist"
            onClick={autoFill}
            icon={SparklesFill}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Shared ---------------------------------- */

const STATUS_NAME = Object.fromEntries(
  sample.STATUSES.map((s) => [s.id, s.name]),
) as Record<Status, string>;
const pillButton = cn(
  "h-[30px] shrink-0 cursor-pointer rounded-[9px] border border-border/90 bg-card text-[14px] leading-5 font-medium text-foreground/85 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-muted/60",
  focusRing,
);

function addDaysKeepTime(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function RoundButton({
  label,
  onClick,
  icon: I,
}: {
  label: string;
  onClick: () => void;
  icon: typeof X;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-5 cursor-pointer place-items-center rounded-full border border-border/90 bg-card text-foreground/55 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:text-foreground",
        focusRing,
      )}
    >
      <I className="size-[11px] rtl:rotate-180" aria-hidden />
    </button>
  );
}

function DockButton({
  label,
  onClick,
  icon: I,
}: {
  label: string;
  onClick: () => void;
  icon: typeof X;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "grid size-10 cursor-pointer place-items-center rounded-[9px] transition-colors hover:bg-background/10 dark:hover:bg-foreground/10",
            focusRing,
          )}
        >
          <I className="size-[21px]" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function FilterMenu({
  label,
  icon: I,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: typeof X;
  options: { id: string; name: string; mark: ReactNode }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          pillButton,
          "flex items-center gap-2 ps-2.5 pe-2 aria-expanded:bg-muted",
          value.length &&
            "border-[color:color-mix(in_oklch,var(--tone-cyan-solid)_45%,var(--border))]",
        )}
      >
        <I className="size-4 text-foreground/55" aria-hidden />
        <span className="max-w-32 truncate">{label}</span>
        <ChevronDown className="size-3.5 text-foreground/45" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.id}
            checked={value.includes(o.id)}
            closeOnSelect={false}
            onCheckedChange={(on) =>
              onChange(on ? [...value, o.id] : value.filter((x) => x !== o.id))
            }
            className="gap-2"
          >
            {o.mark}
            {o.name}
          </DropdownMenuCheckboxItem>
        ))}
        {value.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])}>
              Show all
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RevenueChip({
  total,
  items,
  serviceById,
}: {
  total: number;
  items: Appointment[];
  serviceById: Map<string, Service>;
}) {
  const byService = new Map<
    string,
    { name: string; count: number; sum: number }
  >();
  for (const a of items) {
    const s = serviceById.get(a.service);
    if (!s) continue;
    const row = byService.get(s.id) ?? { name: s.name, count: 0, sum: 0 };
    row.count++;
    row.sum += s.price;
    byService.set(s.id, row);
  }
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Booked today: ${money(total)}`}
        className={cn(
          "hidden h-[34px] cursor-pointer items-center gap-2.5 rounded-[9px] bg-foreground/[0.045] ps-2.5 pe-3 text-[14px] font-medium text-foreground/70 tabular-nums transition-colors hover:bg-foreground/[0.07] @2xl:flex",
          focusRing,
        )}
      >
        <Receipt className="size-4 text-foreground/55" aria-hidden />
        {money(total)}
        <ChevronRight className="size-3.5 text-foreground/45" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-[12px] p-3"
      >
        <p className="text-[12px] font-medium text-foreground/50">
          Booked today
        </p>
        <p className="mt-0.5 text-[20px] font-semibold tabular-nums">
          {money(total)}
        </p>
        <ul className="mt-2.5 flex flex-col gap-1.5 border-t border-border/80 pt-2.5">
          {[...byService.values()].map((r) => (
            <li key={r.name} className="flex items-center gap-2 text-[13px]">
              <span className="flex-1 truncate text-foreground/75">
                {r.name}
              </span>
              <span className="text-foreground/45">×{r.count}</span>
              <span className="w-16 text-end tabular-nums">{money(r.sum)}</span>
            </li>
          ))}
          {!byService.size ? (
            <li className="text-[13px] text-foreground/50">
              Nothing booked today.
            </li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/** Time on shift since clock-in, with a break button. Starts 2h19m in. */
function ShiftTimer() {
  // The clock is read only in effects and handlers, never while rendering, so the server render is stable.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pausedTotal, setPausedTotal] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    setStartedAt(t0 - (2 * 60 + 19) * 60_000);
    setNowMs(t0);
    const t = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);
  const mins =
    startedAt === null
      ? 2 * 60 + 19
      : Math.floor(
          Math.max(0, (pausedAt ?? nowMs) - startedAt - pausedTotal) / 60_000,
        );
  const toggle = () => {
    const t = Date.now();
    if (pausedAt) {
      setPausedTotal(pausedTotal + t - pausedAt);
      setPausedAt(null);
    } else setPausedAt(t);
    setNowMs(t);
  };
  return (
    <div className="hidden h-[34px] items-center gap-2 rounded-[9px] bg-foreground/[0.045] ps-2.5 pe-1 text-[14px] font-medium text-foreground/70 tabular-nums @2xl:flex">
      <Clock className="size-4 text-foreground/55" aria-hidden />
      <span
        aria-label={`${pausedAt ? "On break" : "On shift"}: ${Math.floor(mins / 60)} hours ${mins % 60} minutes`}
      >
        {`${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`}
      </span>
      {pausedAt ? (
        <span className="text-[12px] text-foreground/50">break</span>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={pausedAt ? "End break" : "Start break"}
            onClick={toggle}
            className={cn(
              "grid size-[26px] cursor-pointer place-items-center rounded-[7px] bg-card text-foreground/80 shadow-[0_1px_2px_rgb(0_0_0/0.1)] transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            {pausedAt ? (
              <PlayFill className="size-3.5" aria-hidden />
            ) : (
              <PauseFill className="size-3.5" aria-hidden />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {pausedAt ? "End break" : "Start break"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/* ----------------------------------- Stats ----------------------------------- */

type Stat = {
  title: string;
  hint: string;
  value: string;
  unit?: string;
  change: number;
  goodWhenUp: boolean;
  glow: string;
};

function computeStats(history: HistoryEntry[], now: Date): Stat[] {
  const today = startOfDay(now);
  const inRange = (from: number, to: number) =>
    history.filter(
      (h) => +h.day >= +addDays(today, -to) && +h.day < +addDays(today, -from),
    );
  const cur = inRange(0, 7);
  const prev = inRange(7, 14);
  const rate = (list: HistoryEntry[], s: Status) => {
    const held = list.filter((h) => h.status !== "cancelled");
    return held.length
      ? list.filter((h) => h.status === s).length / held.length
      : 0;
  };
  const avgWait = (list: HistoryEntry[]) => {
    const w = list
      .map((h) => h.waitHours)
      .filter((x): x is number => x !== undefined);
    return w.length ? w.reduce((a, b) => a + b, 0) / w.length : 0;
  };
  const change = (a: number, b: number) =>
    b ? Math.round(((a - b) / b) * 100) : 0;
  const total = cur.filter((h) => h.status !== "cancelled").length;
  const totalPrev = prev.filter((h) => h.status !== "cancelled").length;
  return [
    {
      title: "Total appointments",
      hint: "Booked in the last 7 days, cancellations left out.",
      value: String(total),
      change: change(total, totalPrev),
      goodWhenUp: true,
      glow: "blue",
    },
    {
      title: "Completed",
      hint: "Share of held appointments that were completed.",
      value: String(Math.round(rate(cur, "completed") * 100)),
      unit: "%",
      change: change(rate(cur, "completed"), rate(prev, "completed")),
      goodWhenUp: true,
      glow: "cyan",
    },
    {
      title: "No-shows",
      hint: "Share of held appointments nobody turned up for.",
      value: String(Math.round(rate(cur, "no-show") * 100)),
      unit: "%",
      change: change(rate(cur, "no-show"), rate(prev, "no-show")),
      goodWhenUp: false,
      glow: "pink",
    },
    {
      title: "Avg. waitlist time",
      hint: "How long people waited for a slot, on average.",
      value: avgWait(cur).toFixed(1),
      unit: "hrs",
      change: change(avgWait(cur), avgWait(prev)),
      goodWhenUp: false,
      glow: "cyan",
    },
  ];
}

function StatCard({ stat: s }: { stat: Stat }) {
  const good = s.change === 0 ? null : s.change > 0 === s.goodWhenUp;
  const glow =
    s.glow === "pink"
      ? "color-mix(in oklch, var(--tone-violet-solid) 55%, var(--destructive))"
      : `var(--tone-${s.glow}-solid)`;
  return (
    <div
      className="relative w-[250px] shrink-0 snap-start overflow-hidden rounded-[13px] border border-border/80 bg-card px-4 pt-[11px] pb-3 shadow-[0_1px_2px_rgb(0_0_0/0.03)] @4xl:w-auto"
      // A soft glow in the corner.
      style={{
        backgroundImage: `radial-gradient(120% 90% at 85% 0%, color-mix(in oklch, ${glow} 9%, transparent), transparent 60%)`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <h3 className="text-[12.5px] leading-4 font-semibold">{s.title}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`About ${s.title}`}
              className={cn(
                "grid size-4 cursor-help place-items-center rounded-full text-foreground/40 hover:text-foreground/70",
                focusRing,
              )}
            >
              <Info className="size-3.5" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56">
            {s.hint}
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="mt-1 text-[12px] leading-4 text-foreground/45">
        Last 7 days
      </p>
      <div className="mt-[19px] flex items-end gap-2">
        <p className="text-[23px] leading-7 font-semibold tracking-[-0.02em] tabular-nums">
          {s.value}
          {s.unit ? (
            <span
              className={cn(
                "font-semibold",
                s.unit === "%" ? "text-[17px]" : "ms-1 text-[17px]",
              )}
            >
              {s.unit}
            </span>
          ) : null}
        </p>
        <span className="ms-auto mb-1 flex items-center gap-2 text-[12px] whitespace-nowrap text-foreground/45">
          <span
            className="rounded-[6px] px-1.5 py-0.5 text-[11.5px] leading-4 font-semibold tabular-nums"
            style={{
              background: good === false ? tint("pink", 18) : tint("cyan", 18),
              color: good === false ? accent("pink") : accent("cyan"),
            }}
          >
            {s.change > 0 ? "+" : ""}
            {s.change}%
          </span>
          vs last week
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------- Time grid ---------------------------------- */

type GridCtx = {
  card: CardCtx;
  now: Date;
  live: boolean;
  hourHeight: number;
  selected: string | null;
  editing: string | null;
  draft: string | null;
  open: (a: Appointment) => void;
  close: () => void;
  startDraft: (
    start: Date,
    minutes?: number,
    prefill?: Partial<Appointment>,
  ) => void;
  isClosed: (d: Date) => boolean;
};
type Column = {
  key: string;
  day: Date;
  staffId?: string;
  items: Appointment[];
};

function TimeGrid({
  columns,
  view,
  grid,
  staffById,
  minColumn,
}: {
  columns: Column[];
  view: View;
  grid: GridCtx;
  staffById: Map<string, Staff>;
  minColumn: number;
}) {
  const { hourHeight: H, now, live } = grid;
  const showNow = live && columns.some((c) => sameDay(c.day, now));
  // The browser's zone is only known after mount. Long offsets ("+5:30") go on a second line, like the hour labels.
  const offset = live ? fmtOffset(now) : "";
  return (
    <div style={{ minWidth: GUTTER + columns.length * minColumn }}>
      <div className="sticky top-0 z-20 flex h-[52px] border-b border-border/80 bg-card">
        <div
          className="sticky start-0 z-10 flex shrink-0 items-center justify-end bg-[color-mix(in_oklch,var(--background)_45%,var(--card))] pe-1 text-[11.5px] whitespace-nowrap text-foreground/40"
          style={{ width: GUTTER }}
        >
          {offset.length > 2 ? (
            <span className="text-end text-[10.5px] leading-[13px]">
              GMT
              <br />
              {offset}
            </span>
          ) : (
            `GMT${offset}`
          )}
        </div>
        {columns.map((c) => {
          const closed = !c.staffId && grid.isClosed(c.day);
          const isToday = live && sameDay(c.day, now);
          const count = c.items.filter(
            (a) => a.status !== "cancelled" && a.id !== grid.draft,
          ).length;
          if (c.staffId) {
            const s = staffById.get(c.staffId)!;
            return (
              <div
                key={c.key}
                className="flex min-w-0 flex-1 items-center gap-2.5 border-s border-border/60 ps-3"
              >
                <Avatar initials={s.initials} t={s.tone} size={26} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] leading-4 font-semibold">
                    {s.name}
                  </span>
                  <span className="block text-[11.5px] leading-4 text-foreground/45">
                    {count} appointment{count === 1 ? "" : "s"}
                  </span>
                </span>
              </div>
            );
          }
          return (
            <div
              key={c.key}
              className="flex min-w-0 flex-1 items-center gap-1.5 ps-3"
            >
              <span
                className={cn(
                  "grid h-[26px] min-w-[28px] place-items-center rounded-[6px] px-1 text-[16.5px] leading-none font-semibold tabular-nums",
                  isToday && "text-white",
                )}
                style={isToday ? { background: TEAL } : undefined}
              >
                {c.day.getDate()}
              </span>
              <span className="min-w-0">
                <span className="block text-[11.5px] leading-[14px] font-bold tracking-[0.02em] uppercase">
                  {fmt(c.day, { weekday: "short" })}
                </span>
                <span className="block truncate text-[11.5px] leading-[14px] text-foreground/45">
                  {closed
                    ? "Closed"
                    : `${count} appointment${count === 1 ? "" : "s"}`}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative flex" style={{ height: 24 * H }}>
        <div
          aria-hidden
          className="sticky start-0 z-10 shrink-0 bg-[color-mix(in_oklch,var(--background)_45%,var(--card))]"
          style={{ width: GUTTER }}
        >
          {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => {
            // The current time takes the place of the hour label it falls near.
            const nearNow = showNow && Math.abs(minutesOf(now) - h * 60) < 25;
            if (nearNow) return null;
            const d = new Date(2000, 0, 1, h);
            return (
              <span
                key={h}
                className="absolute end-[7px] -translate-y-1/2 text-end text-[11px] leading-[13px] text-foreground/40 tabular-nums"
                style={{ top: h * H }}
              >
                {fmt(d, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).replace(/ [AP]M$/, "")}
                <br />
                <span className="text-[9.5px]">{h < 12 ? "AM" : "PM"}</span>
              </span>
            );
          })}
          {showNow ? (
            <span
              className="absolute end-[7px] -translate-y-1/2 text-[11px] font-semibold text-destructive tabular-nums"
              style={{ top: (minutesOf(now) / 60) * H }}
            >
              {fmt(now, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).replace(/ [AP]M$/, "")}
            </span>
          ) : null}
        </div>
        {columns.map((c, i) => (
          <GridColumn key={c.key} column={c} grid={grid} first={i === 0} />
        ))}
        {showNow ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-[5] h-px bg-destructive/40"
            style={{ top: (minutesOf(now) / 60) * H, insetInlineStart: GUTTER }}
          />
        ) : null}
      </div>
    </div>
  );
}

function fmtOffset(now: Date) {
  const m = -now.getTimezoneOffset();
  return `${m >= 0 ? "+" : "−"}${Math.floor(Math.abs(m) / 60)}${m % 60 ? `:${pad2(Math.abs(m) % 60)}` : ""}`;
}

function GridColumn({
  column: c,
  grid,
  first,
}: {
  column: Column;
  grid: GridCtx;
  first: boolean;
}) {
  const H = grid.hourHeight;
  const closed = !c.staffId && grid.isClosed(c.day);
  const placed = lanes(c.items);
  const isToday = grid.live && sameDay(c.day, grid.now);
  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target !== e.currentTarget || closed) return;
        const minutes =
          Math.floor(((e.nativeEvent.offsetY / H) * 60) / 30) * 30;
        grid.startDraft(
          at(c.day, minutes),
          60,
          c.staffId ? { staff: c.staffId } : {},
        );
      }}
      className={cn(
        "relative min-w-0 flex-1 border-s border-border/60",
        closed ? "cursor-not-allowed" : "cursor-cell",
      )}
      style={{
        backgroundImage:
          "linear-gradient(to bottom, color-mix(in oklch, var(--border) 70%, transparent) 1px, transparent 1px)",
        backgroundSize: `100% ${H}px`,
        backgroundColor: closed ? "var(--background)" : undefined,
      }}
    >
      {c.items.map((a) => {
        const lane = placed.get(a.id) ?? { lane: 0, of: 1 };
        const top = (minutesOf(a.start) / 60) * H + 2;
        const height = Math.max(24, ((+a.end - +a.start) / 3_600_000) * H - 4);
        return (
          <BookingPopover key={a.id} appt={a} grid={grid}>
            <Booking
              appt={a}
              grid={grid}
              style={{
                top,
                height,
                insetInlineStart: `calc(${(lane.lane / lane.of) * 100}% + 4px)`,
                width: `calc(${100 / lane.of}% - 6px)`,
              }}
            />
          </BookingPopover>
        );
      })}
      {isToday ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-10 h-[2px] bg-destructive/80"
          style={{ top: (minutesOf(grid.now) / 60) * H - 1 }}
        >
          {/* Staff columns all share today: one dot, on the first. */}
          {!c.staffId || first ? (
            <span className="absolute -start-[3px] -top-[3px] size-2 rounded-full bg-destructive" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Booking({
  appt: a,
  grid,
  style,
}: {
  appt: Appointment;
  grid: GridCtx;
  style: CSSProperties;
}) {
  const { staffById, customerById, serviceById } = grid.card;
  const s = staffById.get(a.staff);
  const t = s?.tone ?? "blue";
  const isDraft = grid.draft === a.id;
  const selected = grid.selected === a.id;
  const customer = customerById.get(a.customer);
  const service = serviceById.get(a.service);
  const minutes = (+a.end - +a.start) / 60_000;
  const cancelled = a.status === "cancelled";
  return (
    <PopoverTrigger
      aria-label={`${customer?.name ?? "New appointment"}${service ? `, ${service.name}` : ""}, ${fmt(a.start, { weekday: "long" })} ${range(a.start, a.end)}${a.status !== "booked" ? `, ${STATUS_NAME[a.status]}` : ""}`}
      className={cn(
        "absolute flex cursor-pointer flex-col overflow-clip rounded-[5px] ps-[9px] pe-1 text-start transition-shadow",
        minutes >= 40 ? "pt-[7px]" : "justify-center",
        selected && "z-10 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.3)]",
        cancelled && "opacity-55",
        focusRing,
      )}
      style={{
        ...style,
        background: isDraft
          ? tint("blue", 16)
          : cancelled
            ? tint(t, 10)
            : fill(t),
        boxShadow: selected
          ? `inset 0 0 0 1.5px ${isDraft ? "var(--tone-blue-solid)" : accent(t)}, 0 6px 16px -6px rgb(0 0 0 / 0.3)`
          : undefined,
      }}
    >
      {/* The colour bar, inset with round ends. */}
      <span
        aria-hidden
        className="absolute inset-y-[4px] start-[3px] w-[2px] rounded-full"
        style={{ background: isDraft ? "var(--tone-blue-solid)" : tone(t) }}
      />
      {/* The label sticks below the day header while the rest of the booking is still in view. */}
      <span className="sticky top-[56px] flex min-w-0 flex-col">
        <span
          className={cn(
            "truncate text-[12.5px] leading-4 text-foreground/80",
            cancelled && "line-through",
          )}
        >
          <span className="tabular-nums">
            {short(a.start)}-{short(a.end)}
          </span>
          {"  "}
          <span className="font-bold text-foreground/90 [word-spacing:0]">
            {customer?.name.split(" ")[0] ?? "New appointment"}
          </span>
        </span>
        {minutes >= 40 ? (
          <span className="mt-[3px] truncate text-[10.5px] leading-[13px] font-medium text-foreground/60">
            {service?.name ?? "Choose a service"}
            {a.status === "no-show" ? " · No-show" : ""}
          </span>
        ) : null}
      </span>
      {(a.notes || a.group) && minutes >= 60 ? (
        <span className="absolute end-1.5 bottom-1.5 flex items-center gap-1 text-foreground/50">
          {a.group ? (
            <Users className="size-3" aria-label="Group class" />
          ) : null}
          {a.notes ? (
            <StickyNote className="size-3" aria-label="Has notes" />
          ) : null}
        </span>
      ) : null}
    </PopoverTrigger>
  );
}

function BookingPopover({
  appt,
  grid,
  children,
}: {
  appt: Appointment;
  grid: GridCtx;
  children: ReactNode;
}) {
  const open = grid.selected === appt.id;
  return (
    <Popover
      open={open}
      onOpenChange={(next) => (next ? grid.open(appt) : grid.close())}
    >
      {children}
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        collisionPadding={12}
        className="w-[373px] max-w-[calc(100vw-24px)] gap-0 overflow-hidden rounded-[14px] bg-card p-0 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_20px_48px_-12px_rgb(0_0_0/0.28)] ring-1 ring-border/80"
      >
        {grid.editing === appt.id ? (
          <AppointmentForm key={`f-${appt.id}`} appt={appt} ctx={grid.card} />
        ) : (
          <AppointmentDetails appt={appt} ctx={grid.card} />
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------------- Month ---------------------------------- */

function MonthGrid({
  focus,
  now,
  live,
  appointments,
  grid,
  onDay,
}: {
  focus: Date;
  now: Date;
  live: boolean;
  appointments: Appointment[];
  grid: GridCtx;
  onDay: (d: Date) => void;
}) {
  const start = startOfWeek(new Date(focus.getFullYear(), focus.getMonth(), 1));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const { customerById, staffById } = grid.card;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
      <div className="grid shrink-0 grid-cols-7 border-b border-border/80">
        {cells.slice(0, 7).map((d) => (
          <span
            key={+d}
            className="py-2.5 ps-3 text-[11.5px] font-bold tracking-[0.02em] text-foreground/70 uppercase"
          >
            {fmt(d, { weekday: "short" })}
          </span>
        ))}
      </div>
      <div className="grid min-h-[520px] flex-1 grid-cols-7 grid-rows-6">
        {cells.map((d) => {
          const list = appointments
            .filter((a) => sameDay(a.start, d) && a.status !== "cancelled")
            .sort((a, b) => +a.start - +b.start);
          const outside = d.getMonth() !== focus.getMonth();
          const closed = grid.isClosed(d);
          const isToday = live && sameDay(d, now);
          return (
            <div
              key={+d}
              className={cn(
                "flex min-w-0 flex-col gap-1 border-e border-b border-border/60 p-1.5 [&:nth-child(7n)]:border-e-0",
                (outside || closed) && "bg-foreground/[0.02]",
              )}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onDay(d)}
                  aria-label={`${fmt(d, { weekday: "long", month: "long", day: "numeric" })}: open day`}
                  className={cn(
                    "grid h-6 min-w-6 cursor-pointer place-items-center rounded-[6px] px-1 text-[12.5px] font-semibold tabular-nums hover:bg-foreground/[0.06]",
                    outside && "text-foreground/35",
                    isToday && "text-white hover:brightness-95",
                    focusRing,
                  )}
                  style={isToday ? { background: TEAL } : undefined}
                >
                  {d.getDate()}
                </button>
                {closed ? (
                  <span className="pe-1 text-[11px] text-foreground/40">
                    Closed
                  </span>
                ) : list.length ? (
                  <span className="pe-1 text-[11px] text-foreground/45 tabular-nums">
                    {list.length}
                  </span>
                ) : null}
              </div>
              {list.slice(0, 3).map((a) => {
                const t = staffById.get(a.staff)?.tone ?? "blue";
                return (
                  <BookingPopover key={a.id} appt={a} grid={grid}>
                    <PopoverTrigger
                      className={cn(
                        "flex min-w-0 cursor-pointer items-center gap-1.5 truncate rounded-e-[4px] border-s-2 px-1.5 py-0.5 text-start text-[11.5px] leading-4 text-foreground/80",
                        focusRing,
                      )}
                      style={{
                        borderInlineStartColor: accent(t),
                        background: tint(t, 20),
                      }}
                    >
                      <span className="tabular-nums">
                        {fmt(a.start, {
                          hour: "numeric",
                          minute: "2-digit",
                        }).replace(":00", "")}
                      </span>
                      <span className="truncate font-semibold">
                        {customerById.get(a.customer)?.name.split(" ")[0] ??
                          "New"}
                      </span>
                    </PopoverTrigger>
                  </BookingPopover>
                );
              })}
              {list.length > 3 ? (
                <button
                  type="button"
                  onClick={() => onDay(d)}
                  className={cn(
                    "cursor-pointer rounded-[4px] px-1.5 text-start text-[11.5px] text-foreground/55 hover:text-foreground",
                    focusRing,
                  )}
                >
                  +{list.length - 3} more
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Waitlist ---------------------------------- */

function WaitlistPanel({
  entries,
  now,
  customerById,
  serviceById,
  staffById,
  onBook,
  onRemove,
  onFill,
  onClose,
}: {
  entries: WaitlistEntry[];
  now: Date;
  customerById: Map<string, Customer>;
  serviceById: Map<string, Service>;
  staffById: Map<string, Staff>;
  onBook: (w: WaitlistEntry) => void;
  onRemove: (id: string) => void;
  onFill: () => void;
  onClose: () => void;
}) {
  const waited = (d: Date) => {
    const m = Math.max(1, Math.round((+now - +d) / 60_000));
    return m < 60
      ? `${m} min`
      : m < 1440
        ? `${Math.round(m / 60)} h`
        : `${Math.round(m / 1440)} d`;
  };
  return (
    <aside
      aria-label="Waitlist"
      className="absolute inset-y-0 end-0 z-30 flex w-[320px] max-w-full flex-col border-s border-border/80 bg-card shadow-[-16px_0_40px_-16px_rgb(0_0_0/0.25)]"
    >
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-border/80 ps-4 pe-2">
        <h2 className="flex-1 text-[15px] font-semibold">
          Waitlist{" "}
          <span className="ms-1 font-normal text-foreground/45 tabular-nums">
            {entries.length}
          </span>
        </h2>
        {entries.length ? (
          <button
            type="button"
            onClick={onFill}
            className={cn(
              "flex h-7 cursor-pointer items-center gap-1.5 rounded-[7px] px-2 text-[12.5px] font-medium text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground",
              focusRing,
            )}
          >
            <Sparkles className="size-3.5" aria-hidden />
            Auto-fill
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Close waitlist"
          onClick={onClose}
          className={cn(
            "grid size-7 cursor-pointer place-items-center rounded-[7px] text-foreground/55 hover:bg-foreground/[0.05] hover:text-foreground",
            focusRing,
          )}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
        {entries.length ? (
          [...entries]
            .sort((a, b) => +a.since - +b.since)
            .map((w) => {
              const c = customerById.get(w.customer);
              const s = serviceById.get(w.service);
              const who = w.staff ? staffById.get(w.staff) : undefined;
              return (
                <li
                  key={w.id}
                  className="group/w flex items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-foreground/[0.03]"
                >
                  {c ? (
                    <Avatar initials={c.initials} t={c.tone} size={32} />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium">
                      {c?.name}
                    </p>
                    <p className="truncate text-[12px] text-foreground/55">
                      {s?.name}
                      {who ? ` · ${who.name.split(" ")[0]}` : ""}
                    </p>
                    <p className="text-[11.5px] text-foreground/40">
                      Waiting {waited(w.since)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook(w)}
                    className={cn(
                      "h-7 cursor-pointer rounded-[7px] px-2.5 text-[12.5px] font-medium text-white hover:brightness-95",
                      focusRing,
                    )}
                    style={{ background: TEAL }}
                  >
                    Book
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${c?.name} from the waitlist`}
                    onClick={() => onRemove(w.id)}
                    className={cn(
                      "grid size-7 cursor-pointer place-items-center rounded-[7px] text-foreground/40 hover:bg-foreground/[0.05] hover:text-foreground",
                      focusRing,
                    )}
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              );
            })
        ) : (
          <li className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Check className="size-5 text-foreground/40" aria-hidden />
            <p className="text-[13.5px] text-foreground/55">
              Nobody's waiting.
            </p>
          </li>
        )}
      </ul>
    </aside>
  );
}

/* ---------------------------------- Search ---------------------------------- */

function SearchPopover({
  open,
  onOpenChange,
  appointments,
  customerById,
  serviceById,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  appointments: Appointment[];
  customerById: Map<string, Customer>;
  serviceById: Map<string, Service>;
  onPick: (a: Appointment) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query
    ? appointments
        .filter(
          (a) =>
            a.status !== "cancelled" &&
            `${customerById.get(a.customer)?.name} ${serviceById.get(a.service)?.name}`
              .toLowerCase()
              .includes(query),
        )
        .sort((a, b) => +a.start - +b.start)
        .slice(0, 8)
    : [];
  return (
    <Popover open={open} onOpenChange={(o) => (onOpenChange(o), o || setQ(""))}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger
            aria-label="Search appointments"
            className={cn(
              "grid size-10 cursor-pointer place-items-center rounded-[9px] transition-colors hover:bg-background/10 dark:hover:bg-foreground/10",
              focusRing,
            )}
          >
            <Search
              className="size-[21px] [&_*]:[stroke-width:2.2]"
              aria-hidden
            />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Search · /</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="top"
        sideOffset={12}
        className="w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[14px] p-0"
      >
        <label className="flex h-11 items-center gap-2.5 border-b border-border/80 px-3.5">
          <Search className="size-4 text-foreground/45" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && results[0] && onPick(results[0])
            }
            placeholder="Find a customer or service"
            aria-label="Search appointments"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-foreground/40"
          />
        </label>
        {query ? (
          results.length ? (
            <ul className="max-h-72 overflow-y-auto p-1.5">
              {results.map((a) => {
                const c = customerById.get(a.customer);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onPick(a)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-[8px] px-2 py-2 text-start hover:bg-foreground/[0.05]",
                        focusRing,
                      )}
                    >
                      {c ? (
                        <Avatar initials={c.initials} t={c.tone} size={26} />
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">
                          {c?.name}
                        </span>
                        <span className="block truncate text-[12px] text-foreground/55">
                          {serviceById.get(a.service)?.name} ·{" "}
                          {fmt(a.start, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          , {range(a.start, a.end, true)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-[13px] text-foreground/50">
              No appointments match “{q.trim()}”.
            </p>
          )
        ) : (
          <p className="px-4 py-4 text-[12.5px] text-foreground/45">
            Type a name or a service. Enter opens the first match.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
