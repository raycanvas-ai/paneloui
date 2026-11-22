"use client";
import * as React from "react";

import { cn } from "cn";
import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CircleCheckBig,
  Hourglass,
  Mail,
  MessageCircle,
  Search,
  Smartphone,
  SquareCheck,
  SquareX,
  UserPlus,
  UserRoundCog,
  UserRoundSearch,
  X,
} from "lucide-react";

import { type LibraryItem, library, TONE_TILE } from "./workflow-data";

const ICONS = {
  "user-plus": UserPlus,
  "user-search": UserRoundSearch,
  "user-cog": UserRoundCog,
  message: MessageCircle,
  "square-check": SquareCheck,
  "square-x": SquareX,
  "circle-check": CircleCheck,
  calendar: CalendarDays,
  hourglass: Hourglass,
  mail: Mail,
  smartphone: Smartphone,
  "circle-check-big": CircleCheckBig,
};

function Row({ item, onAdd }: { readonly item: LibraryItem; readonly onAdd: (item: LibraryItem) => void }) {
  const Icon = ICONS[item.icon as keyof typeof ICONS];
  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      className="flex w-full cursor-pointer items-start gap-[10px] px-[26px] py-[14px] text-left transition-colors hover:bg-background"
    >
      <span className={cn("flex size-[32px] shrink-0 items-center justify-center rounded-[9px]", TONE_TILE[item.tone])}>
        <Icon className="size-[19px]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-foreground text-[16px] leading-[20px]">{item.title}</span>
        {item.description ? (
          <span className="mt-[3px] block text-foreground/75 text-[15px] leading-[17px]">{item.description}</span>
        ) : null}
      </span>
    </button>
  );
}

export function WorkflowLibrary({ onAdd }: { readonly onAdd: (item: LibraryItem) => void }) {
  const [query, setQuery] = React.useState("");
  const [collapsed, setCollapsed] = React.useState<string[]>([]);

  const sections = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return library;
    return library
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(needle) || (item.description ?? "").toLowerCase().includes(needle),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <aside className="flex max-h-[45vh] w-full shrink-0 flex-col overflow-y-auto border-border border-t bg-background lg:max-h-none lg:w-[400px] lg:border-t-0 lg:border-l xl:w-[465px]">
      <div className="px-[26px] pt-[28px] pb-[15px]">
        {/* A label, so the whole field focuses the input — not just the strip
            the text happens to occupy. */}
        <label className="flex h-[40px] w-full cursor-text items-center gap-[10px] rounded-[10px] border border-border bg-card px-[14px] focus-within:border-border dark:bg-background">
          <Search className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setQuery("")}
            placeholder="Search triggers and actions"
            aria-label="Search workflow steps"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query === "" ? null : (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="-mr-[4px] shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-[16px]" />
            </button>
          )}
        </label>
      </div>

      {sections.length === 0 ? (
        <p className="px-[26px] py-[40px] text-center text-muted-foreground text-[15px]">No steps match “{query}”.</p>
      ) : (
        sections.map((section) => {
          const open = !collapsed.includes(section.id);
          return (
            <section key={section.id}>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((previous) =>
                    open ? [...previous, section.id] : previous.filter((id) => id !== section.id),
                  )
                }
                className="flex w-full cursor-pointer items-center gap-[10px] px-[26px] pt-[22px] pb-[4px] text-muted-foreground text-[15px] hover:text-foreground"
              >
                <ChevronDown
                  className={cn("size-[16px] transition-transform", !open && "-rotate-90")}
                  strokeWidth={2}
                />
                {section.label}
              </button>
              {open ? (
                <div>
                  {section.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {/* Rules are inset to the panel gutter, as in the reference. */}
                      {index > 0 ? <span className="mx-[26px] block h-px bg-muted" /> : null}
                      <Row item={item} onAdd={onAdd} />
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })
      )}
    </aside>
  );
}
