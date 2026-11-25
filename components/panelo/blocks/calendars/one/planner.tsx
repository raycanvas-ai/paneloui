'use client'

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
    Bell,
    Bin,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Link,
    MapPin,
    MoreHorizontal,
    Palette,
    PanelLeft,
    Plus,
    Settings,
    SlidersHorizontal,
    SquarePen,
    TextAlignStart,
    Users,
    Video,
    X,
} from '@keyline-icons/react'

import { Checkbox } from '@/components/panelo/ui/checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { Input } from '@/components/panelo/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/panelo/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/panelo/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/panelo/ui/tooltip'
import { cn } from '@/components/panelo/lib/utils'

import * as sample from './data'
import type { CalendarEvent, Person, Reply, Todo, TodoGroup, Tone } from './data'

/* -------------------------------------------------------------------------- */
/*  Planner calendar: Day, Week and Month views beside a to-do sidebar.        */
/*  - Page with the arrows or Today; jump anywhere from the month picker.     */
/*  - Click an event for its card (members, join link, place, reminder,      */
/*    notes, your reply); click an empty slot to add one.                     */
/*  - A live line marks now; a card counts down to the next event.            */
/*  - Settings: week start, weekends, 24-hour time.                           */
/*  Every list is a prop; the sidebar folds into a drawer on small screens.   */
/* -------------------------------------------------------------------------- */

export type View = 'day' | 'week' | 'month'
type Settings = { mondayFirst: boolean; weekends: boolean; hour24: boolean }

export type PlannerProps = {
    defaultEvents?: CalendarEvent[]
    events?: CalendarEvent[]
    onEventsChange?: (events: CalendarEvent[]) => void
    people?: Person[]
    todoGroups?: TodoGroup[]
    defaultTodos?: Todo[]
    defaultView?: View
    /** Pin "now" (tests, screenshots). Otherwise the real clock, read after mount. */
    now?: Date
    /** Hour the day and week views open at. */
    startHour?: number
    /** Height of one hour in px. */
    hourHeight?: number
    /** Show the to-do sidebar (a drawer on narrow screens). */
    sidebar?: boolean
    onShare?: () => void
    onJoin?: (event: CalendarEvent) => void
    className?: string
}

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
const GUTTER = 69
// The server renders this week; the browser swaps in the real one after mount, so hydration always matches.
const SERVER_NOW = new Date(2026, 10, 24, 13, 0)

/** A theme tone as a CSS colour; `pink` mixes violet and red, `neutral` follows the text colour. */
export const tone = (t: Tone) =>
    t === 'neutral' ? 'color-mix(in oklch, var(--foreground) 35%, var(--card))' : t === 'pink' ? 'color-mix(in oklch, var(--tone-violet-solid) 35%, var(--destructive))' : `var(--tone-${t}-solid)`
const tint = (t: Tone, amount = 16) => `color-mix(in oklch, ${tone(t)} ${t === 'neutral' ? amount * 0.6 : amount}%, var(--card))`

/* ------------------------------- Date helpers ------------------------------- */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const startOfWeek = (d: Date, mondayFirst: boolean) => addDays(startOfDay(d), -((d.getDay() + (mondayFirst ? 6 : 0)) % 7))
const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes()
function isoWeek(d: Date) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
    return Math.ceil(((+t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)
}
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString('en-US', o)
const time = (d: Date, hour24: boolean) =>
    hour24 ? fmt(d, { hour: '2-digit', minute: '2-digit', hour12: false }) : fmt(d, { hour: 'numeric', minute: '2-digit' }).replace(' ', '')
/**
 * A time range the way people read it. Compact (event blocks) shares the meridiem and drops ":00":
 * "10 – 11:30 AM", "11 AM – 1 PM". Full (the card) spells both ends: "10:00 AM – 11:30 AM".
 */
function timeRange(start: Date, end: Date, hour24: boolean, compact = false) {
    if (hour24) return `${time(start, true)} – ${time(end, true)}`
    if (!compact) return `${fmt(start, { hour: 'numeric', minute: '2-digit' })} – ${fmt(end, { hour: 'numeric', minute: '2-digit' })}`
    const part = (d: Date) => fmt(d, d.getMinutes() ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' })
    const a = part(start)
    const b = part(end)
    const sameHalf = start.getHours() < 12 === end.getHours() < 12
    return sameHalf ? `${a.replace(/ [AP]M$/, '')} – ${b}` : `${a} – ${b}`
}
/** "30 min", "1 hr", "1 hr 30 min". */
function duration(start: Date, end: Date) {
    const m = Math.round((+end - +start) / 60_000)
    const h = Math.floor(m / 60)
    return [h ? `${h} hr` : '', m % 60 ? `${m % 60} min` : ''].filter(Boolean).join(' ')
}
const hourLabel = (h: number, hour24: boolean) => (hour24 ? `${String(h).padStart(2, '0')}:00` : h === 12 ? 'Noon' : `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`)

/** Side-by-side lanes for overlapping events in one day: each gets a lane and the count it shares. */
function lanes(events: CalendarEvent[]) {
    const sorted = [...events].sort((a, b) => +a.start - +b.start || +b.end - +a.end)
    const out = new Map<string, { lane: number; of: number }>()
    let cluster: CalendarEvent[] = []
    let clusterEnd = 0
    const flush = () => {
        const ends: number[] = []
        const placed = cluster.map((e) => {
            let lane = ends.findIndex((end) => end <= +e.start)
            if (lane < 0) lane = ends.length
            ends[lane] = +e.end
            return [e.id, lane] as const
        })
        for (const [id, lane] of placed) out.set(id, { lane, of: ends.length })
        cluster = []
    }
    for (const e of sorted) {
        if (cluster.length && +e.start >= clusterEnd) flush()
        cluster.push(e)
        clusterEnd = Math.max(clusterEnd, +e.end)
    }
    if (cluster.length) flush()
    return out
}

/** Controlled when `value` is given, otherwise keeps its own state; either way `onChange` hears about it. */
function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
    const [own, setOwn] = useState(initial)
    const current = value ?? own
    const set = (next: T) => {
        if (value === undefined) setOwn(next)
        onChange?.(next)
    }
    return [current, set] as const
}

/* --------------------------------- Planner --------------------------------- */

export function Planner({
    defaultEvents,
    events: eventsProp,
    onEventsChange,
    people = sample.people,
    todoGroups = sample.todoGroups,
    defaultTodos = sample.todos,
    defaultView = 'week',
    now: nowProp,
    startHour = 8,
    hourHeight = 71,
    sidebar = true,
    onShare,
    onJoin,
    className,
}: PlannerProps) {
    const [clock, setClock] = useState<Date>(nowProp ?? SERVER_NOW)
    const [live, setLive] = useState(Boolean(nowProp))
    const now = nowProp ?? clock
    const [events, setEvents] = useControllable(eventsProp, defaultEvents ?? sample.sampleEvents(nowProp ?? SERVER_NOW), onEventsChange)
    const [view, setView] = useState<View>(defaultView)
    const [focus, setFocus] = useState<Date>(startOfDay(now))
    const [settings, setSettings] = useState<Settings>({ mondayFirst: true, weekends: true, hour24: false })
    const [selected, setSelected] = useState<string | null>(null)
    const [editing, setEditing] = useState<string | null>(null)
    // A new event that hasn't been saved yet: it shows in the grid while its editor is open, and goes if cancelled.
    const [draft, setDraft] = useState<string | null>(null)
    const [dismissed, setDismissed] = useState<string[]>([])
    const [drawer, setDrawer] = useState(false)
    const scroller = useRef<HTMLDivElement>(null)
    const root = useRef<HTMLDivElement>(null)
    // Wide enough (1024px, the @5xl container size) for the sidebar to sit beside the calendar instead of a drawer.
    const [wide, setWide] = useState(true)
    useEffect(() => {
        const el = root.current
        if (!el) return
        const observer = new ResizeObserver(() => setWide(el.clientWidth >= 1024))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // The real clock, after mount (see SERVER_NOW); sample events move with it so the demo week is always this week.
    useEffect(() => {
        if (nowProp) return
        const real = new Date()
        setClock(real)
        setFocus(startOfDay(real))
        if (!defaultEvents && eventsProp === undefined) setEvents(sample.sampleEvents(real))
        setLive(true)
        const timer = setInterval(() => setClock(new Date()), 30_000)
        return () => clearInterval(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nowProp])

    // Open the day at `startHour`, and again whenever the view changes.
    useEffect(() => {
        if (scroller.current && view !== 'month') scroller.current.scrollTop = startHour * hourHeight
    }, [view, startHour, hourHeight])

    const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
    const weekStart = startOfWeek(focus, settings.mondayFirst)
    const days = view === 'day' ? [focus] : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).filter((d) => settings.weekends || (d.getDay() !== 0 && d.getDay() !== 6))
    const title = fmt(focus, { month: 'short', year: 'numeric' })

    const page = (dir: -1 | 1) => setFocus(view === 'month' ? new Date(focus.getFullYear(), focus.getMonth() + dir, 1) : addDays(focus, view === 'day' ? dir : dir * 7))
    const updateEvent = (id: string, patch: Partial<CalendarEvent>) => setEvents(events.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    const removeEvent = (id: string) => {
        setEvents(events.filter((e) => e.id !== id))
        setSelected(null)
        setEditing(null)
        setDraft(null)
    }
    const saveEvent = (id: string, patch: Partial<CalendarEvent>) => {
        setEvents(events.map((e) => (e.id === id ? { ...e, ...patch } : e)))
        setEditing(null)
        setDraft(null)
        // A saved event that moved to another week takes the view with it.
        if (patch.start && !days.some((d) => sameDay(d, patch.start!))) setFocus(startOfDay(patch.start))
    }
    const createAt = (day: Date, minutes: number) => {
        if (draft) setEvents(events.filter((e) => e.id !== draft))
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes)
        const e: CalendarEvent = { id: `new-${Date.now()}`, title: '', start, end: new Date(+start + 60 * 60_000), tone: 'blue', members: [] }
        setEvents([...events.filter((x) => x.id !== draft), e])
        setSelected(e.id)
        setEditing(e.id)
        setDraft(e.id)
    }
    const openEvent = (e: CalendarEvent) => {
        if (view === 'month' || !days.some((d) => sameDay(d, e.start))) setFocus(startOfDay(e.start))
        setSelected(e.id)
        setDrawer(false)
    }
    const closeCard = () => {
        // Closing an unsaved new event discards it; closing an edit discards the edit (it lives in the editor).
        if (draft) setEvents(events.filter((x) => x.id !== draft))
        setSelected(null)
        setEditing(null)
        setDraft(null)
    }

    // The next thing on: running now, or starting within the hour.
    const upcoming = live
        ? events
              .filter((e) => !dismissed.includes(e.id) && +e.end > +now && +e.start - +now <= 60 * 60_000 && e.title)
              .sort((a, b) => +a.start - +b.start)[0]
        : undefined
    const left = upcoming ? Math.max(1, Math.round(((+upcoming.start > +now ? +upcoming.start : +upcoming.end) - +now) / 60_000)) : 0

    const ctx: Ctx = { now, live, settings, peopleById, selected, editing, draft, hourHeight, openEvent, closeCard, updateEvent, saveEvent, removeEvent, setEditing, onJoin }

    return (
        <div ref={root} className={cn('@container relative flex h-full min-h-0 overflow-hidden bg-card font-sans text-foreground', className)}>
            {/* ------------------------------ Sidebar ------------------------------ */}
            {sidebar ? (
                <>
                    {drawer ? <button type="button" aria-label="Close sidebar" onClick={() => setDrawer(false)} className="absolute inset-0 z-30 cursor-default bg-foreground/20 @5xl:hidden" /> : null}
                    <Sidebar
                        className={cn(
                            'absolute inset-y-0 start-0 z-40 w-[293px] max-w-[85%] shadow-[0_24px_48px_-12px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-out motion-reduce:transition-none @5xl:static @5xl:z-auto @5xl:max-w-none @5xl:translate-x-0 @5xl:shadow-none',
                            drawer ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
                        )}
                        hidden={!wide && !drawer}
                        groups={todoGroups}
                        defaultTodos={defaultTodos}
                        events={events}
                        now={now}
                        live={live}
                        settings={settings}
                        weekStart={weekStart}
                        onOpen={openEvent}
                        onClose={() => setDrawer(false)}
                        soon={Boolean(upcoming)}
                    />
                </>
            ) : null}

            {/* ------------------------------ Main ------------------------------ */}
            <div className="flex min-w-0 flex-1 flex-col border-s border-border/80 bg-card">
                <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 @3xl:h-20 @3xl:flex-nowrap @3xl:ps-[26px] @3xl:pe-[26px] @3xl:pt-0 @3xl:pb-2">
                    {sidebar ? (
                        <button type="button" aria-label="Open sidebar" aria-expanded={drawer} onClick={() => setDrawer(true)} className={cn(iconButton, '@5xl:hidden', focusRing)}>
                            <PanelLeft className="size-4" aria-hidden />
                        </button>
                    ) : null}
                    <MonthPicker focus={focus} now={now} mondayFirst={settings.mondayFirst} onPick={(d) => setFocus(d)}>
                        <span className="text-[18.5px] leading-6 font-semibold tracking-[-0.01em]">{title}</span>
                        {view !== 'month' ? <span className="text-[18.5px] leading-6 font-medium text-foreground/40">/ W{isoWeek(days[0] ?? focus)}</span> : null}
                        <ChevronDown className="size-3.5 text-foreground/45" aria-hidden />
                    </MonthPicker>

                    <div role="radiogroup" aria-label="View" className="order-last flex h-8 w-full items-center rounded-[9px] bg-muted p-[3px] @3xl:order-none @3xl:ms-auto @3xl:w-[254px]">
                        {(['day', 'week', 'month'] as View[]).map((v) => (
                            <button
                                key={v}
                                type="button"
                                role="radio"
                                aria-checked={view === v}
                                onClick={() => setView(v)}
                                className={cn('h-full flex-1 cursor-pointer rounded-[7px] text-[13px] leading-4 font-medium capitalize text-foreground/50 transition-colors hover:text-foreground/80', view === v && 'bg-card text-foreground/85 shadow-[0_1px_2px_rgb(0_0_0/0.08)]', focusRing)}>
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="ms-auto flex items-center gap-1.5 @3xl:ms-[42px]">
                        <button type="button" aria-label={`Go to previous ${view}`} onClick={() => page(-1)} className={cn(iconButton, focusRing)}>
                            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
                        </button>
                        <button type="button" aria-label={`Go to next ${view}`} onClick={() => page(1)} className={cn(iconButton, focusRing)}>
                            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
                        </button>
                        <button type="button" onClick={() => setFocus(startOfDay(now))} className={cn('ms-1.5 h-[30px] cursor-pointer rounded-[8px] bg-muted px-3.5 text-[14px] leading-5 font-medium text-foreground/75 transition-colors hover:bg-foreground/[0.08]', focusRing)}>
                            Today
                        </button>
                        <span aria-hidden className="mx-2.5 hidden h-5 w-px bg-border @xl:block" />
                        <button type="button" onClick={() => (onShare ? onShare() : void navigator.clipboard?.writeText(window.location.href))} className={cn('hidden h-[30px] cursor-pointer rounded-[8px] border border-border/90 px-3.5 text-[14px] leading-5 font-medium text-foreground/75 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-muted/60 @xl:block', focusRing)}>
                            Share
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger aria-label="Calendar settings" className={cn(iconButton, 'ms-2 aria-expanded:bg-foreground/[0.06]', focusRing)}>
                                <Settings className="size-[17px]" aria-hidden />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuCheckboxItem checked={settings.mondayFirst} onCheckedChange={(v) => setSettings({ ...settings, mondayFirst: v })}>
                                    Start week on Monday
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={settings.weekends} onCheckedChange={(v) => setSettings({ ...settings, weekends: v })}>
                                    Show weekends
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem checked={settings.hour24} onCheckedChange={(v) => setSettings({ ...settings, hour24: v })}>
                                    24-hour time
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {view === 'month' ? (
                    <MonthGrid focus={focus} ctx={ctx} events={events} onDay={(d) => (setFocus(d), setView('day'))} />
                ) : (
                    <div ref={scroller} className="relative min-h-0 flex-1 overflow-auto [scrollbar-width:thin]">
                        <div style={{ minWidth: GUTTER + days.length * (view === 'day' ? 240 : 104) }}>
                            {/* Day headers: sticky, and in the same scroller so columns stay aligned sideways. */}
                            <div className="sticky top-0 z-20 flex h-[47px] border-b border-border/80 bg-card">
                                <div className="sticky start-0 z-10 shrink-0 bg-card" style={{ width: GUTTER }} />
                                {days.map((d) => {
                                    const isToday = sameDay(d, now) && live
                                    return (
                                        <button
                                            key={+d}
                                            type="button"
                                            onClick={() => (setFocus(d), setView('day'))}
                                            aria-label={`${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${isToday ? ', today' : ''}: open day`}
                                            className={cn('flex min-w-0 flex-1 cursor-pointer items-center justify-center pt-3 text-[12px] leading-4 font-semibold tracking-[0.04em] uppercase text-foreground/70 hover:text-foreground', isToday && 'text-destructive hover:text-destructive', focusRing)}>
                                            {fmt(d, { weekday: 'short' })} {String(d.getDate()).padStart(2, '0')}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="relative flex" style={{ height: 24 * hourHeight }}>
                                <div aria-hidden className="sticky start-0 z-10 shrink-0 bg-card" style={{ width: GUTTER }}>
                                    {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                                        <span
                                            key={h}
                                            className={cn('absolute end-[15px] -translate-y-1/2 text-[12px] leading-4 whitespace-nowrap text-foreground/40', live && h === now.getHours() && days.some((d) => sameDay(d, now)) && 'text-destructive')}
                                            style={{ top: h * hourHeight }}>
                                            {hourLabel(h, settings.hour24)}
                                        </span>
                                    ))}
                                </div>
                                {days.map((d) => (
                                    <DayColumn key={+d} day={d} events={events.filter((e) => sameDay(e.start, d))} ctx={ctx} onCreate={createAt} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ------------------------------ Next up ------------------------------ */}
                {upcoming ? (
                    // Week and day: over the header's empty corner. Month has no empty corner, so the foot.
                    <div
                        className={cn(
                            'absolute inset-x-4 bottom-4 z-20 flex items-center gap-3.5 rounded-[14px] bg-card p-[15px] pe-3 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.18),0_0_0_1px_color-mix(in_oklch,var(--border)_70%,transparent)] @5xl:inset-x-auto @5xl:end-[26px] @5xl:w-[367px]',
                            view !== 'month' && '@5xl:top-[100px] @5xl:bottom-auto',
                        )}>
                        <span className="grid size-[37px] shrink-0 place-items-center rounded-full text-white" style={{ background: 'color-mix(in oklch, var(--tone-cyan-solid) 80%, var(--tone-green-solid))' }}>
                            <Video className="size-[17px]" aria-hidden />
                        </span>
                        <button type="button" onClick={() => openEvent(upcoming)} className={cn('min-w-0 flex-1 cursor-pointer rounded-[6px] text-start', focusRing)}>
                            <span className="block truncate text-[14px] leading-[18px] font-semibold">{upcoming.title}</span>
                            <span className="block text-[13px] leading-[18px] text-foreground/50" aria-live="polite">
                                {+upcoming.start > +now ? `Starts in ${left} minute${left === 1 ? '' : 's'}` : `${left} minute${left === 1 ? '' : 's'} left`}
                            </span>
                        </button>
                        {upcoming.members?.length ? <Avatars ids={upcoming.members} peopleById={peopleById} size={22} /> : null}
                        <button type="button" aria-label="Dismiss" onClick={() => setDismissed([...dismissed, upcoming.id])} className={cn(iconButton, 'size-6', focusRing)}>
                            <X className="size-3.5" aria-hidden />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

/* ---------------------------------- Shared ---------------------------------- */

type Ctx = {
    now: Date
    live: boolean
    settings: Settings
    peopleById: Map<string, Person>
    selected: string | null
    editing: string | null
    draft: string | null
    hourHeight: number
    openEvent: (e: CalendarEvent) => void
    closeCard: () => void
    updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
    saveEvent: (id: string, patch: Partial<CalendarEvent>) => void
    removeEvent: (id: string) => void
    setEditing: (id: string | null) => void
    onJoin?: (e: CalendarEvent) => void
}

const iconButton = 'grid size-8 shrink-0 cursor-pointer place-items-center rounded-[8px] text-foreground/55 transition-colors hover:bg-foreground/[0.05] hover:text-foreground'

function Avatars({ ids, peopleById, size = 24 }: { ids: string[]; peopleById: Map<string, Person>; size?: number }) {
    return (
        <span className="flex -space-x-1.5" aria-label={ids.map((id) => peopleById.get(id)?.name).filter(Boolean).join(', ')}>
            {ids.slice(0, 4).map((id) => {
                const p = peopleById.get(id)
                if (!p) return null
                return (
                    <span key={id} title={p.name} className="grid shrink-0 place-items-center rounded-full font-semibold text-foreground/80 ring-2 ring-card" style={{ width: size, height: size, fontSize: size * 0.4, background: tint(p.tone, 45) }}>
                        {p.initials}
                    </span>
                )
            })}
        </span>
    )
}

/* -------------------------------- Day column -------------------------------- */

function DayColumn({ day, events, ctx, onCreate }: { day: Date; events: CalendarEvent[]; ctx: Ctx; onCreate: (day: Date, minutes: number) => void }) {
    const placed = lanes(events)
    const isToday = ctx.live && sameDay(day, ctx.now)
    return (
        <div
            role="presentation"
            onClick={(e) => {
                // A click on the column itself, not an event, adds one at the half hour.
                if (e.target !== e.currentTarget) return
                const y = e.nativeEvent.offsetY
                onCreate(day, Math.floor(((y / ctx.hourHeight) * 60) / 30) * 30)
            }}
            className="relative min-w-0 flex-1 cursor-cell border-s border-border/80"
            style={{ backgroundImage: 'linear-gradient(to bottom, color-mix(in oklch, var(--border) 80%, transparent) 1px, transparent 1px)', backgroundSize: `100% ${ctx.hourHeight}px` }}>
            {events.map((e) => {
                const lane = placed.get(e.id) ?? { lane: 0, of: 1 }
                const top = (minutesOf(e.start) / 60) * ctx.hourHeight + 2
                const height = Math.max(22, ((+e.end - +e.start) / 3_600_000) * ctx.hourHeight - 4)
                return (
                    <EventCard key={e.id} event={e} ctx={ctx}>
                        <EventBlock
                            event={e}
                            ctx={ctx}
                            style={{ top, height, insetInlineStart: `calc(${(lane.lane / lane.of) * 100}% + 4px)`, width: `calc(${100 / lane.of}% - 8px)` }}
                        />
                    </EventCard>
                )
            })}
            {isToday ? (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 h-[2px] bg-destructive/70" style={{ top: (minutesOf(ctx.now) / 60) * ctx.hourHeight - 1 }}>
                    <span className="absolute -start-px -top-[5px] h-3 w-[2px] rounded-full bg-destructive" />
                </div>
            ) : null}
        </div>
    )
}

function EventBlock({ event: e, ctx, style }: { event: CalendarEvent; ctx: Ctx; style: CSSProperties }) {
    const open = ctx.selected === e.id
    const minutes = (+e.end - +e.start) / 60_000
    const solidText = e.tone === 'yellow' ? 'text-foreground' : 'text-white'
    return (
        <PopoverTrigger
            aria-label={`${e.title || 'New event'}, ${fmt(e.start, { weekday: 'long' })} ${timeRange(e.start, e.end, ctx.settings.hour24)}`}
            className={cn('absolute flex cursor-pointer flex-col overflow-hidden rounded-[5px] ps-[6px] pe-[3px] text-start transition-[background-color,box-shadow]', minutes >= 40 ? 'pt-[9px]' : 'justify-center', open && solidText, focusRing)}
            // Selected: the tone deepened a little, so white text keeps its contrast on light tones like cyan.
            style={{ ...style, background: open ? (e.tone === 'yellow' ? tone(e.tone) : `color-mix(in oklch, ${tone(e.tone)} 82%, black)`) : tint(e.tone) }}>
            <span className={cn('flex min-w-0 items-start gap-1 text-[13px] leading-[17px] font-semibold', open ? '' : 'text-foreground/85', minutes >= 75 ? 'line-clamp-2' : 'truncate')}>
                {e.emoji ? <span aria-hidden className="shrink-0 text-[11px] leading-[17px]">{e.emoji}</span> : null}
                <span className={minutes >= 75 ? 'line-clamp-2' : 'truncate'}>{e.title || 'New event'}</span>
            </span>
            {minutes >= 40 ? (
                <span className={cn('mt-[3px] truncate text-[12.5px] leading-4', open ? 'opacity-85' : 'text-foreground/55')}>{timeRange(e.start, e.end, ctx.settings.hour24, true)}</span>
            ) : null}
        </PopoverTrigger>
    )
}

/* -------------------------------- Event card -------------------------------- */

/** The event's popover: details to read, or the editor for a new or edited event. */
function EventCard({ event: e, ctx, children }: { event: CalendarEvent; ctx: Ctx; children: ReactNode }) {
    const open = ctx.selected === e.id
    return (
        <Popover open={open} onOpenChange={(next) => (next ? ctx.openEvent(e) : ctx.closeCard())}>
            {children}
            <PopoverContent
                side="right"
                align="start"
                sideOffset={10}
                collisionPadding={12}
                className="w-[352px] max-w-[calc(100vw-24px)] gap-0 overflow-hidden rounded-[14px] border border-border/80 p-0 shadow-[0_1px_2px_rgb(0_0_0/0.05),0_18px_44px_-12px_rgb(0_0_0/0.25)]">
                {ctx.editing === e.id ? <EventEditor key={`edit-${e.id}`} event={e} ctx={ctx} /> : <EventDetails event={e} ctx={ctx} />}
            </PopoverContent>
        </Popover>
    )
}

function CardAction({ label, icon: Icon, onClick }: { label: string; icon: typeof X; onClick: () => void }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button type="button" aria-label={label} onClick={onClick} className={cn(iconButton, 'size-7 rounded-[7px] text-foreground/50', focusRing)}>
                    <Icon className="size-4" aria-hidden />
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
    )
}

function Detail({ icon: Icon, children }: { icon: typeof X; children: ReactNode }) {
    return (
        <li className="flex items-start gap-3 text-[13.5px] leading-5 text-foreground/80">
            <Icon className="mt-0.5 size-4 shrink-0 text-foreground/45" aria-hidden />
            <div className="min-w-0 flex-1">{children}</div>
        </li>
    )
}

const REPLIES: { id: Reply; label: string }[] = [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
    { id: 'maybe', label: 'Maybe' },
]

function EventDetails({ event: e, ctx }: { event: CalendarEvent; ctx: Ctx }) {
    const h24 = ctx.settings.hour24
    const members = e.members ?? []
    // The organiser (first member) is going; everyone else has replied or not yet.
    const replyOf = (id: string, i: number): Reply | undefined => (i === 0 ? 'yes' : e.replies?.[id])
    const tally = members.reduce((n, id, i) => {
        const r = replyOf(id, i) ?? 'awaiting'
        n[r] = (n[r] ?? 0) + 1
        return n
    }, {} as Record<string, number>)
    const summary = (['yes', 'maybe', 'no', 'awaiting'] as const)
        .filter((k) => tally[k])
        .map((k) => `${tally[k]} ${k}`)
        .join(', ')
    const [copied, setCopied] = useState(false)
    const [more, setMore] = useState(false)
    const long = (e.description?.length ?? 0) > 150

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-end gap-0.5 px-2 pt-2">
                <CardAction label="Edit event" icon={SquarePen} onClick={() => ctx.setEditing(e.id)} />
                <CardAction label="Delete event" icon={Bin} onClick={() => ctx.removeEvent(e.id)} />
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <CardAction label="Close" icon={X} onClick={ctx.closeCard} />
            </div>

            <div className="flex flex-col gap-4 px-4 pt-0.5 pb-4">
                <div className="flex gap-3">
                    <span aria-hidden className="mt-[6px] size-3 shrink-0 rounded-[4px]" style={{ background: tone(e.tone) }} />
                    <div className="min-w-0">
                        <h3 className="text-[17px] leading-6 font-semibold tracking-[-0.01em] text-pretty">{e.title}</h3>
                        <p className="mt-1 text-[13.5px] leading-5 text-foreground/65">{fmt(e.start, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p className="text-[13.5px] leading-5 text-foreground/65 tabular-nums">
                            {timeRange(e.start, e.end, h24)}
                            <span aria-hidden className="mx-1.5 text-foreground/30">·</span>
                            {duration(e.start, e.end)}
                        </p>
                    </div>
                </div>

                {e.meeting ? (
                    <div className="flex items-center gap-1.5 ps-6">
                        <button
                            type="button"
                            onClick={() => (ctx.onJoin ? ctx.onJoin(e) : window.open(e.meeting, '_blank', 'noopener'))}
                            className={cn('flex h-8 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-tone-blue-solid text-[13.5px] font-medium text-white shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-[filter] hover:brightness-95', focusRing)}>
                            <Video className="size-4" aria-hidden />
                            Join meeting
                        </button>
                        <CardAction
                            label={copied ? 'Link copied' : 'Copy meeting link'}
                            icon={copied ? Check : Link}
                            onClick={() => {
                                void navigator.clipboard?.writeText(e.meeting!)
                                setCopied(true)
                                setTimeout(() => setCopied(false), 1500)
                            }}
                        />
                    </div>
                ) : null}

                {e.location || members.length || e.reminder || e.description ? (
                    <ul className="flex flex-col gap-3.5">
                        {e.location ? <Detail icon={MapPin}>{e.location}</Detail> : null}
                        {members.length ? (
                            <Detail icon={Users}>
                                <p className="font-medium text-foreground/85">
                                    {members.length} guest{members.length === 1 ? '' : 's'}
                                </p>
                                <p className="text-[12.5px] text-foreground/50">{summary}</p>
                                <ul className="mt-2 flex flex-col gap-2">
                                    {members.map((id, i) => {
                                        const p = ctx.peopleById.get(id)
                                        if (!p) return null
                                        const r = replyOf(id, i)
                                        return (
                                            <li key={id} className="flex items-center gap-2.5">
                                                <span className="grid size-6 shrink-0 place-items-center rounded-full text-[9.5px] font-semibold text-foreground/80" style={{ background: tint(p.tone, 45) }}>
                                                    {p.initials}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-foreground/80">
                                                    {p.name}
                                                    {i === 0 ? <span className="ms-1.5 text-[12px] text-foreground/45">Organizer</span> : null}
                                                </span>
                                                <span className={cn('flex shrink-0 items-center gap-1 text-[12px]', r === 'yes' ? 'text-tone-green-solid' : r === 'no' ? 'text-destructive' : 'text-foreground/45')}>
                                                    {r === 'yes' ? <Check className="size-3" aria-hidden /> : null}
                                                    {r === 'yes' ? 'Going' : r === 'no' ? 'Declined' : r === 'maybe' ? 'Maybe' : 'Awaiting'}
                                                </span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Detail>
                        ) : null}
                        {e.reminder ? (
                            <Detail icon={Bell}>
                                {e.reminder} minutes before
                            </Detail>
                        ) : null}
                        {e.description ? (
                            <Detail icon={TextAlignStart}>
                                <p className={cn('text-pretty text-foreground/75', long && !more && 'line-clamp-3')}>{e.description}</p>
                                {long ? (
                                    <button type="button" onClick={() => setMore(!more)} className={cn('mt-1 cursor-pointer rounded-sm text-[12.5px] font-medium text-foreground/60 hover:text-foreground', focusRing)}>
                                        {more ? 'Show less' : 'Show more'}
                                    </button>
                                ) : null}
                            </Detail>
                        ) : null}
                    </ul>
                ) : null}
            </div>

            <div className="flex items-center gap-3 border-t border-border/80 bg-muted/40 px-4 py-2.5">
                <span id={`going-${e.id}`} className="text-[13.5px] font-medium text-foreground/70">
                    Going?
                </span>
                <div role="radiogroup" aria-labelledby={`going-${e.id}`} className="ms-auto flex rounded-[9px] bg-foreground/[0.06] p-0.5">
                    {REPLIES.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            role="radio"
                            aria-checked={e.rsvp === r.id}
                            onClick={() => ctx.updateEvent(e.id, { rsvp: e.rsvp === r.id ? undefined : r.id })}
                            className={cn(
                                'h-7 cursor-pointer rounded-[7px] px-3.5 text-[13px] leading-4 font-medium text-foreground/55 transition-colors hover:text-foreground',
                                'aria-checked:bg-card aria-checked:text-foreground aria-checked:shadow-[0_1px_2px_rgb(0_0_0/0.1),0_0_0_0.5px_rgb(0_0_0/0.06)]',
                                focusRing,
                            )}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const SWATCHES: Tone[] = ['blue', 'cyan', 'green', 'yellow', 'orange', 'pink', 'violet', 'neutral']
const pad = (n: number) => String(n).padStart(2, '0')
const dateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const field = 'h-8 rounded-[8px] border border-border/90 bg-transparent px-2.5 text-[13.5px] leading-5 shadow-none outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40'

/** Title, day, start and end, colour, place and notes. Nothing changes until Save; Cancel or Escape leaves it as it was. */
function EventEditor({ event: e, ctx }: { event: CalendarEvent; ctx: Ctx }) {
    const isNew = ctx.draft === e.id
    const h24 = ctx.settings.hour24
    const [title, setTitle] = useState(e.title)
    const [day, setDay] = useState(dateValue(e.start))
    const [from, setFrom] = useState(minutesOf(e.start))
    const [to, setTo] = useState(sameDay(e.start, e.end) ? minutesOf(e.end) : 1440)
    const [color, setColor] = useState<Tone>(e.tone)
    const [location, setLocation] = useState(e.location ?? '')
    const [notes, setNotes] = useState(e.description ?? '')
    const valid = Boolean(title.trim()) && to > from && Boolean(day)
    const label = (m: number) => (h24 ? time(new Date(2000, 0, 1, 0, m), true) : fmt(new Date(2000, 0, 1, 0, m), { hour: 'numeric', minute: '2-digit' }))
    const steps = Array.from({ length: 96 }, (_, i) => i * 15)

    const save = () => {
        if (!valid) return
        const [y, mo, d] = day.split('-').map(Number)
        ctx.saveEvent(e.id, {
            title: title.trim(),
            start: new Date(y, mo - 1, d, 0, from),
            end: new Date(y, mo - 1, d, 0, to),
            tone: color,
            location: location.trim() || undefined,
            description: notes.trim() || undefined,
        })
    }

    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault()
                save()
            }}
            className="flex flex-col">
            <div className="flex flex-col gap-3.5 px-4 pt-4 pb-4">
                <input
                    autoFocus
                    value={title}
                    onChange={(ev) => setTitle(ev.target.value)}
                    placeholder="Add title"
                    aria-label="Title"
                    className="h-9 w-full border-b border-border/90 bg-transparent text-[17px] leading-6 font-semibold tracking-[-0.01em] outline-none transition-colors placeholder:text-foreground/35 focus-visible:border-ring"
                />
                <div className="flex items-start gap-3">
                    <Clock className="mt-2 size-4 shrink-0 text-foreground/45" aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Input type="date" value={day} onChange={(ev) => setDay(ev.target.value)} aria-label="Day" className={cn(field, 'w-full md:text-[13.5px]')} />
                        <div className="flex items-center gap-2">
                            <Select
                                value={String(from)}
                                onValueChange={(v) => {
                                    if (v == null) return
                                    const next = Number(v)
                                    // Moving the start keeps the length, as calendars do.
                                    setTo(Math.min(1440, next + (to - from)))
                                    setFrom(next)
                                }}>
                                <SelectTrigger aria-label="Starts" className={cn(field, 'min-w-0 flex-1 justify-between')}>
                                    <SelectValue>{label(from)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {steps.map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {label(m)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span aria-hidden className="text-foreground/40">
                                –
                            </span>
                            <Select value={String(to)} onValueChange={(v) => v != null && setTo(Number(v))}>
                                <SelectTrigger aria-label="Ends" className={cn(field, 'min-w-0 flex-1 justify-between')}>
                                    <SelectValue>{to === 1440 ? label(0) : label(to)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {[...steps.filter((m) => m > from), 1440].map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {m === 1440 ? label(0) : label(m)}
                                            <span className="ms-auto ps-3 text-foreground/45">{duration(new Date(0, 0, 1, 0, from), new Date(0, 0, 1, 0, m))}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Palette className="size-4 shrink-0 text-foreground/45" aria-hidden />
                    <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-1.5">
                        {SWATCHES.map((t) => (
                            <button
                                key={t}
                                type="button"
                                role="radio"
                                aria-checked={color === t}
                                aria-label={t === 'neutral' ? 'Grey' : t[0].toUpperCase() + t.slice(1)}
                                onClick={() => setColor(t)}
                                className={cn('grid size-6 cursor-pointer place-items-center rounded-full transition-transform hover:scale-110', focusRing)}
                                style={{ background: tone(t) }}>
                                {color === t ? <Check className="size-3.5 text-white" aria-hidden /> : null}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="size-4 shrink-0 text-foreground/45" aria-hidden />
                    <input value={location} onChange={(ev) => setLocation(ev.target.value)} placeholder="Add location" aria-label="Location" className={cn(field, 'min-w-0 flex-1')} />
                </div>
                <div className="flex items-start gap-3">
                    <TextAlignStart className="mt-2 size-4 shrink-0 text-foreground/45" aria-hidden />
                    <textarea value={notes} onChange={(ev) => setNotes(ev.target.value)} placeholder="Add notes" aria-label="Notes" rows={3} className={cn(field, 'h-auto min-w-0 flex-1 resize-none py-1.5')} />
                </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border/80 bg-muted/40 px-4 py-2.5">
                {!valid && title.trim() ? <span className="text-[12.5px] text-destructive">End after start</span> : null}
                <button type="button" onClick={() => (isNew ? ctx.closeCard() : ctx.setEditing(null))} className={cn('ms-auto h-8 cursor-pointer rounded-[8px] px-3 text-[13.5px] font-medium text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground', focusRing)}>
                    Cancel
                </button>
                <button type="submit" disabled={!valid} className={cn('h-8 cursor-pointer rounded-[8px] bg-foreground px-3.5 text-[13.5px] font-medium text-background shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40', focusRing)}>
                    {isNew ? 'Add event' : 'Save'}
                </button>
            </div>
        </form>
    )
}

/* -------------------------------- Month view -------------------------------- */

function MonthGrid({ focus, ctx, events, onDay }: { focus: Date; ctx: Ctx; events: CalendarEvent[]; onDay: (d: Date) => void }) {
    const first = new Date(focus.getFullYear(), focus.getMonth(), 1)
    const start = startOfWeek(first, ctx.settings.mondayFirst)
    const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
    const weekdays = cells.slice(0, 7)
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <div className="grid grid-cols-7 border-b border-border/80">
                {weekdays.map((d) => (
                    <span key={+d} className="py-3 text-center text-[12px] leading-4 font-semibold tracking-[0.04em] text-foreground/60 uppercase">
                        {fmt(d, { weekday: 'short' })}
                    </span>
                ))}
            </div>
            <div className="grid min-h-[480px] flex-1 grid-cols-7 grid-rows-6">
                {cells.map((d) => {
                    const dayEvents = events.filter((e) => sameDay(e.start, d)).sort((a, b) => +a.start - +b.start)
                    const outside = d.getMonth() !== focus.getMonth()
                    const isToday = ctx.live && sameDay(d, ctx.now)
                    return (
                        <div key={+d} className={cn('flex min-w-0 flex-col gap-1 border-e border-b border-border/80 p-1.5 [&:nth-child(7n)]:border-e-0', outside && 'bg-muted/30')}>
                            <button
                                type="button"
                                onClick={() => onDay(d)}
                                aria-label={`${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}: open day`}
                                className={cn('grid size-6 cursor-pointer place-items-center self-end rounded-full text-[12.5px] font-medium text-foreground/70 hover:bg-foreground/[0.06]', outside && 'text-foreground/35', isToday && 'bg-destructive text-white hover:bg-destructive', focusRing)}>
                                {d.getDate()}
                            </button>
                            {dayEvents.slice(0, 3).map((e) => (
                                <EventCard key={e.id} event={e} ctx={ctx}>
                                    <PopoverTrigger className={cn('flex min-w-0 cursor-pointer items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-start text-[12px] leading-4 font-medium text-foreground/80', focusRing)} style={{ background: ctx.selected === e.id ? tone(e.tone) : tint(e.tone) }}>
                                        <span className="truncate">{e.title || 'New event'}</span>
                                    </PopoverTrigger>
                                </EventCard>
                            ))}
                            {dayEvents.length > 3 ? (
                                <button type="button" onClick={() => onDay(d)} className={cn('cursor-pointer rounded-[4px] px-1.5 text-start text-[12px] text-foreground/55 hover:text-foreground', focusRing)}>
                                    +{dayEvents.length - 3} more
                                </button>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* -------------------------------- Month picker -------------------------------- */

function MonthPicker({ focus, now, mondayFirst, onPick, children }: { focus: Date; now: Date; mondayFirst: boolean; onPick: (d: Date) => void; children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [month, setMonth] = useState(new Date(focus.getFullYear(), focus.getMonth(), 1))
    const start = startOfWeek(month, mondayFirst)
    const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
    return (
        <Popover open={open} onOpenChange={(o) => (setOpen(o), o && setMonth(new Date(focus.getFullYear(), focus.getMonth(), 1)))}>
            <PopoverTrigger aria-label="Pick a date" className={cn('-ms-1 flex min-w-0 cursor-pointer items-center gap-1.5 rounded-[8px] px-1 py-0.5 hover:bg-foreground/[0.04]', focusRing)}>{children}</PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-[264px] rounded-[14px] p-3">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[14px] font-semibold">{fmt(month, { month: 'long', year: 'numeric' })}</span>
                    <span className="flex">
                        <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className={cn(iconButton, 'size-7', focusRing)}>
                            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
                        </button>
                        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className={cn(iconButton, 'size-7', focusRing)}>
                            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
                        </button>
                    </span>
                </div>
                <div className="grid grid-cols-7 gap-y-0.5 text-center">
                    {cells.slice(0, 7).map((d) => (
                        <span key={`h${+d}`} className="py-1 text-[11px] font-medium text-foreground/45">
                            {fmt(d, { weekday: 'narrow' })}
                        </span>
                    ))}
                    {cells.map((d) => {
                        const inMonth = d.getMonth() === month.getMonth()
                        const chosen = sameDay(d, focus)
                        return (
                            <button
                                key={+d}
                                type="button"
                                aria-label={fmt(d, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                aria-pressed={chosen}
                                onClick={() => (onPick(d), setOpen(false))}
                                className={cn(
                                    'mx-auto grid size-8 cursor-pointer place-items-center rounded-full text-[13px] tabular-nums hover:bg-foreground/[0.06]',
                                    !inMonth && 'text-foreground/30',
                                    sameDay(d, now) && 'font-semibold text-destructive',
                                    chosen && 'bg-foreground text-background hover:bg-foreground',
                                    focusRing,
                                )}>
                                {d.getDate()}
                            </button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

/* ---------------------------------- Sidebar ---------------------------------- */

function Sidebar({
    className,
    hidden,
    groups,
    defaultTodos,
    events,
    now,
    live,
    settings,
    weekStart,
    onOpen,
    onClose,
    soon,
}: {
    className?: string
    /** A closed drawer: out of the tab order and the accessibility tree. */
    hidden: boolean
    groups: TodoGroup[]
    defaultTodos: Todo[]
    events: CalendarEvent[]
    now: Date
    live: boolean
    settings: Settings
    weekStart: Date
    onOpen: (e: CalendarEvent) => void
    onClose: () => void
    soon: boolean
}) {
    const [tab, setTab] = useState<'todos' | 'events' | 'notes'>('todos')
    const [todos, setTodos] = useState(defaultTodos)
    const [open, setOpen] = useState<Set<string>>(new Set(groups.filter((g) => g.open !== false).map((g) => g.id)))
    const [hideDone, setHideDone] = useState(false)
    const [adding, setAdding] = useState<string | null>(null)
    const [notes, setNotes] = useState('')
    const week = events.filter((e) => +e.start >= +weekStart && +e.start < +addDays(weekStart, 7)).sort((a, b) => +a.start - +b.start)
    const toggleGroup = (id: string) =>
        setOpen((s) => {
            const next = new Set(s)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    const add = (group: string, label: string) => {
        if (label.trim()) setTodos([...todos, { id: `todo-${Date.now()}`, label: label.trim(), done: false, group }])
        setAdding(null)
    }

    return (
        <aside aria-label="Today" inert={hidden} className={cn('flex shrink-0 flex-col bg-card', className)}>
            <div className="flex h-[56px] shrink-0 items-center gap-1 ps-[19px] pe-3 pt-4">
                <h2 className="flex-1 text-[19px] leading-6 font-semibold tracking-[-0.01em]">Today</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger aria-label="Filter to-dos" className={cn(iconButton, 'size-7 aria-expanded:bg-foreground/[0.06]', focusRing)}>
                        <SlidersHorizontal className="size-4" aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuCheckboxItem checked={hideDone} onCheckedChange={setHideDone}>
                            Hide completed
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger aria-label="More" className={cn(iconButton, 'size-7 aria-expanded:bg-foreground/[0.06]', focusRing)}>
                        <MoreHorizontal className="size-4" aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => setOpen(new Set(groups.map((g) => g.id)))}>Expand all</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setOpen(new Set())}>Collapse all</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={onClose} className="@5xl:hidden">
                            Close sidebar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div role="tablist" aria-label="Sidebar" className="flex h-[30px] shrink-0 items-end gap-[25px] border-b border-border/80 ps-[21px]">
                {(
                    [
                        ['todos', 'To-dos'],
                        ['events', 'Events'],
                        ['notes', 'Notes'],
                    ] as const
                ).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={tab === id}
                        onClick={() => setTab(id)}
                        className={cn(
                            'relative cursor-pointer pb-2 text-[13px] leading-4 font-medium text-foreground/45 hover:text-foreground/75',
                            tab === id && 'text-foreground/85 after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-foreground/80',
                            'outline-none focus-visible:underline',
                        )}>
                        {label}
                        {id === 'events' && soon ? <span aria-label="Starting soon" className="absolute -end-1.5 top-0 size-[5px] rounded-full bg-destructive" /> : null}
                    </button>
                ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pt-[23px] pb-6 [scrollbar-width:thin]">
                {tab === 'todos' ? (
                    groups.map((g) => {
                        const list = todos.filter((t) => t.group === g.id && !(hideDone && t.done))
                        const isOpen = open.has(g.id)
                        return (
                            <section key={g.id} className="mb-[15px]">
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => toggleGroup(g.id)}
                                    className={cn('flex h-[22px] cursor-pointer items-center gap-[13px] rounded-[6px] ps-1 pe-2 text-[16px] leading-5 font-medium', focusRing)}
                                    style={{ color: g.tone === 'neutral' ? undefined : `color-mix(in oklch, ${tone(g.tone)} 70%, var(--foreground))` }}>
                                    <ChevronDown className={cn('size-3 text-foreground/40 transition-transform', !isOpen && '-rotate-90 rtl:rotate-90')} aria-hidden />
                                    {g.label}
                                </button>
                                {isOpen ? (
                                    <ul className="mt-2 flex flex-col">
                                        {list.map((t) => (
                                            <li key={t.id} className="flex h-[35px] items-center gap-[13px]">
                                                <Checkbox
                                                    checked={t.done}
                                                    onCheckedChange={(c) => setTodos(todos.map((x) => (x.id === t.id ? { ...x, done: Boolean(c) } : x)))}
                                                    aria-label={t.label}
                                                    className="size-[15px] rounded-[3px] border-foreground/30 shadow-none data-checked:border-tone-blue-solid data-checked:bg-tone-blue-solid data-checked:text-white [&_svg]:size-3"
                                                />
                                                <span className={cn('truncate text-[14.5px] leading-5 text-foreground/80', t.done && 'text-foreground/40 line-through')}>{t.label}</span>
                                            </li>
                                        ))}
                                        <li className="flex h-[35px] items-center">
                                            {adding === g.id ? (
                                                <input
                                                    autoFocus
                                                    placeholder="New to-do"
                                                    aria-label={`New to-do in ${g.label}`}
                                                    onBlur={(e) => add(g.id, e.currentTarget.value)}
                                                    onKeyDown={(e) => (e.key === 'Enter' ? add(g.id, e.currentTarget.value) : e.key === 'Escape' && setAdding(null))}
                                                    className="ms-7 h-7 min-w-0 flex-1 rounded-[6px] bg-foreground/[0.04] px-2 text-[14.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                />
                                            ) : (
                                                <button type="button" onClick={() => setAdding(g.id)} className={cn('flex cursor-pointer items-center gap-[13px] rounded-[6px] text-[14.5px] text-foreground/45 hover:text-foreground/75', focusRing)}>
                                                    <Plus className="size-[15px]" aria-hidden />
                                                    To-do
                                                </button>
                                            )}
                                        </li>
                                    </ul>
                                ) : null}
                            </section>
                        )
                    })
                ) : tab === 'events' ? (
                    week.length ? (
                        <ul className="flex flex-col gap-1">
                            {week.map((e, i) => {
                                const newDay = i === 0 || !sameDay(e.start, week[i - 1].start)
                                return (
                                    <Fragment key={e.id}>
                                        {newDay ? (
                                            <li className={cn('text-[12px] font-semibold tracking-[0.04em] text-foreground/50 uppercase', i > 0 && 'mt-3')}>
                                                {fmt(e.start, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                {live && sameDay(e.start, now) ? ' · Today' : ''}
                                            </li>
                                        ) : null}
                                        <li>
                                            <button type="button" onClick={() => onOpen(e)} className={cn('flex w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-start hover:bg-foreground/[0.04]', focusRing)}>
                                                <span aria-hidden className="h-7 w-[3px] shrink-0 rounded-full" style={{ background: tone(e.tone) }} />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-[14px] font-medium text-foreground/85">{e.title}</span>
                                                    <span className="block text-[12.5px] text-foreground/50">
                                                        {timeRange(e.start, e.end, settings.hour24)}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    </Fragment>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-[14px] text-foreground/50">Nothing on this week.</p>
                    )
                ) : (
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Jot something down…"
                        aria-label="Notes"
                        className="h-full min-h-60 w-full resize-none rounded-[8px] bg-foreground/[0.03] p-3 text-[14.5px] leading-6 outline-none placeholder:text-foreground/35 focus-visible:ring-2 focus-visible:ring-ring"
                    />
                )}
            </div>
        </aside>
    )
}
