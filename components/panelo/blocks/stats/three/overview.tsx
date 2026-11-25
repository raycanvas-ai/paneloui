"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpDown,
  ChartLine,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Search,
  Star,
  Wallet,
} from "@keyline-icons/react";
import { Star as StarFill } from "@keyline-icons/react/fill";

import { Checkbox } from "@/components/panelo/ui/checkbox";
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
import { cn } from "@/components/panelo/lib/utils";

import { PortfolioChart, Sparkline } from "./chart";
import * as sample from "./data";
import type {
  Chain,
  CoinId,
  Gainer,
  LeaderPeriod,
  MarketRow,
  Range,
  Trend,
} from "./data";
import {
  ACCENT,
  accent,
  CardTitle,
  Change,
  CoinMark,
  CURRENCIES,
  CurrencyContext,
  focusRing,
  Panel,
  pct,
  press,
  Segmented,
  SortButton,
  TrendChange,
  useMoney,
  type Currency,
  type Sort,
} from "./parts";

/* -------------------------------------------------------------------------- */
/*  Crypto portfolio page.                                                     */
/*  - Header: who and when, and the currency every figure is shown in.        */
/*  - Tickers for the coins you watch, the market's volume leaders, and your  */
/*    portfolio over a range with a readout that follows pointer or keys.     */
/*  - Markets: search, a gainers / losers filter, sortable columns, a trend   */
/*    window and row selection with CSV export.                               */
/*  - Balance with a live clock, refresh and four actions that really move    */
/*    the number; top assets and top gainers, sortable, with a watchlist.     */
/*  Calm by design: one warm accent, neutrals, green and red only for change. */
/* -------------------------------------------------------------------------- */

export type CryptoOverviewProps = {
  title?: string;
  greeting?: string;
  defaultCurrency?: Currency;
  /** Pin "now" (tests, screenshots). Otherwise the real clock, read after mount. */
  now?: Date;
  className?: string;
};

// The server renders this moment; the browser swaps in the real clock after mount, so hydration matches.
const SERVER_NOW = new Date(2026, 10, 27, 16, 12, 45);
const BTC = sample.MARKETS.find((m) => m.coin === "btc")!.price;
const coinName = (c: CoinId) => sample.COINS[c].name;

export function CryptoOverview({
  title = "Portfolio",
  greeting = "Good afternoon, Maya. Markets are up 2.4% today.",
  defaultCurrency = "USD",
  now: nowProp,
  className,
}: CryptoOverviewProps) {
  const [now, setNow] = useState(nowProp ?? SERVER_NOW);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  useEffect(() => {
    if (nowProp) return;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [nowProp]);

  return (
    <CurrencyContext.Provider value={currency}>
      <div
        className={cn(
          "@container min-h-full bg-muted px-5 pt-4 pb-6 font-sans text-foreground dark:bg-background",
          className,
        )}
      >
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-1 text-[14px] leading-5 text-muted-foreground">
              {greeting}
            </p>
          </div>
          <Segmented
            label="Currency"
            value={currency}
            options={CURRENCIES.map((c) => c.id)}
            onChange={setCurrency}
            className="h-9"
            item="px-3 text-[13px]"
          />
        </header>

        <div className="mt-5 grid grid-cols-1 gap-[15px] @6xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-[15px]">
            <div className="grid grid-cols-2 gap-[11px] @3xl:grid-cols-4">
              {sample.TICKERS.map((t) => (
                <Ticker
                  key={t.coin}
                  coin={t.coin}
                  price={t.price}
                  change={t.change}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[350px_minmax(0,1fr)]">
              <Leaders now={now} />
              <PortfolioCard now={now} />
            </div>
            <MarketsCard />
          </div>
          <div className="grid min-w-0 grid-cols-1 content-start gap-[15px] @3xl:grid-cols-2 @6xl:grid-cols-1">
            <BalanceCard now={now} />
            <AssetsCard />
            <GainersCard />
          </div>
        </div>
      </div>
    </CurrencyContext.Provider>
  );
}

/* ---------------------------------- Tickers ---------------------------------- */

function Ticker({
  coin,
  price,
  change,
}: {
  coin: CoinId;
  price: number;
  change: number;
}) {
  const money = useMoney();
  const c = sample.COINS[coin];
  return (
    <Panel
      aria-label={`${c.name}, ${money(price)}, ${pct(change)} this week`}
      className="h-[132px] px-[17px] pt-4"
    >
      <p className="text-[14px] leading-[18px] font-semibold">{c.name}</p>
      <p className="mt-0.5 text-[11px] leading-[14px] text-muted-foreground">
        {c.symbol}/USDT
      </p>
      <p className="mt-[11px] truncate font-mono text-[22px] leading-[30px] font-medium tracking-[-0.03em] tabular-nums">
        {money(price)}
      </p>
      <p className="mt-1.5 flex items-center justify-between gap-2 text-[13px] leading-[18px] text-muted-foreground">
        vs last week
        <Change value={change} digits={1} className="text-[12.5px]" />
      </p>
    </Panel>
  );
}

/* ---------------------------------- Leaders ---------------------------------- */

function Leaders({ now }: { now: Date }) {
  const money = useMoney();
  const [period, setPeriod] = useState<LeaderPeriod>("month");
  const [hover, setHover] = useState<number | null>(null);
  const rows = sample.LEADERS[period];
  const total = rows.reduce((n, r) => n + r.volume, 0);
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - (period === "week" ? 7 : 30),
  );
  const day = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const shade = [100, 52, 26];
  return (
    <Panel
      aria-label="Market leaders"
      className="flex flex-col px-[17px] pt-[18px] pb-[11px]"
    >
      <div className="flex items-center justify-between gap-3">
        <CardTitle className="text-[16px]">Market Leaders</CardTitle>
        <Segmented
          label="Period"
          value={period}
          onChange={setPeriod}
          options={[
            { id: "week", label: "Week" },
            { id: "month", label: "Month" },
          ]}
          className="h-[30px]"
        />
      </div>
      {/* Each segment is a coin's share of the three's volume; the label above is how its volume moved. */}
      <div
        className="mt-[28px] flex gap-1"
        onPointerLeave={() => setHover(null)}
      >
        {rows.map((r, i) => (
          <div
            key={r.coin}
            className="flex min-w-0 flex-col transition-[flex-grow] duration-500 ease-out motion-reduce:transition-none"
            style={{ flexGrow: r.volume / total, flexBasis: 0 }}
            onPointerEnter={() => setHover(i)}
          >
            <span
              className={cn(
                "flex h-[34px] items-start border-s border-dashed border-foreground/15 ps-2 pt-[7px] transition-opacity",
                hover !== null && hover !== i && "opacity-40",
              )}
            >
              <Change value={r.change} digits={1} className="text-[12px]" />
            </span>
            <span
              className={cn(
                "h-6 rounded-[5px] transition-opacity",
                hover !== null && hover !== i && "opacity-40",
              )}
              style={{ background: accent(shade[i]) }}
            />
          </div>
        ))}
      </div>
      <p className="mt-[10px] flex justify-between text-[11.5px] leading-4 text-muted-foreground tabular-nums">
        <span>{day(start)}</span>
        <span>{day(now)}</span>
      </p>
      <ul className="mt-[2px] flex flex-col">
        {rows.map((r, i) => (
          <li
            key={r.coin}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className={cn(
              "border-b border-border/70 py-[11px] transition-opacity last:border-b-0 last:pb-0",
              hover !== null && hover !== i && "opacity-50",
            )}
          >
            <p className="flex items-center gap-2 text-[13.5px] leading-[18px] text-foreground/80">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ background: accent(shade[i]) }}
              />
              {coinName(r.coin)}
              <span className="sr-only">
                , {Math.round((r.volume / total) * 100)}% of the three
              </span>
            </p>
            <p className="mt-[5px] flex items-baseline justify-between gap-3 ps-[18px]">
              <span className="font-mono text-[15px] leading-5 font-medium tracking-[-0.02em] tabular-nums">
                {money(r.volume)}
              </span>
              <span className="font-mono text-[11.5px] leading-4 text-muted-foreground tabular-nums">
                24h: {money(r.day)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ---------------------------------- Portfolio ---------------------------------- */

function PortfolioCard({ now }: { now: Date }) {
  const money = useMoney();
  const [range, setRange] = useState<Range>("7D");
  const data = useMemo(
    () => sample.portfolio(range, now),
    [range, Math.floor(+now / 60_000)],
  );
  const first = data.points[0].value;
  const last = data.points[data.points.length - 1].value;
  const words = {
    "1D": "last 24 hours",
    "7D": "last 7 days",
    "1M": "last month",
    "3M": "last 3 months",
    "6M": "last 6 months",
    "1Y": "last year",
  }[range];
  const format = (d: Date) =>
    range === "1D" || range === "7D"
      ? d.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  return (
    <Panel
      aria-label="Portfolio value"
      className="flex min-h-[359px] flex-col px-5 pt-5 pb-[24px]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12.5px] leading-4 text-muted-foreground">
            Portfolio Value
          </p>
          <p className="mt-[9px] font-mono text-[26px] leading-8 font-medium tracking-[-0.03em] tabular-nums">
            {money(last)}
          </p>
          <p className="mt-[9px] flex items-center gap-1.5 text-[12.5px] leading-4 text-muted-foreground">
            <Change value={((last - first) / first) * 100} digits={1} />
            vs {words}
          </p>
        </div>
        <Segmented
          label="Range"
          value={range}
          options={sample.RANGES}
          onChange={setRange}
          className="-mt-1 -me-1 h-8"
          item="px-2 text-[12px]"
        />
      </div>
      <PortfolioChart
        key={range}
        points={data.points}
        buckets={data.buckets}
        btcPrice={BTC}
        label={`Portfolio value, ${words}`}
        format={format}
        className="mt-[21px] min-h-[210px] flex-1"
      />
    </Panel>
  );
}

/* ---------------------------------- Markets ---------------------------------- */

type MarketKey = "price" | "change24h" | "change7d" | "volume" | "cap";

function MarketsCard() {
  const money = useMoney();
  const [query, setQuery] = useState("");
  const [span, setSpan] = useState<Trend>("7D");
  const [filter, setFilter] = useState<"all" | "gainers" | "losers">("all");
  const [sort, setSort] = useState<Sort<MarketKey>>(null);
  const [picked, setPicked] = useState<CoinId[]>([]);
  const q = query.trim().toLowerCase();
  const rows = sample.MARKETS.filter(
    (r) =>
      (!q ||
        `${coinName(r.coin)} ${sample.COINS[r.coin].symbol}`
          .toLowerCase()
          .includes(q)) &&
      (filter === "all" ||
        (filter === "gainers" ? r.change24h >= 0 : r.change24h < 0)),
  ).sort((a, b) => (sort ? (a[sort.key] - b[sort.key]) * sort.dir : 0));
  const all = rows.length > 0 && rows.every((r) => picked.includes(r.coin));
  const some = rows.some((r) => picked.includes(r.coin));
  const exportCsv = () => {
    const head = [
      "Coin",
      "Price",
      "24h change",
      "7d change",
      "Volume (24h)",
      "Market cap",
    ];
    const lines = sample.MARKETS.filter((r) => picked.includes(r.coin)).map(
      (r) =>
        [
          coinName(r.coin),
          r.price,
          r.change24h,
          r.change7d,
          r.volume,
          r.cap,
        ].join(","),
    );
    const url = URL.createObjectURL(
      new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }),
    );
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "markets.csv",
    });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const th = "h-[30px] px-3 text-[12.5px] font-normal text-muted-foreground";
  return (
    <Panel aria-label="Markets" className="px-5 pt-[11px] pb-[26px]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
        <span
          aria-hidden
          className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-foreground/[0.045] text-foreground/75"
        >
          <ChartLine className="size-[17px]" />
        </span>
        <div className="me-auto min-w-0">
          <h2 className="text-[15.5px] leading-5 font-semibold tracking-[-0.01em]">
            Markets
          </h2>
          {picked.length ? (
            <p className="flex items-center gap-2 text-[11.5px] leading-4 text-muted-foreground">
              {picked.length} selected ·
              <button
                type="button"
                onClick={exportCsv}
                className={cn(
                  "cursor-pointer rounded-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground",
                  focusRing,
                )}
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setPicked([])}
                className={cn(
                  "cursor-pointer rounded-sm hover:text-foreground",
                  focusRing,
                )}
              >
                Clear
              </button>
            </p>
          ) : (
            <p className="truncate text-[11.5px] leading-4 text-muted-foreground">
              Prices, volume and trend for the coins you follow
            </p>
          )}
        </div>
        <label className="flex h-[34px] w-full items-center gap-2 rounded-[10px] bg-foreground/[0.045] px-3 focus-within:ring-2 focus-within:ring-ring @2xl:w-[211px]">
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search"
            aria-label="Search coins"
            className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <Segmented
          label="Trend window"
          value={span}
          options={["1D", "7D", "1M", "1Y"] as const}
          onChange={setSpan}
          className="h-[34px]"
          item="px-2.5 text-[12px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-border/90 bg-card px-3 text-[13px] font-medium capitalize shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-muted/60",
              press,
              focusRing,
            )}
          >
            {filter}
            <ChevronDown
              className="size-3.5 text-muted-foreground"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {(["all", "gainers", "losers"] as const).map((f) => (
              <DropdownMenuCheckboxItem
                key={f}
                checked={filter === f}
                onCheckedChange={() => setFilter(f)}
                closeOnSelect
                className="capitalize"
              >
                {f === "all" ? "All coins" : f}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="-mx-5 mt-[15px] overflow-x-auto px-5 [scrollbar-width:thin]">
        <table className="w-full min-w-[860px] border-separate border-spacing-0 text-[13.5px]">
          <thead>
            <tr className="[&>th]:bg-foreground/[0.035] [&>th:first-child]:rounded-s-[10px] [&>th:last-child]:rounded-e-[10px]">
              <th className={cn(th, "w-[46px] ps-3.5 text-start")}>
                <Checkbox
                  aria-label="Select all"
                  checked={all ? true : some ? "indeterminate" : false}
                  onCheckedChange={() =>
                    setPicked(
                      all
                        ? picked.filter((c) => !rows.some((r) => r.coin === c))
                        : [...new Set([...picked, ...rows.map((r) => r.coin)])],
                    )
                  }
                  className="size-4 rounded-[4px]"
                />
              </th>
              <th className={cn(th, "text-start")}>Assets</th>
              <th className={cn(th, "text-start")}>
                <SortButton k="price" sort={sort} onSort={setSort}>
                  Price
                </SortButton>
              </th>
              <th className={cn(th, "text-center")}>
                <SortButton k="change24h" sort={sort} onSort={setSort}>
                  24h Change
                </SortButton>
              </th>
              <th className={cn(th, "text-center")}>
                <SortButton k="change7d" sort={sort} onSort={setSort}>
                  7d Change
                </SortButton>
              </th>
              <th className={cn(th, "text-end")}>
                <SortButton k="volume" sort={sort} onSort={setSort} align="end">
                  Volume (24h)
                </SortButton>
              </th>
              <th className={cn(th, "w-[168px] text-center")}>
                Trend ({span})
              </th>
              <th className={cn(th, "pe-4 text-end")}>
                <SortButton k="cap" sort={sort} onSort={setSort} align="end">
                  Market Cap
                </SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <MarketLine
                key={r.coin}
                row={r}
                span={span}
                picked={picked.includes(r.coin)}
                onPick={(on) =>
                  setPicked(
                    on
                      ? [...picked, r.coin]
                      : picked.filter((c) => c !== r.coin),
                  )
                }
                money={money}
              />
            ))}
            {!rows.length ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-[13.5px] text-muted-foreground"
                >
                  No coins match “{query.trim() || filter}”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function MarketLine({
  row: r,
  span,
  picked,
  onPick,
  money,
}: {
  row: MarketRow;
  span: Trend;
  picked: boolean;
  onPick: (on: boolean) => void;
  money: ReturnType<typeof useMoney>;
}) {
  const c = sample.COINS[r.coin];
  const line = useMemo(() => sample.trend(r, span), [r, span]);
  const td =
    "h-[53px] border-b border-border/70 px-3 tabular-nums transition-colors";
  return (
    <tr
      className={cn(
        "group/row [&>td]:transition-colors hover:[&>td]:bg-foreground/[0.02]",
        picked && "[&>td]:bg-foreground/[0.03]",
      )}
    >
      <td className={cn(td, "ps-3.5")}>
        <Checkbox
          aria-label={`Select ${c.name}`}
          checked={picked}
          onCheckedChange={(v) => onPick(Boolean(v))}
          className="size-4 rounded-[4px]"
        />
      </td>
      <td className={td}>
        <span className="flex items-center gap-3">
          <CoinMark coin={r.coin} size={38} />
          <span className="min-w-0">
            <span className="block text-[13.5px] leading-[18px] font-medium">
              {c.name}
            </span>
            <span className="block text-[11.5px] leading-4 text-muted-foreground">
              {c.symbol}
            </span>
          </span>
        </span>
      </td>
      <td className={cn(td, "font-mono font-medium tracking-[-0.02em]")}>
        {money(r.price)}
      </td>
      <td className={cn(td, "text-center text-[12.5px]")}>
        <TrendChange value={r.change24h} />
      </td>
      <td className={cn(td, "text-center text-[12.5px]")}>
        <TrendChange value={r.change7d} />
      </td>
      <td
        className={cn(td, "text-end font-mono font-medium tracking-[-0.02em]")}
      >
        {money(r.volume, { compact: true })}
      </td>
      <td className={td}>
        <Sparkline
          values={line}
          up={sample.trendChange(r, span) >= 0}
          className="mx-auto h-[30px] w-[126px]"
        />
      </td>
      <td
        className={cn(
          td,
          "pe-4 text-end font-mono font-medium tracking-[-0.02em]",
        )}
      >
        {money(r.cap, { compact: true })}
      </td>
    </tr>
  );
}

/* ---------------------------------- Balance ---------------------------------- */

type Action = "deposit" | "withdraw" | "swap" | "transfer";
const ACTIONS: {
  id: Action;
  label: string;
  icon: typeof Wallet;
  verb: string;
}[] = [
  { id: "deposit", label: "Deposit", icon: Wallet, verb: "Deposited" },
  {
    id: "withdraw",
    label: "Withdraw",
    icon: ArrowDownToLine,
    verb: "Withdrew",
  },
  { id: "swap", label: "Swap", icon: ArrowUpDown, verb: "Swapped" },
  { id: "transfer", label: "Transfer", icon: ArrowLeftRight, verb: "Sent" },
];

function BalanceCard({ now }: { now: Date }) {
  const money = useMoney();
  const [balance, setBalance] = useState(102_540);
  const [chain, setChain] = useState<Chain>("BNB Chain");
  const [synced, setSynced] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const shown = synced ?? now;
  const refresh = () => {
    setSpinning(true);
    setTimeout(() => (setSpinning(false), setSynced(new Date())), 700);
  };
  const done = (a: Action, amount: number) => {
    setBalance(
      (b) => b + (a === "deposit" ? amount : a === "swap" ? 0 : -amount),
    );
    setNote(`${ACTIONS.find((x) => x.id === a)!.verb} ${money(amount)}`);
    setTimeout(() => setNote(null), 4000);
  };
  return (
    <Panel aria-label="My balance" className="px-4 pt-[18px] pb-[17px]">
      <div className="flex items-center justify-between gap-3">
        <CardTitle>My Balance</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex h-[27px] cursor-pointer items-center gap-1.5 rounded-full bg-foreground/[0.045] ps-1 pe-2.5 text-[12px] font-medium hover:bg-foreground/[0.07]",
              focusRing,
            )}
          >
            <span
              aria-hidden
              className="grid size-[19px] place-items-center rounded-full text-white"
              style={{ background: ACCENT }}
            >
              <span className="size-[7px] rotate-45 rounded-[1.5px] bg-white" />
            </span>
            {chain}
            <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[12px] font-normal text-muted-foreground">
              Network
            </DropdownMenuLabel>
            {sample.CHAINS.map((c) => (
              <DropdownMenuCheckboxItem
                key={c}
                checked={chain === c}
                onCheckedChange={() => setChain(c)}
                closeOnSelect
              >
                {c}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        className="mt-[13px] font-mono text-[29.5px] leading-[38px] font-medium tracking-[-0.03em] tabular-nums"
        aria-live="polite"
      >
        {money(balance)}
      </p>
      <p
        className="mt-[8px] flex h-5 items-center gap-3 border-b border-border/70 pb-[22px] text-[12.5px] leading-5 text-muted-foreground"
        style={{ boxSizing: "content-box" }}
      >
        <span className="font-mono tabular-nums" suppressHydrationWarning>
          {shown.toLocaleTimeString("en-GB", { hour12: false })}
        </span>
        <button
          type="button"
          onClick={refresh}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-[6px] px-1 hover:text-foreground",
            focusRing,
          )}
        >
          <RefreshCw
            className={cn("size-3.5", spinning && "animate-spin")}
            aria-hidden
          />
          {spinning ? "Refreshing" : "Refresh"}
        </button>
        {note ? (
          <span role="status" className="ms-auto truncate text-foreground/80">
            {note}
          </span>
        ) : null}
      </p>
      <div className="mt-[18px] grid grid-cols-2 gap-[11px]">
        {ACTIONS.map((a) => (
          <ActionButton
            key={a.id}
            action={a}
            balance={balance}
            onDone={(amount) => done(a.id, amount)}
            primary={a.id === "deposit"}
          />
        ))}
      </div>
    </Panel>
  );
}

function ActionButton({
  action: a,
  balance,
  onDone,
  primary,
}: {
  action: (typeof ACTIONS)[number];
  balance: number;
  onDone: (amount: number) => void;
  primary: boolean;
}) {
  const money = useMoney();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [coin, setCoin] = useState<CoinId>("btc");
  const value = Number(amount);
  const spends = a.id === "withdraw" || a.id === "transfer";
  const error = !amount
    ? null
    : !(value > 0)
      ? "Enter an amount above zero"
      : spends && value > balance
        ? `More than your balance of ${money(balance)}`
        : null;
  const submit = () => {
    if (!amount || error) return;
    onDone(value);
    setOpen(false);
    setAmount("");
  };
  return (
    <Popover open={open} onOpenChange={(o) => (setOpen(o), o || setAmount(""))}>
      <PopoverTrigger
        className={cn(
          "flex h-[49px] cursor-pointer items-center justify-center gap-2.5 rounded-[12px] text-[15px] font-medium",
          primary
            ? "text-white shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.2)] hover:brightness-95"
            : "bg-foreground/[0.05] text-foreground/85 hover:bg-foreground/[0.08] hover:text-foreground aria-expanded:bg-foreground/[0.08]",
          press,
          focusRing,
        )}
        style={primary ? { background: ACCENT } : undefined}
      >
        <a.icon className="size-[19px]" aria-hidden />
        {a.label}
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-[280px] rounded-[14px] p-3.5"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p className="text-[14px] font-semibold">{a.label}</p>
          <label
            className="mt-3 block text-[12px] text-muted-foreground"
            htmlFor={`${a.id}-amount`}
          >
            Amount
          </label>
          <input
            id={`${a.id}-amount`}
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0.00"
            aria-invalid={Boolean(error)}
            className="mt-1.5 h-10 w-full rounded-[10px] border border-border bg-card px-3 font-mono text-[15px] tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
          />
          {a.id === "swap" || a.id === "deposit" ? (
            <div
              className="mt-2.5 flex flex-wrap gap-1.5"
              role="radiogroup"
              aria-label={a.id === "swap" ? "Into" : "As"}
            >
              {(["btc", "eth", "sol"] as CoinId[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={coin === c}
                  onClick={() => setCoin(c)}
                  className={cn(
                    "flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[12px]",
                    coin === c
                      ? "bg-foreground text-background"
                      : "bg-foreground/[0.05] text-foreground/75 hover:text-foreground",
                    focusRing,
                  )}
                >
                  {sample.COINS[c].symbol}
                </button>
              ))}
            </div>
          ) : null}
          <p
            className="mt-2 min-h-4 text-[12px] leading-4"
            style={{ color: error ? "var(--destructive)" : undefined }}
          >
            {error ?? (value > 0 ? `≈ ${(value / BTC).toFixed(5)} BTC` : "")}
          </p>
          <button
            type="submit"
            disabled={!amount || Boolean(error)}
            className={cn(
              "mt-2 h-9 w-full cursor-pointer rounded-[10px] bg-foreground text-[13.5px] font-medium text-background hover:bg-foreground/88 disabled:cursor-not-allowed disabled:opacity-40",
              press,
              focusRing,
            )}
          >
            {a.label} {value > 0 ? money(value) : ""}
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------------- Assets ---------------------------------- */

type AssetKey = "name" | "price" | "change";

function MenuButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          "-my-1 -me-1.5 grid size-8 cursor-pointer place-items-center rounded-[8px] text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground aria-expanded:bg-foreground/[0.06]",
          focusRing,
        )}
      >
        <MoreHorizontal className="size-5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AssetsCard() {
  const money = useMoney();
  const [sort, setSort] = useState<Sort<AssetKey>>(null);
  const rows = [...sample.HOLDINGS].sort((a, b) => {
    if (!sort) return 0;
    const va = sort.key === "name" ? coinName(a.coin) : a[sort.key];
    const vb = sort.key === "name" ? coinName(b.coin) : b[sort.key];
    return (
      (typeof va === "string"
        ? va.localeCompare(vb as string)
        : va - (vb as number)) * sort.dir
    );
  });
  return (
    <Panel aria-label="Top assets" className="px-4 pt-[18px] pb-1">
      <div className="flex items-center justify-between">
        <CardTitle>Top Assets</CardTitle>
        <MenuButton label="Top assets options">
          <DropdownMenuItem onSelect={() => setSort({ key: "price", dir: -1 })}>
            Highest price first
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setSort({ key: "change", dir: -1 })}
          >
            Biggest movers first
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSort({ key: "name", dir: 1 })}>
            A to Z
          </DropdownMenuItem>
          {sort ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSort(null)}>
                Reset order
              </DropdownMenuItem>
            </>
          ) : null}
        </MenuButton>
      </div>
      <div className="mt-[8px] grid grid-cols-[minmax(0,1fr)_96px_80px] items-center text-[12.5px] text-muted-foreground">
        <SortButton k="name" sort={sort} onSort={setSort}>
          Assets
        </SortButton>
        <span className="text-end">
          <SortButton k="price" sort={sort} onSort={setSort} align="end">
            Price
          </SortButton>
        </span>
        <span className="text-end">
          <SortButton k="change" sort={sort} onSort={setSort} align="end">
            Dynamic
          </SortButton>
        </span>
      </div>
      <ul className="mt-[2px]">
        {rows.map((r) => {
          const c = sample.COINS[r.coin];
          return (
            <li
              key={r.coin}
              className="grid h-[52px] grid-cols-[minmax(0,1fr)_96px_80px] items-center border-b border-border/60 last:border-b-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <CoinMark coin={r.coin} size={40} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] leading-[18px] font-medium">
                    {c.name}
                  </span>
                  <span className="block text-[11.5px] leading-4 text-muted-foreground">
                    {c.symbol}
                  </span>
                </span>
              </span>
              <span className="text-end font-mono text-[13.5px] font-medium tracking-[-0.02em] tabular-nums">
                {money(r.price)}
              </span>
              <span className="text-end text-[12.5px]">
                <Change value={r.change} />
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ---------------------------------- Gainers ---------------------------------- */

type GainerKey = "name" | "cap" | "price" | "change";

function GainersCard() {
  const money = useMoney();
  const [sort, setSort] = useState<Sort<GainerKey>>(null);
  const [watched, setWatched] = useState<string[]>(["nova", "quartz"]);
  const [onlyWatched, setOnlyWatched] = useState(false);
  const rows = sample.GAINERS.filter(
    (g) => !onlyWatched || watched.includes(g.id),
  ).sort((a: Gainer, b: Gainer) => {
    if (!sort) return 0;
    const va = a[sort.key];
    const vb = b[sort.key];
    return (
      (typeof va === "string"
        ? va.localeCompare(vb as string)
        : va - (vb as number)) * sort.dir
    );
  });
  const cols =
    "grid grid-cols-[minmax(0,1fr)_72px_64px_70px] items-center gap-x-1";
  return (
    <Panel aria-label="Top gainers" className="px-4 pt-[18px] pb-1.5">
      <div className="flex items-center justify-between">
        <CardTitle>Top Gainers</CardTitle>
        <MenuButton label="Top gainers options">
          <DropdownMenuCheckboxItem
            checked={onlyWatched}
            onCheckedChange={(v) => setOnlyWatched(Boolean(v))}
          >
            Watchlist only
          </DropdownMenuCheckboxItem>
          {sort ? (
            <DropdownMenuItem onSelect={() => setSort(null)}>
              Reset order
            </DropdownMenuItem>
          ) : null}
        </MenuButton>
      </div>
      <div
        className={cn(cols, "mt-[10px] text-[12.5px] text-muted-foreground")}
      >
        <SortButton k="name" sort={sort} onSort={setSort}>
          Coin
        </SortButton>
        <span className="text-end">
          <SortButton k="cap" sort={sort} onSort={setSort} align="end">
            Cap
          </SortButton>
        </span>
        <span className="text-end">
          <SortButton k="price" sort={sort} onSort={setSort} align="end">
            Price
          </SortButton>
        </span>
        <span className="text-end">
          <SortButton k="change" sort={sort} onSort={setSort} align="end">
            Dynamic
          </SortButton>
        </span>
      </div>
      <ul className="mt-0.5">
        {rows.map((g) => {
          const on = watched.includes(g.id);
          return (
            <li key={g.id} className={cn(cols, "h-[42px]")}>
              <span className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={
                    on
                      ? `Remove ${g.name} from the watchlist`
                      : `Watch ${g.name}`
                  }
                  onClick={() =>
                    setWatched(
                      on
                        ? watched.filter((x) => x !== g.id)
                        : [...watched, g.id],
                    )
                  }
                  className={cn(
                    "-ms-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] hover:bg-foreground/[0.06]",
                    press,
                    focusRing,
                  )}
                >
                  {on ? (
                    <StarFill
                      className="size-4"
                      style={{ color: ACCENT }}
                      aria-hidden
                    />
                  ) : (
                    <Star className="size-4 text-foreground/40" aria-hidden />
                  )}
                </button>
                <span className="truncate text-[13px] font-medium">
                  {g.name}
                </span>
              </span>
              <span className="text-end font-mono text-[12.5px] tabular-nums">
                {money(g.cap, { compact: true })}
              </span>
              <span className="text-end font-mono text-[12.5px] tabular-nums">
                {money(g.price)}
              </span>
              <span className="text-end text-[12.5px]">
                <Change value={g.change} />
              </span>
            </li>
          );
        })}
        {!rows.length ? (
          <li className="py-6 text-center text-[13px] text-muted-foreground">
            Nothing on your watchlist yet. Star a coin to follow it.
          </li>
        ) : null}
      </ul>
    </Panel>
  );
}
