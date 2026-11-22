"use client";

import { useState } from "react";

import { cn } from "cn";
import { endOfDay, format, isToday, isWithinInterval, isYesterday, startOfDay, subDays } from "date-fns";
import { ChevronRight, Download, Globe, Laptop, MapPin, Search, SearchX } from "lucide-react";

import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import type { DateRange } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

import { ACTORS, type ActivityEvent, activityEvents, EVENT_TYPES, type EventType } from "./activity-data";

const defaultRange = (): DateRange => ({ from: subDays(new Date(), 29), to: new Date() });

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, d MMM");
}

export function ActivityLog() {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [type, setType] = useState<EventType | "all">("all");
  const [range, setRange] = useState<DateRange | undefined>(defaultRange);

  const q = query.trim().toLowerCase();
  const events = activityEvents.filter((event) => {
    if (actor !== "all" && event.actor !== actor) return false;
    if (type !== "all" && event.type !== type) return false;
    if (
      range?.from &&
      !isWithinInterval(event.at, { start: startOfDay(range.from), end: endOfDay(range.to ?? range.from) })
    )
      return false;
    if (!q) return true;
    return [event.actor, event.action, event.resource, event.ip, event.location].some((v) =>
      v.toLowerCase().includes(q),
    );
  });

  const days = Map.groupBy(events, (event) => startOfDay(event.at).getTime());

  const clearFilters = () => {
    setQuery("");
    setActor("all");
    setType("all");
    setRange(defaultRange());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <InputGroup className="lg:max-w-sm">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search activity"
            placeholder="Search actor, resource or IP..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>

        <div className="flex flex-wrap items-center gap-2 lg:flex-1">
          <Select value={actor} onValueChange={setActor}>
            <SelectTrigger className="w-40" aria-label="Filter by actor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All members</SelectItem>
                {ACTORS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(value) => setType(value as EventType | "all")}>
            <SelectTrigger className="w-40" aria-label="Filter by event type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All events</SelectItem>
                {Object.entries(EVENT_TYPES).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <DateRangePicker value={range} onChange={setRange} />

          <Button
            variant="outline"
            className="lg:ml-auto"
            onClick={() => toast.success(`Exporting ${events.length} events as CSV`)}
            disabled={events.length === 0}
          >
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="py-0">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="animate-stage stage-0">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle className="animate-stage stage-1">No events match these filters</EmptyTitle>
              <EmptyDescription className="animate-stage stage-2">
                Try a wider date range or a different member. Audit events are kept for 90 days.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="animate-stage stage-3">
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        [...days].map(([day, dayEvents]) => (
          <section key={day} aria-labelledby={`day-${day}`} className="flex flex-col gap-2">
            <h2 id={`day-${day}`} className="flex items-baseline gap-2 font-medium text-sm">
              {dayLabel(new Date(day))}
              <span className="font-normal text-muted-foreground text-xs tabular-nums">
                {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
              </span>
            </h2>
            <ol className="relative flex flex-col before:absolute before:inset-y-4 before:left-4 before:w-px before:bg-border">
              {dayEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}

function EventRow({ event }: { event: ActivityEvent }) {
  const meta = EVENT_TYPES[event.type];
  const Icon = meta.icon;
  const hasChanges = Boolean(event.changes?.length);

  return (
    <li className="relative flex gap-3 py-1.5">
      <div
        className={cn(
          "z-10 grid size-8 shrink-0 place-items-center rounded-lg ring-4 ring-background",
          event.destructive ? "bg-destructive/10 text-destructive" : meta.tone,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="sr-only">{meta.label}</span>
      </div>

      <Collapsible className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 rounded-lg px-3 py-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-medium">{event.actor}</span>{" "}
              <span className="text-muted-foreground">{event.action}</span>{" "}
              <span className={cn("font-medium", event.destructive && "text-destructive")}>{event.resource}</span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Globe className="size-3" aria-hidden="true" />
                {event.ip}
              </span>
              <span className="inline-flex items-center gap-1">
                <Laptop className="size-3" aria-hidden="true" />
                {event.device}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                {event.location}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <time dateTime={event.at.toISOString()} className="text-muted-foreground text-xs tabular-nums">
              {format(event.at, "HH:mm")}
            </time>
            <CollapsibleTrigger asChild>
              <Button size="xs" variant="ghost" className="group/trigger text-muted-foreground">
                {hasChanges ? "Changes" : "Details"}
                <ChevronRight
                  data-icon="inline-end"
                  className="transition-[rotate] duration-150 ease-out group-data-open/trigger:rotate-90"
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="mx-3 mt-1 mb-2 overflow-hidden rounded-lg border bg-muted/30 text-xs">
            {hasChanges && (
              <table className="w-full">
                <caption className="sr-only">Changed fields</caption>
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Field
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Before
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      After
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {event.changes?.map((change) => (
                    <tr key={change.field} className="border-b last:border-0">
                      <td className="px-3 py-2 text-muted-foreground">{change.field}</td>
                      <td className="px-3 py-2">
                        {change.from ? (
                          <span className="rounded-sm bg-destructive/10 px-1 text-destructive line-through">
                            {change.from}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">none</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-sm bg-success/10 px-1 text-success">{change.to}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <dl
              className={cn(
                "grid grid-cols-2 gap-x-4 gap-y-1 px-3 py-2 sm:grid-cols-[auto_1fr_auto_1fr]",
                hasChanges && "border-t",
              )}
            >
              <dt className="text-muted-foreground">Event ID</dt>
              <dd className="font-mono">{event.id}</dd>
              <dt className="text-muted-foreground">Timestamp</dt>
              <dd className="font-mono tabular-nums">{format(event.at, "yyyy-MM-dd HH:mm:ss")}</dd>
            </dl>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
