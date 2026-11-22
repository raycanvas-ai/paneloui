"use client";

import * as React from "react";

import { cn } from "cn";
import { Bell, Calendar, ChevronDown, Plus, Search, Upload } from "lucide-react";

import type { Company } from "./companies-data";
import { activityTrend, companies, TONES } from "./companies-data";

// Every value below is measured off the reference mock (1594px-wide crop).
const COLS = "grid-cols-[50px_222px_301px_194px_121px_144px_188px_142px_203px_minmax(180px,1fr)]";
const ROW = "h-[58px]";
const CELL = "flex items-center pl-[13px]";

const WIN_BARS = 18;

// Same knob as the calendar page: sizes are measured off a large reference crop,
// this trims the whole page without re-deriving them.
const UI_SCALE = 0.8;
const SPARK_BARS = 14;

const tabs = ["Companies", "Deals", "Forecast"] as const;

const filters = [
  { label: "Sort by", value: "Pipeline Value" },
  { label: "Filter", value: "All Owners" },
  { label: "Stage", value: "Any" },
  { label: "Last Activity", value: "90 Days" },
];

const headers = [
  "",
  "Companies",
  "Segment & Stage",
  "Account Owner",
  "Open Deals",
  "Pipeline Value",
  "Win Probability",
  "Activity Trend",
  "Last Interaction",
  "Account Health",
];

const HEALTH_DOT: Record<Company["health"], string> = {
  Healthy: "var(--success-solid)",
  Watch: "var(--warning-solid)",
  "At Risk": "var(--destructive)",
};

function Checkbox({
  checked,
  indeterminate,
  onClick,
}: {
  readonly checked: boolean;
  readonly indeterminate?: boolean;
  readonly onClick: () => void;
}) {
  const on = checked || indeterminate;
  return (
    // biome-ignore lint/a11y/useSemanticElements: tri-state (mixed) styled control; a native input cannot render the indeterminate dash
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={onClick}
      className={cn(
        "flex size-[18px] items-center justify-center rounded-[4px] border transition-colors",
        on ? "border-warning-solid bg-warning-solid" : "border-muted-foreground/40 hover:border-muted-foreground",
      )}
    >
      {indeterminate ? (
        <span className="h-[2px] w-[9px] rounded-full bg-black" />
      ) : checked ? (
        <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
          <path
            d="m2.5 6.2 2.2 2.2 4.8-4.8"
            stroke="var(--primary-foreground)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}

function Badge({ label, tone }: { readonly label: string; readonly tone: keyof typeof TONES }) {
  return (
    <span className={cn("flex h-[31px] shrink-0 items-center rounded-[9px] border px-[13px] text-[17px]", TONES[tone])}>
      {label}
    </span>
  );
}

/** 25 segments; the filled run carries a red→green ramp, the rest stay inert. */
function WinBar({ value }: { readonly value: number }) {
  const filled = Math.round((value / 100) * WIN_BARS);
  return (
    <div className="flex items-end gap-px">
      {Array.from({ length: WIN_BARS }, (_, i) => (
        <span
          key={i}
          className="h-[15px] w-[5px] rounded-[1px]"
          style={{
            backgroundColor: i < filled ? `hsl(${(i / (WIN_BARS - 1)) * 135} 68% 56%)` : "var(--muted)",
          }}
        />
      ))}
    </div>
  );
}

function Sparkline({ seed }: { readonly seed: string }) {
  const values = activityTrend(seed, SPARK_BARS);
  return (
    <div className="flex h-[22px] items-end gap-px">
      {values.map((v, i) => (
        <span
          key={i}
          className="w-[6px] rounded-[1px]"
          style={{ height: `${Math.round(v * 22)}px`, backgroundColor: `hsl(145 55% ${34 + v * 24}%)` }}
        />
      ))}
    </div>
  );
}

function Avatar({ name }: { readonly name: string }) {
  return (
    <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-accent font-medium text-[11px] text-foreground/80">
      {name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

export function CompaniesTable() {
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("Companies");
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(["microsoft"]));

  const allSelected = selected.size === companies.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(companies.map((c) => c.id)));
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-background text-foreground"
      style={{ zoom: UI_SCALE }}
      data-content-padding="false"
    >
      <div className="flex items-center justify-between px-5 pt-[18px]">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-[22px] tracking-[-0.01em]">Companies</h1>
          <span className="flex h-[28px] items-center gap-2 rounded-full bg-accent px-3 text-[15px] text-foreground">
            <span className="size-[7px] rounded-full bg-success-solid" />
            Active
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Search"
            className="flex size-[38px] items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-accent"
          >
            <Search className="size-[18px]" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-[38px] items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-accent"
          >
            <Bell className="size-[18px]" strokeWidth={1.6} />
          </button>
          <span className="flex h-[38px] items-center gap-2.5 rounded-full border border-border bg-card pr-4 pl-[5px]">
            <Avatar name="Jensen Ackles" />
            <span className="text-[16px]">Jensen Ackles</span>
          </span>
        </div>
      </div>

      <div className="flex gap-6 border-border border-b px-5 pt-[44px]">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "-mb-px border-b-2 pb-[22px] text-[17px] leading-none transition-colors",
              tab === item
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-5 py-[26px]">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            className="flex h-[36px] items-center rounded-full border border-border text-[17px] hover:bg-card"
          >
            <span className="px-3.5 text-muted-foreground">{f.label}</span>
            <span className="flex h-full items-center gap-1.5 border-border border-l pr-3 pl-3.5 font-medium">
              {f.value}
              <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.8} />
            </span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="flex h-[36px] items-center gap-2 rounded-full border border-border bg-card px-4 text-[17px] hover:bg-accent"
          >
            <Upload className="size-[17px]" strokeWidth={1.7} />
            Export
          </button>
          <button
            type="button"
            className="flex h-[36px] items-center gap-1.5 rounded-full bg-primary pr-4 pl-3 font-medium text-[17px] text-white hover:bg-primary"
          >
            <Plus className="size-[18px]" strokeWidth={2} />
            New Company
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-max">
          <div className={cn("sticky top-0 z-10 grid h-[52px] bg-muted/40 text-[17px] text-muted-foreground", COLS)}>
            {headers.map((h, i) => (
              <div key={h || "select"} className={cn(CELL, i === 0 && "pl-3")}>
                {i === 0 ? (
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && selected.size > 0}
                    onClick={toggleAll}
                  />
                ) : (
                  h
                )}
              </div>
            ))}
          </div>

          {companies.map((c) => {
            const isSelected = selected.has(c.id);
            return (
              <div
                key={c.id}
                className={cn(
                  "grid border-border border-b text-[20px]",
                  ROW,
                  COLS,
                  isSelected ? "bg-accent/50" : "hover:bg-accent/40",
                )}
              >
                <div className={cn(CELL, "pl-3")}>
                  <Checkbox checked={isSelected} onClick={() => toggleRow(c.id)} />
                </div>
                <div className={CELL}>{c.name}</div>
                <div className={cn(CELL, "gap-2")}>
                  {c.tags.map((tag) => (
                    <Badge key={tag.label} label={tag.label} tone={tag.tone} />
                  ))}
                  {c.moreTags ? <Badge label={`+${c.moreTags}`} tone="gray" /> : null}
                </div>
                <div className={cn(CELL, "gap-2.5")}>
                  <Avatar name={c.owner} />
                  {c.owner}
                </div>
                <div className={CELL}>{c.openDeals}</div>
                <div className={cn(CELL, "gap-1.5")}>
                  <span className="text-muted-foreground">$</span>
                  {c.pipeline.toLocaleString("en-US")}
                </div>
                <div className={cn(CELL, "gap-[9px]")}>
                  <WinBar value={c.win} />
                  <span>{c.win}%</span>
                </div>
                <div className={CELL}>
                  <Sparkline seed={c.id} />
                </div>
                <div className={cn(CELL, "gap-2 whitespace-nowrap")}>
                  <Calendar className="size-[15px] shrink-0 text-muted-foreground" strokeWidth={1.6} />
                  {c.lastDate}
                  <span className="h-[15px] w-px shrink-0 bg-border" />
                  {c.lastLabel}
                </div>
                <div className={cn(CELL, "gap-2")}>
                  <span className="size-[7px] rounded-full" style={{ backgroundColor: HEALTH_DOT[c.health] }} />
                  {c.health}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex h-[50px] shrink-0 border-border border-t text-[16px] text-muted-foreground">
        <div className="flex w-[405px] items-center gap-2.5 border-border border-r px-4">
          <span className="text-foreground">{companies.length}</span>
          Companies in view
        </div>
        {["Sum of pipeline", "Avg win probality", "Add Calculation"].map((label, i) => (
          <div key={label} className={cn("flex flex-1 items-center gap-2.5 px-4", i < 2 && "border-border border-r")}>
            <Plus className="size-[17px]" strokeWidth={1.7} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
