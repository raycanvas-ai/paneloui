"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  History,
  Plus,
} from "@keyline-icons/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/panelo/ui/popover";
import { cn } from "@/components/panelo/lib/utils";

import { DotMap, Gauge, Heatmap, LineChart, Pie } from "./charts";
import * as sample from "./data";
import type {
  ActivityMetric,
  Channel,
  ChannelStats,
  CountryMetric,
  Granularity,
  Metric,
  Period,
} from "./data";
import {
  CardHeader,
  compact,
  Delta,
  fieldButton,
  Flag,
  focusRing,
  Glyph,
  HATCH,
  num,
  OTHERS,
  Panel,
  Pick,
  press,
  SERIES,
} from "./parts";

/* -------------------------------------------------------------------------- */
/*  Dashboard overview for social channels.                                    */
/*  - The header's period drives every total on the page.                     */
/*  - Overview: today's tally against a goal, one gauge segment per channel;  */
/*    hover a channel card to pick out its share.                             */
/*  - Audience growth: share of followers per channel and a year of           */
/*    engagement; hover a channel to lift its line.                           */
/*  - Most active time: days × 3-hour slots, channels toggle in and out, the  */
/*    peak is named. Audience by age and by country, each with a channel or   */
/*    metric switch.                                                          */
/*  Calm by design: one blue family for data, neutrals for structure.         */
/* -------------------------------------------------------------------------- */

export type DashboardOverviewProps = {
  title?: string;
  channels?: Record<Channel, sample.ChannelStats>;
  defaultPeriod?: Period;
  /** Pin "now" (tests, screenshots). Otherwise the real clock, read after mount. */
  now?: Date;
  className?: string;
};

// The server renders this moment; the browser swaps in the real clock after mount, so hydration matches.
const SERVER_NOW = new Date(2026, 11, 11, 10, 0);
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString("en-US", o);
const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;

export function DashboardOverview({
  title = "Dashboard Overview",
  channels = sample.channels,
  defaultPeriod = 30,
  now: nowProp,
  className,
}: DashboardOverviewProps) {
  const [now, setNow] = useState(nowProp ?? SERVER_NOW);
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  useEffect(() => {
    if (!nowProp) setNow(new Date());
  }, [nowProp]);
  const k = sample.periodScale(period);

  return (
    <div
      className={cn(
        "@container min-h-full bg-muted px-3 pt-[10px] pb-5 font-sans text-foreground dark:bg-background",
        className,
      )}
    >
      {/* ------------------------------ Header ------------------------------ */}
      <header className="flex flex-wrap items-center gap-x-[14px] gap-y-3">
        <h1 className="min-w-0 flex-1 basis-full truncate text-[32px] leading-[48px] font-semibold tracking-[-0.03em] @4xl:basis-auto">
          {title}
        </h1>
        <PeriodPicker period={period} onPeriod={setPeriod} now={now} />
        <UpNext />
        <AddSocial />
      </header>

      {/* ------------------------------ Grid ------------------------------ */}
      <div className="mt-[28px] grid grid-cols-1 gap-[22px] @5xl:grid-cols-[406px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-[25px] @2xl:grid @2xl:grid-cols-2 @2xl:gap-[22px] @5xl:flex @5xl:gap-[25px]">
          <OverviewCard channels={channels} k={k} />
          <ActiveCard k={k} />
        </div>
        <div className="flex min-w-0 flex-col gap-[25px]">
          <GrowthCard channels={channels} k={k} now={now} />
          <div className="grid flex-1 grid-cols-1 gap-[25px] @2xl:grid-cols-2 @2xl:gap-[22px] @5xl:grid-cols-[323px_minmax(0,1fr)] @5xl:gap-[25px]">
            <AgeCard period={period} />
            <CountryCard />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Header ---------------------------------- */

const headerButton = cn(
  "flex h-12 shrink-0 cursor-pointer items-center gap-2.5 rounded-[10px] text-[15.5px] leading-5 font-medium whitespace-nowrap",
  press,
  focusRing,
);

function PeriodPicker({
  period,
  onPeriod,
  now,
}: {
  period: Period;
  onPeriod: (p: Period) => void;
  now: Date;
}) {
  const [open, setOpen] = useState(false);
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - period,
  );
  // One year mark when both ends share it: "Nov 11 – Dec 11, 2026".
  const same = start.getFullYear() === now.getFullYear();
  const label = `${fmt(start, same ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" })} – ${fmt(now, { month: "short", day: "numeric", year: "numeric" })}`;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Period: ${label}`}
        className={cn(
          headerButton,
          "min-w-0 flex-1 basis-full border border-border/80 bg-card ps-4 pe-3.5 shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-muted/60 @lg:w-[280px] @lg:flex-none @lg:basis-auto",
        )}
      >
        <CalendarDays
          className="size-5 shrink-0 text-foreground/75"
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-start tabular-nums">
          {label}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-foreground/60"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[240px] rounded-[12px] p-1.5"
      >
        <div role="radiogroup" aria-label="Period">
          {sample.PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={period === p.id}
              onClick={() => (onPeriod(p.id), setOpen(false))}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-2 text-[13.5px] hover:bg-foreground/[0.05]",
                focusRing,
              )}
            >
              {p.label}
              {period === p.id ? (
                <Check className="size-4" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UpNext() {
  const when = (m: number) =>
    m < 60
      ? `in ${m} min`
      : m < 1440
        ? `in ${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim()
        : "tomorrow";
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          headerButton,
          "flex-1 justify-center border border-border/80 bg-card px-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-muted/60 aria-expanded:bg-muted/60 @lg:flex-none @lg:px-4",
        )}
      >
        <History className="size-5 text-foreground/75" aria-hidden />
        Post Schedule
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] max-w-[calc(100vw-24px)] rounded-[12px] p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-[13px] font-semibold">Up next</p>
        <ul>
          {sample.UPCOMING.map((u) => (
            <li key={u.id} className="flex gap-3 rounded-[8px] px-2.5 py-2">
              <Glyph name={u.channel} className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-[13.5px]">{u.text}</span>
                <span className="text-[12px] text-muted-foreground">
                  {when(u.inMinutes)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function AddSocial() {
  const [linked, setLinked] = useState<string[]>([]);
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          headerButton,
          "flex-1 justify-center bg-foreground px-5 text-background shadow-[0_1px_2px_rgb(0_0_0/0.16)] hover:bg-foreground/88 @lg:w-[183px] @lg:flex-none",
        )}
      >
        <Plus className="size-5" aria-hidden />
        Add Social
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] max-w-[calc(100vw-24px)] rounded-[12px] p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-[13px] font-semibold">
          Connect a channel
        </p>
        <ul>
          {sample.CONNECTABLE.map((c) => {
            const on = linked.includes(c.id);
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-[8px] px-2.5 py-2"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-muted">
                  <Glyph name={c.id} className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium">
                    {c.name}
                  </span>
                  <span className="block truncate text-[12px] text-muted-foreground">
                    {on ? "Connected · first numbers within a day" : c.hint}
                  </span>
                </span>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setLinked(
                      on ? linked.filter((x) => x !== c.id) : [...linked, c.id],
                    )
                  }
                  className={cn(
                    "flex h-8 cursor-pointer items-center gap-1 rounded-[8px] px-2.5 text-[12.5px] font-medium",
                    on
                      ? "text-muted-foreground hover:text-foreground"
                      : "bg-foreground text-background hover:bg-foreground/88",
                    press,
                    focusRing,
                  )}
                >
                  {on ? <Check className="size-3.5" aria-hidden /> : null}
                  {on ? "Connected" : "Connect"}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------------- Overview ---------------------------------- */

function OverviewCard({
  channels,
  k,
}: {
  channels: Record<Channel, ChannelStats>;
  k: number;
}) {
  const [metric, setMetric] = useState<Metric>("followers");
  const [focus, setFocus] = useState<Channel | null>(null);
  const m = sample.METRICS.find((x) => x.id === metric)!;
  const values = sample.today[metric];
  const total = Object.values(values).reduce((a, b) => a + b, 0);
  const lead = sample.CHANNELS.reduce((a, b) =>
    values[b.id] > values[a.id] ? b : a,
  );
  return (
    <Panel aria-label="Overview" className="px-4 pt-4 pb-4">
      <CardHeader title="Overview">
        <Pick
          label="Overview metric"
          value={metric}
          onChange={setMetric}
          options={sample.METRICS.map((x) => ({ id: x.id, label: x.label }))}
        />
      </CardHeader>
      <Gauge
        parts={sample.CHANNELS.map((c) => ({ id: c.id, value: values[c.id] }))}
        goal={m.goal}
        active={focus}
        className="mx-auto mt-[22.5px]"
      >
        <span className="text-[35px] leading-10 font-semibold tracking-[-0.03em] tabular-nums">
          {num(focus ? values[focus] : total)}
        </span>
        <span className="mt-[5px] text-[12.5px] leading-4 text-foreground/75">
          {focus
            ? `from ${sample.CHANNELS.find((c) => c.id === focus)!.name}`
            : `of ${compact(m.goal)} ${m.noun}`}
        </span>
        <span className="sr-only">, most from {lead.name}</span>
      </Gauge>
      <div className="mt-[15.5px] rounded-[12px] bg-muted/80 px-[11px] pt-[9px] pb-[11px] dark:bg-muted/40">
        <h3 className="text-[13.5px] leading-5 text-foreground/80">
          Your Social Platforms
        </h3>
        <div className="-mx-[11px] mt-[20px] grid snap-x auto-cols-[minmax(114px,1fr)] grid-flow-col gap-[5px] overflow-x-auto scroll-px-[11px] px-[11px] [scrollbar-width:none]">
          {sample.CHANNELS.map((c) => {
            const s = channels[c.id];
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={focus === c.id}
                aria-label={`${c.name}: ${num(s.followers)} followers, ${values[c.id]} ${m.noun} today`}
                onPointerEnter={() => setFocus(c.id)}
                onPointerLeave={() => setFocus(null)}
                onFocus={() => setFocus(c.id)}
                onBlur={() => setFocus(null)}
                onClick={() => setFocus(focus === c.id ? null : c.id)}
                className={cn(
                  "flex h-[96px] min-w-0 cursor-pointer snap-start flex-col rounded-[10px] bg-card px-[8px] pt-[8px] pb-[7px] text-start ring-1 ring-transparent transition-shadow",
                  focus === c.id &&
                    "ring-foreground/15 shadow-[0_2px_8px_-4px_rgb(0_0_0/0.18)]",
                  focusRing,
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="grid size-[18px] shrink-0 place-items-center rounded-[5px]"
                    style={{
                      background: `color-mix(in oklch, ${SERIES[c.id]} 16%, var(--card))`,
                      color: SERIES[c.id],
                    }}
                  >
                    <Glyph name={c.id} className="size-3" />
                  </span>
                  <span className="text-[13px] leading-4 font-semibold tabular-nums">
                    {compact(s.followers)}
                  </span>
                </span>
                <span className="mt-[4px] flex items-center justify-between gap-1 text-[11px] leading-4 text-muted-foreground">
                  Followers
                  <Delta value={s.change} short className="text-[10.5px]" />
                </span>
                <span className="mt-auto flex justify-between gap-2 border-t border-border/70 pt-[7px]">
                  <span className="min-w-0">
                    <span className="block text-[11.5px] leading-4 font-medium tabular-nums">
                      {num(Math.round(s.comments * k))}
                    </span>
                    <span className="block text-[10px] leading-[14px] tracking-[-0.01em] text-muted-foreground">
                      Comments
                    </span>
                  </span>
                  <span className="min-w-0 text-end">
                    <span className="block text-[11.5px] leading-4 font-medium tabular-nums">
                      {num(Math.round(s.likes * k))}
                    </span>
                    <span className="block text-[10px] leading-[14px] text-muted-foreground">
                      Likes
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- Growth ---------------------------------- */

function GrowthCard({
  channels,
  k,
  now,
}: {
  channels: Record<Channel, ChannelStats>;
  k: number;
  now: Date;
}) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [focus, setFocus] = useState<Channel | null>(null);
  const data = useMemo(
    () => sample.engagementSeries(granularity, now),
    [granularity, +now],
  );
  const total = sample.CHANNELS.reduce(
    (n, c) => n + channels[c.id].followers,
    0,
  );
  const format = (d: Date) =>
    granularity === "monthly"
      ? fmt(d, { month: "short" })
      : fmt(d, { month: "short", day: "numeric" });
  return (
    <Panel
      aria-label="Audience growth and engagement"
      className="flex flex-col px-[18px] pt-4 pb-[14px] @4xl:h-[508px]"
    >
      <CardHeader title="Audience Growth & Engagement">
        <Pick
          label="Granularity"
          value={granularity}
          onChange={setGranularity}
          icon={
            <Calendar className="size-[17px] text-foreground/70" aria-hidden />
          }
          options={[
            { id: "monthly", label: "Monthly" },
            { id: "weekly", label: "Weekly" },
          ]}
          className="font-normal @lg:w-[138px] @lg:justify-between"
        />
      </CardHeader>
      <div className="mt-[17px] flex min-h-0 flex-1 flex-col gap-6 @3xl:flex-row @3xl:gap-0">
        <div className="flex shrink-0 flex-col @3xl:w-[250px] @3xl:border-e @3xl:border-border/80 @3xl:pe-[25px]">
          <div className="border-b border-border/80 pt-[5px] pb-[23px]">
            <p className="text-[15px] leading-5 text-muted-foreground">
              Total Followers
            </p>
            <p className="mt-[10px] flex items-center gap-5">
              <span className="text-[36px] leading-[44px] font-semibold tracking-[-0.03em] tabular-nums">
                {num(total)}
              </span>
              <Delta value={sample.followersChange} className="mt-1.5" />
            </p>
          </div>
          <ul className="flex flex-col gap-[21px] pt-[23px]">
            {sample.CHANNELS.map((c) => {
              const s = channels[c.id];
              const share = (s.followers / total) * 100;
              return (
                <li
                  key={c.id}
                  onPointerEnter={() => setFocus(c.id)}
                  onPointerLeave={() => setFocus(null)}
                  className="cursor-default"
                >
                  <p className="flex items-center gap-2 text-[17px] leading-6 font-medium">
                    <span
                      aria-hidden
                      className="size-[9px] rounded-[2px]"
                      style={{ background: SERIES[c.id] }}
                    />
                    {c.name}
                    <span className="ms-auto text-[13px] font-normal text-muted-foreground tabular-nums">
                      {Math.round(share)}%
                    </span>
                  </p>
                  <span
                    aria-hidden
                    className="mt-[7px] block h-5 overflow-hidden rounded-[5px]"
                    style={{
                      backgroundImage: HATCH,
                      backgroundColor:
                        "color-mix(in oklch, var(--foreground) 3%, var(--card))",
                    }}
                  >
                    <span
                      className="block h-full rounded-[5px] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                      style={{ width: `${share}%`, background: SERIES[c.id] }}
                    />
                  </span>
                  <p className="mt-[11px] flex gap-3.5 text-[11.5px] leading-4 text-muted-foreground">
                    {(
                      [
                        ["Likes", s.likes],
                        ["Comments", s.comments],
                        ["Shares", s.shares],
                      ] as const
                    ).map(([label, v]) => (
                      <span key={label} className="whitespace-nowrap">
                        {label}{" "}
                        <span className="font-semibold text-foreground tabular-nums">
                          {compact(Math.round(v * k))}
                        </span>
                      </span>
                    ))}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
        <LineChart
          key={granularity}
          data={data}
          format={format}
          label={`Engagement per channel, ${granularity}`}
          highlight={focus}
          className="min-h-[300px] flex-1 pt-[31px] pb-[11px] @3xl:ps-[5px]"
        />
      </div>
    </Panel>
  );
}

/* ---------------------------------- Activity ---------------------------------- */

function ActiveCard({ k }: { k: number }) {
  const [metric, setMetric] = useState<ActivityMetric>("engagement");
  const [on, setOn] = useState<Channel[]>(["facebook", "x", "instagram"]);
  const raw = useMemo(() => sample.activity(metric), [metric]);
  const values = sample.SLOTS.map((_, s) =>
    sample.DAYS.map((_, d) =>
      Math.round(on.reduce((n, c) => n + raw[c][s][d], 0) * k),
    ),
  );
  let peak: [number, number] = [0, 0];
  values.forEach((row, s) =>
    row.forEach((v, d) => v > values[peak[0]][peak[1]] && (peak = [s, d])),
  );
  const slot = (s: number) =>
    `${hourLabel(sample.SLOTS[s])} – ${hourLabel((sample.SLOTS[s] + 3) % 24)}`;
  const noun = metric === "reach" ? "people reached" : "engagements";
  const toggle = (c: Channel) =>
    setOn(
      on.includes(c)
        ? on.length > 1
          ? on.filter((x) => x !== c)
          : on
        : [...on, c],
    );
  return (
    <Panel
      aria-label="Most active time"
      className="flex flex-1 flex-col px-4 pt-4 pb-[15px]"
    >
      <CardHeader
        title="Most Active Time"
        sub={on.length ? `Peak: ${sample.DAYS[peak[1]]}, ${slot(peak[0])}` : ""}
      >
        <Pick
          label="Activity metric"
          value={metric}
          onChange={setMetric}
          options={[
            { id: "engagement", label: "Engagement" },
            { id: "reach", label: "Reach" },
          ]}
        />
      </CardHeader>
      <div
        role="group"
        aria-label="Channels"
        className="mt-[19px] flex justify-center gap-2"
      >
        {sample.CHANNELS.map((c) => {
          const active = on.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(c.id)}
              className={cn(
                "flex h-[22px] cursor-pointer items-center gap-1.5 rounded-[6px] border px-2 text-[12px] leading-4",
                active
                  ? "border-border/90 bg-card text-foreground/80"
                  : "border-dashed border-border text-muted-foreground/70",
                press,
                focusRing,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-[2px] transition-opacity",
                  active ? "" : "opacity-30",
                )}
                style={{ background: SERIES[c.id] }}
              />
              {c.name}
            </button>
          );
        })}
      </div>
      <Heatmap
        values={values}
        rows={sample.SLOTS.map((h) => hourLabel(h))}
        cols={sample.DAYS}
        describe={(s, d, v) =>
          `${sample.DAYS[d]}, ${slot(s)} · ${num(v)} ${noun}`
        }
        className="mt-[14px] min-h-[260px] flex-1"
      />
    </Panel>
  );
}

/* ---------------------------------- Ages ---------------------------------- */

function AgeCard({ period }: { period: Period }) {
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [active, setActive] = useState<number | null>(null);
  const bands = sample.ages[channel];
  const colors = [OTHERS, SERIES.facebook, SERIES.x, SERIES.instagram];
  // The legend reads youngest first, the pie keeps its clockwise order.
  const legend = [2, 3, 1, 0];
  return (
    <Panel
      aria-label="Audience by age"
      className="flex flex-col px-4 pt-4 pb-4"
    >
      <CardHeader
        title="Audience by Age"
        sub={sample.PERIODS.find((p) => p.id === period)!.label}
      >
        <Pick
          label="Channel"
          value={channel}
          onChange={(v) => (setChannel(v), setActive(null))}
          options={[
            { id: "all" as const, label: "All" },
            ...sample.CHANNELS.map((c) => ({ id: c.id, label: c.name })),
          ]}
        />
      </CardHeader>
      <Pie
        slices={bands.map((b, i) => ({
          label: b.label,
          share: b.share,
          color: colors[i],
        }))}
        size={227}
        active={active}
        onActive={setActive}
        className="mx-auto mt-[16px]"
      />
      <ul className="mt-[14px] grid grid-cols-4 gap-1">
        {legend.map((i) => (
          <li key={bands[i].label}>
            <button
              type="button"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${bands[i].label}: ${bands[i].share}%`}
              className={cn(
                "flex w-full cursor-default flex-col items-center gap-[5px] rounded-[6px] py-0.5 transition-opacity",
                active !== null && active !== i && "opacity-45",
                focusRing,
              )}
            >
              <span
                aria-hidden
                className="size-3 rounded-full"
                style={{ background: colors[i] }}
              />
              <span className="text-[12.5px] leading-4 whitespace-nowrap text-foreground/75">
                {i === 0 ? "Others" : `${bands[i].label}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------------- Countries ---------------------------------- */

function CountryCard() {
  const [metric, setMetric] = useState<CountryMetric>("followers");
  const [active, setActive] = useState<string | null>(null);
  const list = [...sample.countries].sort(
    (a, b) => b.share[metric] - a.share[metric],
  );
  return (
    <Panel
      aria-label="Growth by country"
      className="flex flex-col ps-6 pe-[17px] pt-4 pb-[14px]"
    >
      <CardHeader title="Growth by Country">
        <Pick
          label="Country metric"
          value={metric}
          onChange={setMetric}
          options={[
            { id: "followers", label: "Followers" },
            { id: "reach", label: "Reach" },
          ]}
        />
      </CardHeader>
      <ul className="mt-[22px] flex h-6 flex-wrap gap-x-[18px] overflow-hidden">
        {list.slice(0, 4).map((c) => (
          <li key={c.code}>
            <button
              type="button"
              onPointerEnter={() => setActive(c.code)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(c.code)}
              onBlur={() => setActive(null)}
              aria-label={`${c.name}: ${c.share[metric]}%`}
              className={cn(
                "flex h-6 cursor-default items-center gap-2 rounded-[4px] text-[13.5px] leading-5 font-medium whitespace-nowrap transition-opacity",
                active && active !== c.code && "opacity-45",
                focusRing,
              )}
            >
              <Flag code={c.code} className="h-[20px] w-[30px]" />
              {c.code === "GB" ? "UK" : c.code} {c.share[metric]}%
            </button>
          </li>
        ))}
      </ul>
      <DotMap
        countries={list}
        share={(c) => c.share[metric]}
        active={active}
        onActive={setActive}
        className="mt-[21px] w-full"
      />
    </Panel>
  );
}
