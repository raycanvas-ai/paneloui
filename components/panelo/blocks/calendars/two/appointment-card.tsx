"use client";

import {
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  ArrowRight,
  Bin,
  ChevronDown,
  CircleUser,
  Clock,
  Dumbbell,
  NotebookPen,
  Phone,
  SquarePen,
  X,
} from "@keyline-icons/react";

import { Checkbox } from "@/components/panelo/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/panelo/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/panelo/ui/tooltip";
import { cn } from "@/components/panelo/lib/utils";

import {
  STATUSES,
  type Appointment,
  type Customer,
  type Service,
  type Staff,
  type Status,
} from "./data";
import {
  clock,
  duration,
  fmt,
  minutesOf,
  money,
  range,
  sameDay,
  tint,
  tone,
} from "./lib";

/* -------------------------------------------------------------------------- */
/*  The appointment popover: details with status and quick actions, or the     */
/*  form for a new or edited booking. Nothing changes until Save.             */
/* -------------------------------------------------------------------------- */

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type CardCtx = {
  staff: Staff[];
  customers: Customer[];
  services: Service[];
  appointments: Appointment[];
  staffById: Map<string, Staff>;
  customerById: Map<string, Customer>;
  serviceById: Map<string, Service>;
  draft: string | null;
  close: () => void;
  edit: (id: string) => void;
  stopEditing: () => void;
  save: (id: string, patch: Partial<Appointment>, repeatWeeks: number) => void;
  cancelAppointment: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
};

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";
/** A teal from the theme's cyan, so it follows the theme. */
export const TEAL = "var(--tone-cyan-solid)";
// Inline controls read as text until hovered; the primitive's up-down glyph gives way to a chevron.
const inline = cn(
  "-ms-1.5 h-auto w-auto cursor-pointer gap-1.5 rounded-[7px] border-0 bg-transparent px-1.5 py-1 shadow-none hover:bg-foreground/[0.05] dark:bg-transparent dark:hover:bg-foreground/[0.06] aria-expanded:bg-foreground/[0.05] [&>svg:last-child]:hidden",
  focusRing,
);

export function Avatar({
  initials,
  t,
  size = 28,
  className,
}: {
  initials: string;
  t: Customer["tone"];
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: tone(t),
      }}
    >
      {initials}
    </span>
  );
}

function BandAction({
  label,
  icon: I,
  onClick,
}: {
  label: string;
  icon: Icon;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "grid size-[22px] cursor-pointer place-items-center rounded-[6px] text-white/85 transition-colors hover:bg-white/20 hover:text-white",
            focusRing,
          )}
        >
          <I className="size-[14px]" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

/** The coloured band on top, in the staff member's colour. */
function Band({
  t,
  children,
  actions,
}: {
  t: Staff["tone"];
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      className="relative flex h-6 shrink-0 items-center justify-center px-16 text-[12.5px] leading-4 font-semibold text-white"
      style={{ background: tone(t) }}
    >
      <span className="truncate">{children}</span>
      {actions ? (
        <span className="absolute end-1 flex items-center">{actions}</span>
      ) : null}
    </div>
  );
}

function Row({
  icon: I,
  label,
  children,
  className,
}: {
  icon: Icon;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 border-b border-border/60 py-[15px] ps-5 pe-4 last:border-b-0",
        className,
      )}
    >
      <I
        className="mt-[3px] size-[14px] shrink-0 text-foreground/45"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        {label ? (
          <p className="mb-1 text-[12.5px] leading-4 text-foreground/45">
            {label}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/** The popover's frame: a faint wash of the staff colour from the corner. */
export function cardGlow(t: Staff["tone"]) {
  return {
    backgroundImage: `radial-gradient(90% 60% at 0% 100%, color-mix(in oklch, ${tone(t)} 7%, transparent), transparent 70%)`,
  };
}

const primary = cn(
  "h-[38px] cursor-pointer rounded-[10px] px-3.5 text-[14px] font-medium text-white shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.2)] transition-[filter,opacity] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45",
  focusRing,
);
const secondary = cn(
  "h-[38px] cursor-pointer rounded-[10px] border border-border/90 bg-card px-3.5 text-[14px] font-medium text-foreground/75 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-muted/60 hover:text-foreground",
  focusRing,
);

/* --------------------------------- Details --------------------------------- */

export function AppointmentDetails({
  appt: a,
  ctx,
}: {
  appt: Appointment;
  ctx: CardCtx;
}) {
  const customer = ctx.customerById.get(a.customer);
  const service = ctx.serviceById.get(a.service);
  const who = ctx.staffById.get(a.staff);
  const t = who?.tone ?? "blue";
  const minutes = Math.round((+a.end - +a.start) / 60_000);
  const status = STATUSES.find((s) => s.id === a.status)!;
  const next: { status: Status; label: string } | null =
    a.status === "booked"
      ? { status: "confirmed", label: "Confirm" }
      : a.status === "confirmed"
        ? { status: "completed", label: "Check out" }
        : a.status === "cancelled"
          ? { status: "booked", label: "Restore" }
          : null;

  return (
    <div className="flex flex-col" style={cardGlow(t)}>
      <Band
        t={t}
        actions={
          <>
            <BandAction
              label="Edit appointment"
              icon={SquarePen}
              onClick={() => ctx.edit(a.id)}
            />
            {a.status !== "cancelled" ? (
              <BandAction
                label="Cancel appointment"
                icon={Bin}
                onClick={() => ctx.cancelAppointment(a.id)}
              />
            ) : null}
            <BandAction label="Close" icon={X} onClick={ctx.close} />
          </>
        }
      >
        {service?.name ?? "Appointment"}
      </Band>
      <Row icon={CircleUser} label="Customer">
        {customer ? (
          <div className="flex items-center gap-2.5">
            <Avatar initials={customer.initials} t={customer.tone} />
            <div className="min-w-0">
              <p className="truncate text-[14.5px] leading-5">
                {customer.name}
              </p>
              {customer.phone ? (
                <a
                  href={`tel:${customer.phone.replace(/\s/g, "")}`}
                  className={cn(
                    "flex w-fit items-center gap-1 rounded-sm text-[12.5px] leading-4 text-foreground/50 hover:text-foreground",
                    focusRing,
                  )}
                >
                  <Phone className="size-3" aria-hidden />
                  <bdi dir="ltr">{customer.phone}</bdi>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </Row>
      <Row icon={Clock} className="pb-[11px]">
        <p className="text-[14.5px] leading-5 font-semibold">
          {fmt(a.start, { weekday: "long", month: "short", day: "numeric" })}
        </p>
        <p className="mt-2 flex items-center gap-2 text-[14px] leading-5 tabular-nums">
          {clock(a.start)}
          <ArrowRight
            className="size-3.5 text-foreground/60 rtl:rotate-180"
            aria-hidden
          />
          {clock(a.end)}
          <span className="text-foreground/45">· {duration(minutes)}</span>
        </p>
      </Row>
      <Row icon={Dumbbell} label="Service">
        <p className="text-[14.5px] leading-5">
          {service?.name}
          {service ? (
            <span className="ms-1.5 text-foreground/50 tabular-nums">
              · {money(service.price)}
            </span>
          ) : null}
        </p>
        {who ? (
          <p className="mt-2 flex items-center gap-2 text-[13px] leading-5 text-foreground/60">
            <Avatar initials={who.initials} t={who.tone} size={20} />
            with {who.name}
          </p>
        ) : null}
      </Row>
      {a.notes ? (
        <Row icon={NotebookPen}>
          <p className="text-[14px] leading-5 text-pretty text-foreground/80">
            {a.notes}
          </p>
        </Row>
      ) : null}
      <div className="flex items-center gap-2 px-4 pt-1 pb-4">
        <Select
          value={a.status}
          onValueChange={(v) => v && ctx.setStatus(a.id, v as Status)}
        >
          <SelectTrigger
            aria-label="Status"
            className={cn(inline, "ms-1 h-[38px] px-2.5 text-[14px]")}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: tone(status.tone) }}
            />
            {status.name}
            <ChevronDown className="size-3.5 text-foreground/45" aria-hidden />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: tone(s.tone) }}
                />
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {next ? (
          <button
            type="button"
            onClick={() => ctx.setStatus(a.id, next.status)}
            className={cn(
              next.status === "booked" ? secondary : primary,
              "ms-auto",
            )}
            style={next.status === "booked" ? undefined : { background: TEAL }}
          >
            {next.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------- Form ---------------------------------- */

const dateValue = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const steps = Array.from({ length: 96 }, (_, i) => i * 15);
/** "10:00AM", the tight form. */
const label = (m: number) =>
  clock(new Date(2000, 0, 1, 0, m % 1440)).replace(" ", "");

export function AppointmentForm({
  appt: a,
  ctx,
}: {
  appt: Appointment;
  ctx: CardCtx;
}) {
  const isNew = ctx.draft === a.id;
  const [customer, setCustomer] = useState(a.customer);
  const [service, setService] = useState(a.service);
  const [who, setWho] = useState(a.staff);
  const [day, setDay] = useState(dateValue(a.start));
  const [from, setFrom] = useState(minutesOf(a.start));
  const [to, setTo] = useState(
    sameDay(a.start, a.end) ? minutesOf(a.end) : 1440,
  );
  const [repeat, setRepeat] = useState(false);
  const [notes, setNotes] = useState(a.notes ?? "");
  const dateInput = useRef<HTMLInputElement>(null);
  const t = ctx.staffById.get(who)?.tone ?? "blue";
  const c = ctx.customerById.get(customer);

  const [y, mo, d] = day.split("-").map(Number);
  const start = day ? new Date(y, mo - 1, d, 0, from) : null;
  const end = day ? new Date(y, mo - 1, d, 0, to) : null;
  // Warn when the staff member already has someone then; double-booking stays their call.
  const clash =
    start && end
      ? ctx.appointments.find(
          (x) =>
            x.id !== a.id &&
            x.id !== ctx.draft &&
            x.staff === who &&
            x.status !== "cancelled" &&
            +x.start < +end &&
            +x.end > +start,
        )
      : undefined;
  const missing = !customer
    ? "Choose a customer"
    : !service
      ? "Choose a service"
      : null;
  const valid = Boolean(!missing && who && start && end && to > from);

  const pickService = (id: string) => {
    setService(id);
    const s = ctx.serviceById.get(id);
    // The service sets the length; the end can still be moved by hand afterwards.
    if (s) setTo(Math.min(1440, from + s.minutes));
  };
  const close = isNew ? ctx.close : ctx.stopEditing;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && start && end)
          ctx.save(
            a.id,
            {
              customer,
              service,
              staff: who,
              start,
              end,
              notes: notes.trim() || undefined,
            },
            repeat ? 4 : 1,
          );
      }}
      className="flex flex-col"
      style={cardGlow(t)}
    >
      <Band
        t={t}
        actions={
          <BandAction
            label={isNew ? "Discard" : "Stop editing"}
            icon={X}
            onClick={close}
          />
        }
      >
        <Select value={who} onValueChange={(v) => v && setWho(String(v))}>
          <SelectTrigger
            aria-label="Staff"
            className={cn(
              inline,
              "mx-0 h-[22px] gap-1 px-1.5 py-0 text-[12.5px] font-semibold text-white hover:bg-white/20 aria-expanded:bg-white/20 dark:hover:bg-white/20",
            )}
          >
            {isNew ? "New Appointment" : "Edit Appointment"}
            <span className="font-normal text-white/80">
              · {ctx.staffById.get(who)?.name.split(" ")[0]}
            </span>
            <ChevronDown className="size-3 text-white" aria-hidden />
          </SelectTrigger>
          <SelectContent>
            {ctx.staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: tone(s.tone) }}
                />
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Band>
      <Row icon={CircleUser} label="Customer" className="pt-[17px] pb-3">
        <Select
          value={customer || undefined}
          onValueChange={(v) => v && setCustomer(String(v))}
        >
          <SelectTrigger
            aria-label="Customer"
            autoFocus={isNew && !customer}
            className={cn(inline, "gap-2.5 py-0 text-[14.5px]")}
          >
            {c ? (
              <Avatar initials={c.initials} t={c.tone} className="grid!" />
            ) : (
              <span
                aria-hidden
                className="size-7 rounded-full border border-dashed border-foreground/25"
              />
            )}
            <span className={c ? "" : "text-foreground/45"}>
              {c?.name ?? "Choose a customer"}
            </span>
            <ChevronDown className="size-3.5 text-foreground/45" aria-hidden />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {ctx.customers.map((x) => (
              <SelectItem key={x.id} value={x.id}>
                <Avatar initials={x.initials} t={x.tone} size={20} />
                {x.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row icon={Clock} className="pb-[11px]">
        <div className="flex items-center gap-2">
          {/* The day reads as a heading; the native picker does the choosing. */}
          <span className="relative -ms-1.5">
            <button
              type="button"
              onClick={() => dateInput.current?.showPicker?.()}
              className={cn(
                "cursor-pointer rounded-[7px] px-1.5 py-0.5 text-[14.5px] leading-5 font-semibold hover:bg-foreground/[0.05]",
                focusRing,
              )}
            >
              {start
                ? fmt(start, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : "Pick a day"}
            </button>
            <input
              ref={dateInput}
              type="date"
              tabIndex={-1}
              aria-label="Day"
              value={day}
              onChange={(e) => e.target.value && setDay(e.target.value)}
              className="pointer-events-none absolute inset-0 opacity-0"
            />
          </span>
          <label className="ms-auto flex cursor-pointer items-center gap-2.5 text-[14.5px] leading-5">
            <Checkbox
              checked={repeat}
              onCheckedChange={(v) => setRepeat(Boolean(v))}
              className="size-[17px] rounded-[5px]"
            />
            Repeat
          </label>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Select
            value={String(from)}
            onValueChange={(v) => {
              if (v == null) return;
              const next = Number(v);
              setTo(Math.min(1440, next + (to - from)));
              setFrom(next);
            }}
          >
            <SelectTrigger
              aria-label="Starts"
              className={cn(inline, "text-[14px] tabular-nums")}
            >
              {label(from)}
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {steps.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {label(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ArrowRight
            className="size-3.5 shrink-0 text-foreground/70 rtl:rotate-180"
            aria-hidden
          />
          <Select
            value={String(to)}
            onValueChange={(v) => v != null && setTo(Number(v))}
          >
            <SelectTrigger
              aria-label="Ends"
              className={cn(inline, "ms-0 text-[14px] tabular-nums")}
            >
              {label(to)}
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {[...steps.filter((m) => m > from), 1440].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {label(m)}
                  <span className="ms-auto ps-3 text-foreground/45">
                    {duration(m - from)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {repeat && start ? (
            <span className="ms-auto text-[12.5px] text-foreground/50">
              Every {fmt(start, { weekday: "short" })} · 4×
            </span>
          ) : null}
        </div>
        {clash ? (
          <p
            role="status"
            className="mt-2 rounded-[7px] px-2.5 py-1.5 text-[12.5px] text-foreground/80"
            style={{ background: tint("orange", 20) }}
          >
            {ctx.staffById.get(who)?.name.split(" ")[0]} already has{" "}
            {ctx.customerById.get(clash.customer)?.name.split(" ")[0] ??
              "someone"}{" "}
            at {range(clash.start, clash.end, true)}.
          </p>
        ) : null}
      </Row>
      <Row icon={Dumbbell} label="Service" className="pb-3">
        <Select
          value={service || undefined}
          onValueChange={(v) => v && pickService(String(v))}
        >
          <SelectTrigger
            aria-label="Service"
            className={cn(inline, "py-0.5 text-[14.5px]")}
          >
            <span className={service ? "" : "text-foreground/45"}>
              {ctx.serviceById.get(service)?.name ?? "Choose a service"}
            </span>
            <ChevronDown className="size-3.5 text-foreground/45" aria-hidden />
          </SelectTrigger>
          <SelectContent>
            {ctx.services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
                <span className="ms-auto ps-4 text-foreground/45 tabular-nums">
                  {duration(s.minutes)} · {money(s.price)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row icon={NotebookPen} className="border-b-0 pb-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note for the session"
          aria-label="Notes"
          rows={3}
          className="-mt-px h-[66px] w-full resize-none bg-transparent text-[14.5px] leading-5 outline-none placeholder:text-foreground/40"
        />
      </Row>
      <div className="flex items-center justify-end gap-2.5 border-t border-border/60 px-[14px] pt-[15px] pb-[14px]">
        {missing ? (
          <span className="me-auto ps-1.5 text-[12.5px] text-foreground/45">
            {missing}
          </span>
        ) : null}
        <button type="button" onClick={close} className={secondary}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid}
          className={primary}
          style={{ background: TEAL }}
        >
          Save appointment
        </button>
      </div>
    </form>
  );
}
