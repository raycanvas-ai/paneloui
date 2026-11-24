---
title: "shadcn Scheduler: Event Calendars vs Resource Timelines"
description: "shadcn/ui has no scheduler. Compare event calendars and resource timelines that fit a shadcn/ui app, with licences, paid features and a clash check in code."
slug: shadcn-scheduler-calendar
primaryKeyword: shadcn scheduler
secondaryKeywords:
  - shadcn calendar scheduler
  - shadcn event calendar
  - react resource timeline scheduler
  - react scheduler component open source
  - shadcn calendar drag and drop
intent: commercial
cluster: shadcn blocks
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [dashboard-pages-13]
  pro: [calendars-1, calendars-2]
wordCount: 2135
---

# shadcn Scheduler: Event Calendars vs Resource Timelines

shadcn/ui does not ship a scheduler. Its Calendar component is a date picker built on React DayPicker. For scheduling you add a separate component: an event calendar (month, week and day grids, like ReUI's free Event Calendar) or a resource timeline (people or rooms as rows, time across), which most libraries keep behind a paid tier.

> **Skip the build:** [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) is a free, MIT-licensed shadcn/ui block built as a resource timeline: caregivers as rows from 7 AM to 7 PM with a now line, live status and drive times, day and week views, and a New visit dialog that refuses a visit overlapping one the caregiver already has and names the clash. Add it with `npx shadcn@latest add @panelo/dashboard-pages-13` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Does shadcn/ui have a scheduler or event calendar?

No. The shadcn/ui [Calendar](https://ui.shadcn.com/docs/components/calendar) is a month grid for picking dates, and it is built on React DayPicker. There is no week view with time slots, no events, and no drag to reschedule.

That is a reasonable line for shadcn/ui to draw. A scheduler carries a lot of opinion: time zones, recurring events, overlapping events, drag and resize, and how a day is cut into rows. So the work falls to third-party registries and calendar libraries.

Before you pick one, decide which of two shapes you actually need.

## Event calendar or resource timeline: which do you need?

| | Event calendar | Resource timeline |
|---|---|---|
| Layout | Month grid, week and day columns with time running down | One row per resource (person, room, vehicle), time running across |
| Answers | "What is on my calendar this week?" | "Who is free at 2 PM, and who is double-booked?" |
| Typical apps | Personal and team calendars, bookings for one person | Dispatch boards, shift planning, room booking, field service |
| Hard parts | Overlapping events in one column, recurrence, all-day rows | Many rows, horizontal scroll, clash detection across a row |

Many products need both: a timeline for the coordinator and a calendar for each person. The libraries below differ most on which of the two they give away for free.

## Which scheduler components work with shadcn/ui?

All of these render in a React app next to shadcn/ui. Only the first installs through the shadcn CLI and uses Tailwind CSS classes you can edit. The rest bring their own CSS that you theme to match.

| Option | Licence | Event calendar | Resource timeline | Fits shadcn/ui how |
|---|---|---|---|---|
| [ReUI Event Calendar](https://reui.io/docs/event-calendar) | Free component; ReUI Pro blocks build on it | Month, week, day, N-day, agenda | Resource time grid (one column per resource) | `npx shadcn@latest add @reui/event-calendar`, Tailwind classes |
| [FullCalendar](https://fullcalendar.io/pricing) | Standard MIT; Premium from $480 (1–10 devs) | Yes, free | Timeline and vertical resource views are Premium | Own CSS, themed with variables |
| [Schedule-X](https://schedule-x.dev/premium) | MIT core; premium €479/year or €999 lifetime | Yes, free | Resource scheduler, drag and drop and resize are premium | Own CSS |
| [DayPilot Lite](https://javascript.daypilot.org/open-source/) | Apache-2.0, attribution required | Day, week, month | Yes: Scheduler with resources as rows and drag and drop | Own CSS |
| [MUI X Scheduler](https://mui.com/x/react-scheduler/) | Community MIT; Premium for timeline | Day, week, month with resources and drag | Event Timeline is Premium | Needs Material UI and Emotion; in beta |
| [Mantine Schedule](https://mantine.dev/schedule/getting-started) | MIT | Day, week, month, year, agenda | Resources day, week and month views | Needs `@mantine/core` and dayjs |
| [react-big-calendar](https://github.com/jquense/react-big-calendar) | MIT | Yes, with a drag-and-drop addon | Not a timeline layout | Own CSS, pick a date localizer |

A few things stand out.

**ReUI is the closest fit for a shadcn/ui codebase.** Its Event Calendar installs from the `@reui` registry with no licence key, uses Base UI primitives, date-fns and `@date-fns/tz`, and supports pointer drag, resize and drag-to-create. It does not save anything itself: changes arrive through `onEventUpdate`, which you accept, adjust or reject. ReUI sells ready-made Pro blocks built on the same component.

**Free resource timelines are rare.** FullCalendar, Schedule-X and MUI X all put the row-per-resource timeline in their paid tier. DayPilot Lite and Mantine Schedule are the open-source exceptions. DayPilot Lite is Apache-2.0 and asks for an attribution line ("This software includes DayPilot"). Mantine Schedule is MIT and shipped in Mantine 9, but it pulls in Mantine's component library and styling.

**MUI X Scheduler is new.** Its own docs say it is in beta, and its npm package needs `@mui/material` and Emotion as peers. That is a fine choice inside an MUI app and a heavy one inside a Tailwind CSS v4 app.

## How do you build a simple resource timeline with Tailwind CSS v4?

If you need a read-mostly board (who is where, today) rather than a full drag-and-drop editor, you can build it in about 60 lines. Times are minutes from midnight, and each visit is positioned by percentage along the day.

```tsx
type Visit = { id: string; resource: string; title: string; start: number; end: number }

const DAY_START = 7 * 60 // 7 AM
const DAY_END = 19 * 60 // 7 PM
const SPAN = DAY_END - DAY_START
const HOURS = Array.from({ length: SPAN / 60 }, (_, i) => DAY_START / 60 + i)

const at = (minutes: number) => `${((minutes - DAY_START) / SPAN) * 100}%`
const width = (v: Visit) => `${((v.end - v.start) / SPAN) * 100}%`
const clock = (m: number) =>
  new Date(Date.UTC(2026, 0, 1, 0, m)).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  })

export function Timeline({ resources, visits }: { resources: string[]; visits: Visit[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <div role="table" aria-label="Visits by time" className="min-w-[900px]">
        <div role="row" className="grid grid-cols-[10rem_1fr] border-b text-xs text-muted-foreground">
          <span role="columnheader" className="p-2">Caregiver</span>
          <div role="columnheader" className="relative h-8">
            {HOURS.map((h) => (
              <span key={h} className="absolute top-2 ps-1" style={{ left: at(h * 60) }}>
                {clock(h * 60)}
              </span>
            ))}
          </div>
        </div>
        {resources.map((name) => (
          <div role="row" key={name} className="grid grid-cols-[10rem_1fr] border-b last:border-b-0">
            <span role="rowheader" className="sticky start-0 bg-background p-3 text-sm font-medium">
              {name}
            </span>
            <div role="cell" className="relative h-14">
              {visits
                .filter((v) => v.resource === name)
                .map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-label={`${v.title}, ${clock(v.start)} to ${clock(v.end)}`}
                    className="absolute inset-y-2 truncate rounded-md bg-primary/10 px-2 text-start text-xs text-foreground ring-1 ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ left: at(v.start), width: width(v) }}
                  >
                    {v.title}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

The time axis uses physical `left` on purpose. A timeline is measured geometry, like a chart axis, so it should not flip in a right-to-left layout unless you mean it to. The name column uses `sticky start-0` so it stays visible while the board scrolls sideways on a phone.

Each visit is a real button with a full label ("Home visit, 9:00 AM to 10:30 AM"), so a keyboard or screen-reader user gets the same information a mouse user reads off the bar.

## How do you stop double-booking in a scheduler?

Every scheduler eventually needs a clash check. Two time ranges overlap when each starts before the other ends. That one comparison covers every case: partial overlap, one range inside another, and identical ranges. Ranges that only touch (one ends at 10:00, the next starts at 10:00) do not clash.

```ts
const overlaps = (a: { start: number; end: number }, b: { start: number; end: number }) =>
  a.start < b.end && b.start < a.end

export function findClash(visits: Visit[], draft: Visit) {
  return visits.find((v) => v.id !== draft.id && v.resource === draft.resource && overlaps(v, draft))
}

// Quick check
const booked: Visit[] = [{ id: "1", resource: "Ana", title: "Visit", start: 540, end: 600 }]
console.assert(findClash(booked, { id: "2", resource: "Ana", title: "x", start: 570, end: 630 }))
console.assert(!findClash(booked, { id: "3", resource: "Ana", title: "x", start: 600, end: 660 }))
```

Run it in the new-event form, not only on save, and show the clash in words: "Overlaps Margaret E. (9:00 to 10:00). Pick another time or caregiver." Then check again on the server, since two coordinators can book the same slot at once.

## Is there a free shadcn/ui resource timeline you can install?

Panelo UI's [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) is a free, MIT-licensed dashboard page built as a resource timeline. It shows caregivers as rows from 7 AM to 7 PM with a "now" line, visit cards with live status, drive time between visits, day and week views, a switch between caregivers and clients, area filters and search. Its New visit dialog runs the same overlap test as above and names the clashing visit.

It is a dispatch board, not a general calendar engine. It has no drag to reschedule, no recurrence and no time zone handling, and the data is a sample agency's Monday that you replace with your own. Install it into an existing shadcn/ui project:

```bash
npx shadcn@latest add @panelo/dashboard-pages-13
```

(Add `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries` in `components.json` first.)

## Which one should you choose?

- **A shadcn/ui app that needs a month or week calendar:** start with ReUI's Event Calendar. It installs the same way as your other components.
- **A resource timeline on a budget:** DayPilot Lite (Apache-2.0, attribution) or Mantine Schedule if you already use Mantine.
- **A read-mostly dispatch or shift board:** build the timeline above, or start from a free page like Home Care Schedule and edit it.
- **Heavy scheduling (recurrence, time zones, hundreds of resources):** pay for FullCalendar Premium, Schedule-X premium or MUI X Premium. These problems are hard, and those teams have spent years on them.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the board:

```bash
npx shadcn@latest add @panelo/dashboard-pages-13
```

The sample agency's caregivers and visits live in `components/panelo-ui/blocks/dashboard-pages/thirteen/data.ts`. Replace them with yours, and repeat the clash check on the server before saving.

- **See it live:** [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13).
- **Drag and resize, in Panelo Pro:** Panelo Pro has two calendars. [Time Tracking Calendar](https://www.paneloui.com/components/calendars-1) is a week of time entries: log them from a top bar, drag to move or resize, click or drag to add, with labels, favourites, search and a Customize panel that remembers your layout. [Issue Calendar](https://www.paneloui.com/components/calendars-2) shows issues by month and week, with multi-day spans, drag to reschedule or stretch, a category panel you can drag from, filters, search and a phone agenda. ReUI's free Event Calendar covers similar ground, so compare both before paying for either. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does shadcn/ui have a scheduler component?

No. shadcn/ui has a Calendar date picker built on React DayPicker, but no event calendar, week view with time slots or resource timeline. You add one from a third-party registry or a calendar library.

### What is the difference between an event calendar and a resource timeline?

An event calendar shows events on a month grid or in day columns with time running down. A resource timeline gives each person, room or vehicle its own row with time running across, which makes free slots and double-bookings easy to see.

### Is FullCalendar free for resource timelines?

No. FullCalendar's Standard version is MIT, but its Timeline and vertical resource views are Premium, with licences starting at $480 for 1 to 10 developers.

### Which open-source React schedulers include a resource timeline?

DayPilot Lite (Apache-2.0, with an attribution line) includes a Scheduler with resources as rows and drag and drop. Mantine Schedule (MIT) includes resource day, week and month views but needs Mantine's core library.

### How do I check two events for a clash?

Two ranges overlap when `a.start < b.end && b.start < a.end`. Run that against every event for the same resource, and repeat the check on the server before saving.

### Can an AI agent operate a scheduler page?

It can if the page exposes its controls to agents. Panelo UI components are built on Vercel's UI SDK (in beta), so an agent reads the page as named controls and acts through the same component API a click uses; see the [agent demo](https://www.paneloui.com/agent-demo).

---

Building the rest of the dashboard? See [shadcn KPI cards](/blog/shadcn-kpi-cards), or browse every free page and chart in the [Panelo UI catalogue](https://www.paneloui.com/components).

## Sources

- shadcn/ui Calendar (built on React DayPicker): https://ui.shadcn.com/docs/components/calendar
- ReUI Event Calendar docs: https://reui.io/docs/event-calendar
- FullCalendar pricing and premium features: https://fullcalendar.io/pricing
- Schedule-X premium features and prices: https://schedule-x.dev/premium
- DayPilot Lite open-source features and licence: https://javascript.daypilot.org/open-source/
- MUI X Scheduler (beta, Premium timeline): https://mui.com/x/react-scheduler/
- `@mui/x-scheduler` peer dependencies: https://www.npmjs.com/package/@mui/x-scheduler
- Mantine Schedule getting started: https://mantine.dev/schedule/getting-started
- Mantine 9.0.0 changelog: https://mantine.dev/changelog/9-0-0
- `@mantine/schedule` on npm (MIT): https://www.npmjs.com/package/@mantine/schedule
- react-big-calendar (MIT, drag-and-drop addon): https://github.com/jquense/react-big-calendar
