"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileArrowDown,
  MoreVertical,
  Search,
} from "@keyline-icons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/panelo/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/panelo/ui/popover";
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

import { AreaChart } from "./chart";
import * as sample from "./data";
import type { Audience, Kpi, Platform, Post, Range } from "./data";
import {
  Bar,
  BrandColors,
  BrandIcon,
  Change,
  compact,
  count,
  DATA,
  Delta,
  DOWN,
  fieldButton,
  focusRing,
  money,
  Panel,
  PlatformSelect,
  SectionTitle,
  selectTrigger,
  UP,
} from "./parts";

/* -------------------------------------------------------------------------- */
/*  Social overview: a KPI card per channel, revenue over time, who the        */
/*  audience is, the week's posting schedule and how the chosen post did.     */
/*  - The range (7, 30, 90 days) drives the cards, the chart and the export.  */
/*  - A card's arrow points the chart and the audience panel at its channel.  */
/*  - Pick a day, then a post, to read its insights; scheduled posts can go   */
/*    out now. Search finds a post; Download saves the numbers as CSV.        */
/*  Neutral by design: one data colour (blue), green and red only on          */
/*  change, monochrome brand marks unless `brandColors` is on.                */
/*  Every list is a prop; it adapts to its own width (container queries).     */
/* -------------------------------------------------------------------------- */

export type SocialOverviewProps = {
  user?: { name: string; avatar?: string };
  subtitle?: string;
  kpis?: Kpi[];
  audiences?: Record<Platform, Audience>;
  posts?: Post[];
  defaultRange?: Range;
  /** Show the YouTube, Instagram and Facebook marks in their brand colours. */
  brandColors?: boolean;
  /** Pin "now" (tests, screenshots). Otherwise the real clock, read after mount. */
  now?: Date;
  className?: string;
};

// The server renders this moment; the browser swaps in the real clock after mount, so hydration matches.
const SERVER_NOW = new Date(2026, 10, 23, 12, 0);
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
const sameDay = (a: Date, b: Date) => +startOfDay(a) === +startOfDay(b);
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  d.toLocaleString("en-US", o);
const clock = (d: Date) =>
  fmt(d, { hour: "2-digit", minute: "2-digit", hour12: true });
const platformOf = (id: Platform) => sample.PLATFORMS.find((p) => p.id === id)!;

/** Pressable controls give a little under the finger. */
const press =
  "transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100";

type Scheduled = Post & { at: Date };

export function SocialOverview({
  user = { name: "Noa Lindqvist", avatar: "/avatars/livia-saris.webp" },
  subtitle = "Here is how your channels are doing this week",
  kpis = sample.kpis,
  audiences = sample.audiences,
  posts: postsProp = sample.posts,
  defaultRange = 7,
  brandColors = false,
  now: nowProp,
  className,
}: SocialOverviewProps) {
  const [now, setNow] = useState(nowProp ?? SERVER_NOW);
  const [range, setRange] = useState<Range>(defaultRange);
  const [revenueOn, setRevenueOn] = useState<Platform>("youtube");
  const [audienceOn, setAudienceOn] = useState<Platform>("instagram");
  const [posts, setPosts] = useState<Post[]>(postsProp);
  const [day, setDay] = useState(startOfDay(now));
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (nowProp) return;
    const real = new Date();
    setNow(real);
    setDay(startOfDay(real));
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, [nowProp]);

  // Posts live in the current week: Monday plus their day offset, at their time.
  const monday = mondayOf(now);
  const scheduled: Scheduled[] = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        at: new Date(+addDays(monday, p.day) + p.minutes * 60_000),
      })),
    [posts, +monday],
  );
  const ofDay = scheduled
    .filter((p) => sameDay(p.at, day))
    .sort((a, b) => +a.at - +b.at);
  const selected =
    ofDay.find((p) => p.id === picked) ??
    ofDay.find((p) => +p.at <= +now) ??
    ofDay[0] ??
    null;

  const focusChannel = (p: Platform) => {
    setRevenueOn(p);
    setAudienceOn(p);
  };
  const openPost = (p: Scheduled) => {
    setDay(startOfDay(p.at));
    setPicked(p.id);
  };
  // Going out now moves the post to today; the view follows it so it stays selected.
  const publishNow = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              day: Math.round((+startOfDay(now) - +monday) / 86_400_000),
              minutes: now.getHours() * 60 + now.getMinutes(),
            }
          : p,
      ),
    );
    setDay(startOfDay(now));
    setPicked(id);
  };
  const remove = (id: string) => setPosts(posts.filter((p) => p.id !== id));

  const download = () => {
    const rows = [
      [
        "Channel",
        "Audience",
        `Change (last ${range} days)`,
        `Revenue (last ${range} days)`,
      ],
    ];
    for (const k of kpis) {
      const revenue = sample
        .revenueSeries(k.platform, range, now)
        .reduce((n, d) => n + d.value, 0);
      rows.push([
        platformOf(k.platform).name,
        String(k.total),
        String(k.change[range]),
        String(revenue),
      ]);
    }
    const url = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }),
    );
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `social-overview-last-${range}-days.csv`,
    });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <BrandColors.Provider value={brandColors}>
      <div
        className={cn(
          "@container min-h-full bg-card px-5 pt-4 pb-6 font-sans text-foreground",
          className,
        )}
      >
        {/* ------------------------------ Header ------------------------------ */}
        <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-[13rem] flex-1">
            <h1 className="truncate text-[19.75px] leading-6 font-semibold tracking-[-0.01em]">
              {user.name}
            </h1>
            <p className="mt-[3px] truncate text-[15px] leading-5 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <div className="flex w-full items-center @3xl:w-auto">
            <SearchButton posts={scheduled} onPick={openPost} />
            <Notifications />
            <Select
              value={String(range)}
              onValueChange={(v) => v && setRange(Number(v) as Range)}
            >
              <SelectTrigger
                aria-label="Date range"
                className={cn(
                  selectTrigger,
                  "ms-2 min-w-0 flex-1 justify-between @lg:ms-[23px] @lg:w-[149px] @lg:flex-none",
                )}
              >
                {sample.RANGES.find((r) => r.id === range)!.label}
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </SelectTrigger>
              <SelectContent>
                {sample.RANGES.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={download}
              className={cn(
                "ms-2 flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] bg-foreground px-4 text-[14px] leading-5 font-medium text-background shadow-[0_1px_2px_rgb(0_0_0/0.16)] hover:bg-foreground/88 @lg:ms-3.5",
                press,
                focusRing,
              )}
            >
              <FileArrowDown className="size-5" aria-hidden />
              <span className="sr-only @md:not-sr-only">Download</span>
            </button>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="ms-auto hidden size-11 shrink-0 rounded-full bg-muted object-cover ring-1 ring-foreground/10 @md:block @3xl:ms-[25px]"
              />
            ) : null}
          </div>
        </header>

        {/* ------------------------------ KPIs ------------------------------ */}
        <div className="mt-[26px] grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard
              key={k.platform}
              kpi={k}
              range={range}
              onOpen={() => focusChannel(k.platform)}
            />
          ))}
        </div>

        {/* ------------------------------ Revenue + audience ------------------------------ */}
        <div className="mt-[28.5px] grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,1fr)_386px]">
          <RevenueCard
            platform={revenueOn}
            onPlatform={setRevenueOn}
            range={range}
            now={now}
          />
          <AudienceCard
            platform={audienceOn}
            onPlatform={setAudienceOn}
            audience={audiences[audienceOn]}
            total={kpis.find((k) => k.platform === audienceOn)?.total ?? 0}
          />
        </div>

        {/* ------------------------------ Schedule + insights ------------------------------ */}
        <div className="mt-[29px] grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,1fr)_404px]">
          <ScheduleCard
            now={now}
            day={day}
            onDay={(d) => (setDay(d), setPicked(null))}
            posts={scheduled}
            ofDay={ofDay}
            selected={selected?.id ?? null}
            onSelect={setPicked}
            onPublish={publishNow}
            onRemove={remove}
          />
          <InsightsCard post={selected} now={now} onPublish={publishNow} />
        </div>
      </div>
    </BrandColors.Provider>
  );
}

/* ---------------------------------- Header ---------------------------------- */

const iconButton = cn(
  "relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground aria-expanded:bg-foreground/[0.05] aria-expanded:text-foreground",
  press,
  focusRing,
);

function SearchButton({
  posts,
  onPick,
}: {
  posts: Scheduled[];
  onPick: (p: Scheduled) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query
    ? posts
        .filter((p) => `${p.text} ${p.platform}`.toLowerCase().includes(query))
        .slice(0, 6)
    : [];
  const pick = (p: Scheduled) => {
    onPick(p);
    setOpen(false);
    setQ("");
  };
  return (
    <Popover open={open} onOpenChange={(o) => (setOpen(o), o || setQ(""))}>
      <PopoverTrigger aria-label="Search posts" className={iconButton}>
        <Search className="size-[23px]" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[12px] p-0"
      >
        <label className="flex h-11 items-center gap-2.5 border-b border-border/80 px-3.5">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && results[0] && pick(results[0])
            }
            placeholder="Search this week's posts"
            aria-label="Search posts"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </label>
        {query ? (
          results.length ? (
            <ul className="max-h-72 overflow-y-auto p-1.5">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-2.5 rounded-[8px] px-2 py-2 text-start hover:bg-foreground/[0.05]",
                      focusRing,
                    )}
                  >
                    <BrandIcon
                      platform={p.platform}
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[13.5px]">
                        {p.text}
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        {fmt(p.at, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        , {clock(p.at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
              No posts match “{q.trim()}”.
            </p>
          )
        ) : (
          <p className="px-4 py-4 text-[12.5px] text-muted-foreground">
            Type a word from a post or a channel. Enter opens the first match.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Notifications() {
  const [read, setRead] = useState(false);
  return (
    <Popover onOpenChange={(o) => o && setRead(true)}>
      <PopoverTrigger
        aria-label={
          read
            ? "Notifications"
            : `Notifications, ${sample.NOTIFICATIONS.length} new`
        }
        className={cn(iconButton, "ms-1 @lg:ms-[18px]")}
      >
        <Bell className="size-[23px]" aria-hidden />
        {read ? null : (
          <span
            aria-hidden
            className="absolute end-[11px] top-[9px] size-[7px] rounded-full ring-2 ring-card"
            style={{ background: DATA }}
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] max-w-[calc(100vw-24px)] rounded-[12px] p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-[13px] font-semibold">
          Notifications
        </p>
        <ul>
          {sample.NOTIFICATIONS.map((n) => (
            <li
              key={n.id}
              className="flex gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] leading-5"
            >
              <span
                aria-hidden
                className="mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground/30"
              />
              <span className="flex-1 text-foreground/85">{n.text}</span>
              <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
                {n.ago}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ----------------------------------- KPIs ----------------------------------- */

function KpiCard({
  kpi: k,
  range,
  onOpen,
}: {
  kpi: Kpi;
  range: Range;
  onOpen: () => void;
}) {
  const p = platformOf(k.platform);
  const change = k.change[range];
  const before = k.total - change;
  return (
    <article className="group flex min-w-0 flex-col rounded-[13px] border border-border/70 bg-muted/70 p-2.5 pb-0 transition-colors hover:border-foreground/15 dark:bg-muted/40">
      <div className="flex h-[75px] items-center gap-3 rounded-[10px] border border-border/60 bg-card ps-[8px] pe-[11px] shadow-[0_1px_2px_rgb(0_0_0/0.03)]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-5 text-muted-foreground">
            {p.audience}
          </p>
          <p className="mt-[5px] flex items-center gap-[11px]">
            <span className="text-[24.5px] leading-[30px] font-semibold tracking-[-0.02em] tabular-nums">
              {compact(k.total)}
            </span>
            <Delta value={before ? (change / before) * 100 : 0} />
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-border/70 bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
          <BrandIcon platform={k.platform} className="size-[19px]" />
          <span className="sr-only">{p.name}</span>
        </span>
      </div>
      <div className="flex h-[49px] items-center gap-2 ps-[7px] pe-0.5 pt-[11px]">
        <p className="min-w-0 flex-1 truncate text-[15px] leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {count(change, true)}
          </span>{" "}
          vs last {String(range).padStart(2, "0")} days
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`Show ${p.name} in the charts`}
              onClick={onOpen}
              className={cn(
                "grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground",
                press,
                focusRing,
              )}
            >
              <ArrowRight
                className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Show {p.name} in the charts
          </TooltipContent>
        </Tooltip>
      </div>
    </article>
  );
}

/* ---------------------------------- Revenue ---------------------------------- */

function RevenueCard({
  platform,
  onPlatform,
  range,
  now,
}: {
  platform: Platform;
  onPlatform: (p: Platform) => void;
  range: Range;
  now: Date;
}) {
  const data = useMemo(
    () => sample.revenueSeries(platform, range, now),
    [platform, range, +startOfDay(now)],
  );
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <Panel
      aria-label="Revenue"
      className="flex flex-col px-4 pt-[13px] pb-[17px] @lg:px-6"
    >
      <div className="flex flex-wrap items-start gap-x-4">
        <div className="min-w-[13rem] flex-1">
          <p className="text-[14.5px] leading-5 text-muted-foreground">
            Revenue
          </p>
          <p className="mt-[5px] flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[24.5px] leading-[30px] font-semibold tracking-[-0.02em] tabular-nums">
              {money(total)}
            </span>
            <Delta value={sample.revenueChange[platform][range]} />
            <span className="text-[14.5px] leading-5 whitespace-nowrap text-muted-foreground">
              vs last {String(range).padStart(2, "0")} days
            </span>
          </p>
        </div>
        <div className="mt-[10px]">
          <PlatformSelect
            value={platform}
            onChange={onPlatform}
            label="Revenue channel"
          />
        </div>
      </div>
      <AreaChart
        key={`${platform}-${range}`}
        data={data}
        label={`${platformOf(platform).name} revenue, last ${range} days`}
        className="mt-[26px]"
      />
    </Panel>
  );
}

/* ---------------------------------- Audience ---------------------------------- */

const TABS = [
  { id: "location", label: "Top Location" },
  { id: "age", label: "Age Range" },
  { id: "gender", label: "Gender" },
] as const;

/** The selected chip inverts; the rest sit quietly on a grey ground. */
const chip = (on: boolean) =>
  on
    ? "bg-foreground text-background"
    : "bg-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground";

function AudienceCard({
  platform,
  onPlatform,
  audience,
  total,
}: {
  platform: Platform;
  onPlatform: (p: Platform) => void;
  audience: Audience;
  total: number;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("location");
  const rows = [...audience[tab]].sort((a, b) => b.value - a.value);
  const max = rows[0]?.value || 1;
  return (
    <Panel
      aria-label="Audience"
      className="flex flex-col px-4 pt-[13px] pb-[24px] @lg:px-6"
    >
      <div className="flex flex-wrap items-start gap-x-3">
        <div className="min-w-[8rem] flex-1">
          <p className="text-[14.5px] leading-5 text-muted-foreground">
            {platformOf(platform).audience}
          </p>
          <p className="mt-[5px] text-[24.5px] leading-[30px] font-semibold tracking-[-0.02em] tabular-nums">
            {compact(total)}
          </p>
        </div>
        <div className="mt-[10px]">
          <PlatformSelect
            value={platform}
            onChange={onPlatform}
            label="Audience channel"
          />
        </div>
      </div>
      <div
        role="tablist"
        aria-label="Breakdown"
        className="mt-[21px] flex gap-2 @lg:gap-4"
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % TABS.length
                  : e.key === "ArrowLeft"
                    ? (i + TABS.length - 1) % TABS.length
                    : -1;
              if (next < 0) return;
              setTab(TABS[next].id);
              (
                e.currentTarget.parentElement?.children[next] as
                  HTMLElement | undefined
              )?.focus();
            }}
            className={cn(
              "h-[38px] flex-1 cursor-pointer rounded-[8px] px-2.5 text-[14.5px] leading-5 whitespace-nowrap @lg:flex-none @lg:px-[15px]",
              chip(tab === t.id),
              press,
              focusRing,
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul
        role="tabpanel"
        aria-label={TABS.find((t) => t.id === tab)!.label}
        className="mt-[19px] flex flex-col gap-[10.5px]"
      >
        {/* Rows are keyed by rank, so switching tabs morphs the bars instead of swapping them. */}
        {rows.map((r, i) => (
          <li key={i}>
            <div className="flex items-baseline justify-between gap-3 text-[14.5px] leading-5">
              <span className="truncate font-medium">{r.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {r.value.toLocaleString("en-US")}
                <span className="sr-only">
                  , {Math.round((r.value / total) * 100)}% of the audience
                </span>
              </span>
            </div>
            <Bar value={(r.value / max) * 100} className="mt-[10px]" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------------- Schedule ---------------------------------- */

function ScheduleCard({
  now,
  day,
  onDay,
  posts,
  ofDay,
  selected,
  onSelect,
  onPublish,
  onRemove,
}: {
  now: Date;
  day: Date;
  onDay: (d: Date) => void;
  posts: Scheduled[];
  ofDay: Scheduled[];
  selected: string | null;
  onSelect: (id: string) => void;
  onPublish: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const week = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(day), i));
  const groups = ofDay.reduce<{ at: Date; items: Scheduled[] }[]>((acc, p) => {
    const last = acc[acc.length - 1];
    if (last && +last.at === +p.at) last.items.push(p);
    else acc.push({ at: p.at, items: [p] });
    return acc;
  }, []);
  // A radio group: arrows walk the days (across weeks too) and focus follows the choice.
  const step = (e: KeyboardEvent) => {
    const by = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
      e.key
    ];
    if (!by) return;
    e.preventDefault();
    onDay(addDays(day, by));
    requestAnimationFrame(() =>
      strip.current
        ?.querySelector<HTMLElement>('[aria-checked="true"]')
        ?.focus(),
    );
  };
  return (
    <Panel
      aria-label="Post schedule"
      className="flex flex-col px-4 pt-[15px] pb-[19px] @lg:px-6"
    >
      <div className="flex items-center justify-between gap-3">
        <SectionTitle className="truncate">Post Schedule</SectionTitle>
        <MonthPicker day={day} now={now} posts={posts} onPick={onDay} />
      </div>
      <div className="mt-[30px] flex items-center gap-2 @lg:gap-[18px]">
        <NavButton
          label="Previous week"
          icon={ChevronLeft}
          onClick={() => onDay(addDays(day, -7))}
        />
        <div
          ref={strip}
          role="radiogroup"
          aria-label="Day"
          onKeyDown={step}
          className="grid min-w-0 flex-1 grid-cols-7 gap-1 @lg:gap-4"
        >
          {week.map((d) => {
            const on = sameDay(d, day);
            const n = posts.filter((p) => sameDay(p.at, d)).length;
            return (
              <button
                key={+d}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                aria-label={`${fmt(d, { weekday: "long", month: "long", day: "numeric" })}, ${n} post${n === 1 ? "" : "s"}`}
                onClick={() => onDay(d)}
                className={cn(
                  "flex h-[52px] min-w-0 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[9px] border @lg:h-[57px]",
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/80 bg-card hover:border-foreground/20 hover:bg-muted/50",
                  press,
                  focusRing,
                )}
              >
                <span
                  className={cn(
                    "text-[12px] leading-4 @lg:text-[14.5px]",
                    on ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {fmt(d, { weekday: "short" })}
                </span>
                <span className="text-[17px] leading-6 font-medium tabular-nums @lg:text-[20.5px]">
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <NavButton
          label="Next week"
          icon={ChevronRight}
          onClick={() => onDay(addDays(day, 7))}
        />
      </div>
      <div className="mt-[24px] flex flex-col gap-[23px]">
        {groups.length ? (
          groups.map((g) => (
            <section key={+g.at} aria-label={clock(g.at)}>
              <div className="flex items-center gap-4">
                <h3 className="text-[14.5px] leading-5 text-muted-foreground tabular-nums">
                  {clock(g.at)}
                </h3>
                <span aria-hidden className="h-px flex-1 bg-border/80" />
              </div>
              <div className="mt-[17px] grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 @4xl:grid-cols-[repeat(3,214px)]">
                {g.items.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    now={now}
                    selected={selected === p.id}
                    onSelect={() => onSelect(p.id)}
                    onPublish={() => onPublish(p.id)}
                    onRemove={() => onRemove(p.id)}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="flex flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-border px-6 py-14 text-center">
            <Calendar className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-[14px] font-medium">
              Nothing planned for {fmt(day, { weekday: "long" })}
            </p>
            <p className="text-[13px] text-muted-foreground">
              Pick another day, or search for a post.
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function NavButton({
  label,
  icon: I,
  onClick,
}: {
  label: string;
  icon: typeof ChevronLeft;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-card text-foreground/70 shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:border-foreground/25 hover:text-foreground",
        press,
        focusRing,
      )}
    >
      <I className="size-4 rtl:rotate-180" aria-hidden />
    </button>
  );
}

function MonthPicker({
  day,
  now,
  posts,
  onPick,
}: {
  day: Date;
  now: Date;
  posts: Scheduled[];
  onPick: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    new Date(day.getFullYear(), day.getMonth(), 1),
  );
  const cells = Array.from({ length: 42 }, (_, i) =>
    addDays(mondayOf(month), i),
  );
  const turn = (by: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));
  return (
    <Popover
      open={open}
      onOpenChange={(o) => (
        setOpen(o),
        o && setMonth(new Date(day.getFullYear(), day.getMonth(), 1))
      )}
    >
      <PopoverTrigger
        aria-label={`Choose a date, ${fmt(day, { month: "long", year: "numeric" })}`}
        className={cn(
          fieldButton,
          "flex shrink-0 items-center px-[15px] whitespace-nowrap",
        )}
      >
        <Calendar className="size-5 text-foreground/70" aria-hidden />
        {fmt(day, { month: "short", year: "numeric" })}
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[284px] rounded-[12px] p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="ps-1 text-[14px] font-semibold">
            {fmt(month, { month: "long", year: "numeric" })}
          </span>
          <span className="flex gap-1">
            {[
              { by: -1, label: "Previous month", I: ChevronLeft },
              { by: 1, label: "Next month", I: ChevronRight },
            ].map(({ by, label, I }) => (
              <button
                key={by}
                type="button"
                aria-label={label}
                onClick={() => turn(by)}
                className={cn(
                  "grid size-7 cursor-pointer place-items-center rounded-[7px] text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground",
                  focusRing,
                )}
              >
                <I className="size-4 rtl:rotate-180" aria-hidden />
              </button>
            ))}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {cells.slice(0, 7).map((d) => (
            <span
              key={+d}
              className="py-1 text-[11.5px] font-medium text-muted-foreground"
            >
              {fmt(d, { weekday: "narrow" })}
            </span>
          ))}
          {cells.map((d) => {
            const on = sameDay(d, day);
            const has = posts.some((p) => sameDay(p.at, d));
            return (
              <button
                key={+d}
                type="button"
                aria-label={`${fmt(d, { weekday: "long", month: "long", day: "numeric" })}${has ? ", has posts" : ""}`}
                aria-pressed={on}
                onClick={() => (onPick(d), setOpen(false))}
                className={cn(
                  "relative grid h-8 cursor-pointer place-items-center rounded-[7px] text-[13px] tabular-nums",
                  on
                    ? "bg-foreground text-background"
                    : "hover:bg-foreground/[0.06]",
                  !on &&
                    d.getMonth() !== month.getMonth() &&
                    "text-muted-foreground/60",
                  !on &&
                    sameDay(d, now) &&
                    "font-semibold underline decoration-foreground/40 underline-offset-[5px]",
                  focusRing,
                )}
              >
                {d.getDate()}
                {has && !on ? (
                  <span
                    aria-hidden
                    className="absolute bottom-1 size-1 rounded-full bg-foreground/35"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PostCard({
  post: p,
  now,
  selected,
  onSelect,
  onPublish,
  onRemove,
}: {
  post: Scheduled;
  now: Date;
  selected: boolean;
  onSelect: () => void;
  onPublish: () => void;
  onRemove: () => void;
}) {
  const live = +p.at <= +now;
  const name = platformOf(p.platform).name;
  const shown = p.images.length > 3 ? p.images.slice(0, 3) : p.images;
  return (
    <article
      className={cn(
        "relative flex min-h-[206px] min-w-0 flex-col rounded-[12px] border ps-[17px] pe-[15px] pt-[13px] pb-[14px] transition-[background-color,border-color,box-shadow] duration-150",
        selected
          ? "border-foreground/25 bg-muted/70 shadow-[0_1px_2px_rgb(0_0_0/0.05)]"
          : "border-border/80 bg-card hover:border-foreground/20",
      )}
    >
      {/* The whole card selects; only the icon and name let clicks through to it, the menu (rendered in place) stays clickable. */}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${name} post, ${clock(p.at)}: ${p.text}`}
        onClick={onSelect}
        className={cn(
          "absolute inset-0 z-0 cursor-pointer rounded-[12px]",
          focusRing,
        )}
      />
      <div className="relative flex items-center gap-[9px]">
        <BrandIcon
          platform={p.platform}
          className="pointer-events-none size-[19px] shrink-0"
        />
        <span className="pointer-events-none flex-1 truncate text-[14.5px] leading-5 font-semibold">
          {name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More for this ${name} post`}
            className={cn(
              "-me-1.5 grid size-7 cursor-pointer place-items-center rounded-[7px] text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground aria-expanded:bg-foreground/[0.06]",
              focusRing,
            )}
          >
            <MoreVertical className="size-[18px]" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={onSelect}>
              View insights
            </DropdownMenuItem>
            {live ? null : (
              <DropdownMenuItem onSelect={onPublish}>
                Publish now
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onRemove} className="text-destructive">
              Delete post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        className={cn(
          "pointer-events-none relative mt-[9px] text-[14.5px] leading-[21px] text-foreground/75",
          p.images.length ? "line-clamp-2" : "line-clamp-4",
        )}
      >
        {p.text}
        {p.link ? (
          <>
            {" "}
            <span className="font-medium text-foreground underline decoration-foreground/30 underline-offset-[3px] [overflow-wrap:anywhere]">
              {p.link}
            </span>
          </>
        ) : null}
      </p>
      {shown.length ? (
        <div className="pointer-events-none relative mt-[15px] flex gap-2">
          {shown.map((src, i) => {
            const more =
              p.images.length > 3 && i === 2 ? p.images.length - 2 : 0;
            return (
              <span
                key={src + i}
                className="relative h-[43px] w-[55px] shrink-0 overflow-hidden rounded-[7px] bg-muted after:absolute after:inset-0 after:rounded-[7px] after:ring-1 after:ring-black/5 after:ring-inset"
              >
                <img src={src} alt="" className="size-full object-cover" />
                {/* A scrim over the photo: physical black and white are right here, whatever the theme. */}
                {more ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/55 text-[13px] font-medium text-white tabular-nums">
                    +{more}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : null}
      <span className="pointer-events-none relative mt-auto flex h-[25px] w-fit items-center gap-1.5 rounded-[6px] border border-border/80 bg-card px-2 text-[11.5px] leading-none text-foreground/75">
        {live ? (
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{ background: "var(--tone-green-solid)" }}
          />
        ) : (
          <Clock className="size-3 text-muted-foreground" aria-hidden />
        )}
        {live ? "Published" : "Scheduled"}
      </span>
    </article>
  );
}

/* ---------------------------------- Insights ---------------------------------- */

function InsightsCard({
  post,
  now,
  onPublish,
}: {
  post: Scheduled | null;
  now: Date;
  onPublish: (id: string) => void;
}) {
  const live = post ? +post.at <= +now : false;
  const data =
    post && live ? (post.insights ?? sample.insightsFor(post.id)) : null;
  return (
    <Panel
      aria-label="Post insights"
      className="flex flex-col px-4 pt-[14px] pb-[15px] @lg:px-6"
    >
      <div className="flex items-start gap-4 border-b border-border/70 pb-[29px]">
        <div className="min-w-0 flex-1 pt-px">
          <SectionTitle>Post Insights</SectionTitle>
          <p className="mt-[5px] truncate text-[14.5px] leading-5 text-muted-foreground">
            {post
              ? `${live ? "Published" : "Scheduled for"} ${fmt(post.at, { month: "short", day: "numeric", year: "numeric" })} · ${clock(post.at)}`
              : "No post on this day"}
          </p>
        </div>
        {post?.images[0] ? (
          <img
            src={post.images[0]}
            alt=""
            className="h-[57px] w-[83px] shrink-0 rounded-[9px] bg-muted object-cover ring-1 ring-foreground/5"
          />
        ) : post ? (
          <span className="grid h-[57px] w-[83px] shrink-0 place-items-center rounded-[9px] bg-muted text-foreground">
            <BrandIcon platform={post.platform} className="size-6" />
          </span>
        ) : null}
      </div>
      {data ? (
        <>
          <dl>
            {data.metrics.map((m) => (
              <div
                key={m.label}
                className="grid min-h-[95.4px] grid-cols-[minmax(0,1fr)_auto_auto] content-start items-start gap-x-[22px] border-b border-border/70 pt-[13px] pb-3"
              >
                <dt className="text-[14.5px] leading-5 text-muted-foreground">
                  {m.label}
                </dt>
                <span
                  aria-hidden
                  className="text-[14.5px] leading-5 text-muted-foreground"
                >
                  Average
                </span>
                <span
                  aria-hidden
                  className="w-[69px] text-[14.5px] leading-5 text-muted-foreground"
                >
                  This post
                </span>
                <dd className="mt-[5px] text-[24.5px] leading-[30px] font-semibold tracking-[-0.02em] tabular-nums">
                  {count(m.value, m.signed)}
                </dd>
                <dd className="mt-[11px] text-[14.5px] leading-5 text-foreground/80 tabular-nums">
                  <span className="sr-only">Average </span>
                  {m.average}%
                </dd>
                <dd className="mt-[11px] text-[14.5px] leading-5">
                  <span className="sr-only">This post </span>
                  <Change value={m.change} />
                </dd>
              </div>
            ))}
          </dl>
          <ul aria-label="Devices" className="grid flex-1 grid-cols-3">
            {data.devices.map((d, i) => {
              const up = d.change >= 0;
              const I = up ? ArrowUpRight : ArrowDownRight;
              return (
                <li
                  key={d.label}
                  className={cn(
                    "flex min-h-[176px] flex-col pt-[13px]",
                    i ? "border-s border-dashed border-border ps-5" : "",
                    i < 2 ? "pe-5" : "",
                  )}
                >
                  <span className="text-[14.5px] leading-5 text-muted-foreground">
                    {d.label}
                  </span>
                  <span className="mt-[5px] text-[24.5px] leading-[30px] font-semibold tracking-[-0.02em] tabular-nums">
                    {String(d.share).padStart(2, "0")}%
                  </span>
                  <span
                    className="mt-auto flex items-center justify-between text-[14.5px] leading-5 tabular-nums"
                    style={{ color: up ? UP : DOWN }}
                  >
                    {d.change > 0 ? "+" : ""}
                    {d.change}%
                    <I
                      className="size-[18px]"
                      aria-label={up ? "up" : "down"}
                    />
                  </span>
                  <Bar value={d.share} className="mt-[9px]" />
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <p className="text-[14.5px] font-medium">
            {post ? "Not live yet" : "Nothing to measure"}
          </p>
          <p className="max-w-64 text-[13.5px] text-pretty text-muted-foreground">
            {post
              ? "Reach, engagement and devices show up here once the post goes out."
              : "Pick a day with posts to see how one did."}
          </p>
          {post ? (
            <button
              type="button"
              onClick={() => onPublish(post.id)}
              className={cn(
                "mt-2 h-9 cursor-pointer rounded-[9px] bg-foreground px-3.5 text-[13.5px] font-medium text-background hover:bg-foreground/88",
                press,
                focusRing,
              )}
            >
              Publish now
            </button>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
