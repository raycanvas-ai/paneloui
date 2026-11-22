"use client";

import * as React from "react";

import { addDays, format, isToday, startOfWeek } from "date-fns";
import { Video } from "lucide-react";

import type { CalendarEvent } from "./calendar-data";
import { calendarEvents } from "./calendar-data";

// Reference geometry: 152.5px per hour, 141px gutter, 254px columns,
// 82px day header, 51px all-day row, cards inset 8px x / 7px y.
const HOUR = 152.5;
const START_HOUR = 8;
const END_HOUR = 20;
const GUTTER = "141px";
const CARD_SURFACE = "bg-background";

const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 1);

function AttendeeStack({ names, overflow }: { readonly names: string[]; readonly overflow?: number }) {
  return (
    <div className="mt-7 inline-flex w-fit items-center rounded-full bg-background p-[3px]">
      {names.map((name) => (
        <span
          key={name}
          title={name}
          className="-mr-2 flex size-6 items-center justify-center rounded-full bg-foreground/20 font-medium text-[11px] text-neutral-700 ring-2 ring-background"
        >
          {initials(name)}
        </span>
      ))}
      {overflow ? (
        <span className="ml-3.5 flex size-6 items-center justify-center rounded-full bg-foreground/10 text-[11px] text-muted-foreground">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

function EventCard({ event }: { readonly event: CalendarEvent }) {
  return (
    <div
      className={`absolute inset-x-2 flex flex-col overflow-hidden rounded-[12px] p-4 ${CARD_SURFACE}`}
      style={{ top: (event.start - START_HOUR) * HOUR + 7, height: (event.end - event.start) * HOUR - 14 }}
    >
      <span className="text-[20px] leading-none">{event.emoji}</span>
      <p className="mt-[18px] max-w-[152px] text-[15px] leading-[20px]">{event.title}</p>
      <p className="mt-3 text-[10px] text-muted-foreground">{event.time}</p>
      {event.attendees ? <AttendeeStack names={event.attendees} overflow={event.overflow} /> : null}
      {event.cta ? (
        <button
          type="button"
          className="mt-auto flex h-[30px] w-full items-center justify-center gap-1.5 rounded-[8px] text-[11px] text-white"
          style={{ backgroundColor: event.cta.color }}
        >
          <Video className="size-3.5" />
          {event.cta.label}
        </button>
      ) : null}
    </div>
  );
}

export function WeekGrid() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const days = React.useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 4 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        key: i,
        number: format(date, "d"),
        weekday: format(date, "EEE").toUpperCase(),
        today: isToday(date),
        events: calendarEvents.filter((event) => event.day === i),
      };
    });
  }, []);

  // Opens just below the 8 AM line, matching the reference crop.
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: HOUR * 0.167 });
  }, []);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border bg-card">
      <div className="flex h-[82px] shrink-0 border-b">
        <div className="flex shrink-0 items-center justify-center" style={{ width: GUTTER }}>
          <span className="rounded-full border bg-background px-4 py-1.5 text-[15px] text-muted-foreground">
            UCT +2
          </span>
        </div>
        {days.map((day) => (
          <div key={day.key} className="relative flex flex-1 flex-col items-center justify-center gap-2 border-l">
            <span className="font-normal text-[28px] leading-none tracking-[-0.01em]">{day.number}</span>
            <span className="text-[14px] text-muted-foreground leading-none">{day.weekday}</span>
            {day.today && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-foreground" />}
          </div>
        ))}
      </div>

      <div className="flex h-[51px] shrink-0 border-b">
        <div className="flex shrink-0 items-center justify-center text-[20px]" style={{ width: GUTTER }}>
          All day
        </div>
        {days.map((day) => (
          <div key={day.key} className="flex-1 border-l" />
        ))}
      </div>

      <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: (END_HOUR - START_HOUR) * HOUR }}>
          {hours.map((hour, index) =>
            index === 0 ? null : (
              <div
                key={hour}
                className="pointer-events-none absolute inset-x-0 border-t"
                style={{ top: index * HOUR }}
              />
            ),
          )}
          <div className="relative shrink-0" style={{ width: GUTTER }}>
            {hours.map((hour, index) =>
              index === 0 ? null : (
                <span
                  key={hour}
                  className="absolute left-5 -translate-y-1/2 text-[16px] text-muted-foreground"
                  style={{ top: index * HOUR }}
                >
                  {format(new Date(2024, 0, 1, hour), "h a")}
                </span>
              ),
            )}
          </div>
          {days.map((day) => (
            <div key={day.key} className="relative min-w-0 flex-1 border-l">
              {day.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
