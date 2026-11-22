"use client";

import * as React from "react";

import { cn } from "cn";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { TodoSection } from "./calendar-data";
import { todoSections } from "./calendar-data";

const tabs = ["To-do List", "Events"] as const;

const ghostIcon =
  "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground";

function Section({ section }: { readonly section: TodoSection }) {
  const [open, setOpen] = React.useState(section.defaultOpen);
  const [checked, setChecked] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(section.items.map((item) => [item.id, Boolean(item.done)])),
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex h-[68px] items-center gap-2">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2.5 text-[16px] outline-none">
          {open ? (
            <ChevronUp className="size-5 shrink-0 text-foreground/70" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="size-5 shrink-0 text-foreground/70" strokeWidth={1.5} />
          )}
          <span className="truncate">{section.title}</span>
        </CollapsibleTrigger>
        <button type="button" aria-label={`Add to ${section.title}`} className={ghostIcon}>
          <Plus className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      <CollapsibleContent>
        <ul className="flex flex-col gap-[22px] pb-6 pl-1">
          {section.items.map((item) => (
            <li key={item.id}>
              <label htmlFor={item.id} className="flex cursor-pointer items-start gap-2.5">
                <Checkbox
                  id={item.id}
                  checked={checked[item.id]}
                  onCheckedChange={(value) => setChecked((prev) => ({ ...prev, [item.id]: value === true }))}
                  className="mt-px size-[18px] rounded-[5px] border-[1.5px] border-input dark:border-neutral-500"
                />
                <span
                  className={cn("text-[15px] text-muted-foreground leading-[21px]", checked[item.id] && "line-through")}
                >
                  {item.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TodayPanel() {
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("To-do List");

  return (
    <aside className="flex w-[254px] shrink-0 flex-col overflow-hidden rounded-[14px] border bg-card">
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-normal text-[26px] tracking-[-0.01em]">Today</h2>
          <button type="button" aria-label="Sort tasks" className={ghostIcon}>
            {/* Two right-aligned rules — the reference's sort glyph. */}
            <svg role="presentation" viewBox="0 0 20 20" fill="none" className="size-5">
              <path d="M2 8h16M7 11.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="-mx-5 mt-4 flex gap-5 border-b px-5">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "-mb-px border-transparent border-b-2 pb-2.5 text-[15px] transition-colors",
                tab === item ? "border-foreground text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-4">
        {tab === "To-do List" ? (
          todoSections.map((section, index) => (
            <React.Fragment key={section.id}>
              {index > 0 && <div className="border-t" />}
              <Section section={section} />
            </React.Fragment>
          ))
        ) : (
          <p className="pt-8 text-center text-[15px] text-muted-foreground">No events for today.</p>
        )}
      </div>
    </aside>
  );
}
