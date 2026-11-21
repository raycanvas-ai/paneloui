"use client";

import type { ReactNode } from "react";
import { RiFlashlightFill } from "@remixicon/react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";

import { cx } from "@/utils/cx";

// The site chrome's controls, drawn after panelo.com. Colours and type come from the
// `site-*` tokens in theme.css and typography.css, so light and dark follow the theme.

type PillVariant = "primary" | "secondary" | "pro" | "ghost";

const PILL_VARIANTS: Record<PillVariant, string> = {
  primary: "bg-linear-to-b from-site-cta-from to-site-cta-to text-site-cta-text shadow-site-cta hover:opacity-90",
  secondary: "bg-site-pill text-site-ink hover:bg-site-pill-hover",
  pro: "bg-site-pro text-site-pro-text shadow-site-pro hover:brightness-[0.98] [&_svg]:text-site-pro-icon",
  ghost: "text-site-muted hover:bg-site-pill hover:text-site-ink",
};

/** A pill control's classes: `sm` for header and toolbar controls, `lg` for calls to action. */
export function pill(variant: PillVariant = "secondary", size: "sm" | "lg" = "sm", className?: string) {
  return cx(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full whitespace-nowrap transition-[background-color,opacity,filter] duration-150",
    "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page",
    "[&_svg]:shrink-0",
    size === "sm" ? "h-7 px-[10.5px] text-site-body-medium [&_svg]:size-3.5" : "h-[42px] px-5 text-site-button [&_svg]:size-4",
    PILL_VARIANTS[variant],
    className,
  );
}

/** The blue "Pro" tag on cards and in the sidebar. */
export function ProTag({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-[22px] items-center gap-0.5 rounded-full bg-site-pro ps-[7px] pe-[9px] text-site-chip text-site-pro-text shadow-site-pro",
        className,
      )}
    >
      <RiFlashlightFill className="size-3 text-site-pro-icon" aria-hidden />
      Pro
    </span>
  );
}

/** A small outlined label, like a card's category. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-[22px] items-center rounded-full bg-site-surface px-2 text-site-chip text-site-muted ring-1 ring-site-ring",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type SiteTab = { value: string; label: string; count?: number };

/** Underline tabs with optional counts, on ui-sdk's Tabs so keyboards and agents can drive them. */
export function SiteTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  center = false,
  trailing,
  className,
  children,
}: {
  items: SiteTab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The tab list's accessible name. */
  label: string;
  center?: boolean;
  /** Controls at the end of the tab row, like a filter. */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange && ((next: string | null) => next !== null && onValueChange(next))}
      className={cx("flex flex-col", className)}
    >
      <div className={cx("flex items-center gap-4 border-b border-site-hairline", center && "mx-auto w-fit max-w-full")}>
        <TabsList
          aria-label={label}
          className="-mb-px flex min-w-0 gap-[22px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <TabsTab
              key={item.value}
              value={item.value}
              className={cx(
                "relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 pt-4 pb-2.5 text-site-body-medium text-site-muted transition-colors duration-150 outline-none",
                "hover:text-site-ink data-selected:text-site-ink",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-site-ink after:opacity-0 after:transition-opacity data-selected:after:opacity-100",
                "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-border-focus-ring",
              )}
            >
              {item.label}
              {item.count !== undefined && <span className="text-site-count text-site-faint">{item.count}</span>}
            </TabsTab>
          ))}
        </TabsList>
        {trailing && <div className="ms-auto flex shrink-0 items-center pb-1.5">{trailing}</div>}
      </div>
      {children}
    </Tabs>
  );
}

export function SiteTabPanel({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
  return (
    <TabsPanel value={value} className={cx("outline-none", className)}>
      {children}
    </TabsPanel>
  );
}
