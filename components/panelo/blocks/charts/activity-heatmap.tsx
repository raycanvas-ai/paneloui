'use client'

import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { ChevronDown, PencilLine } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { cn } from '@/components/panelo/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Activity heatmap: one sequential ramp for what happened, a grey one for    */
/*  the forecast after "now". Day, two weeks, month or year; every view is a   */
/*  matrix of rows × columns, so one renderer and one table serve them all.    */
/*  Cells size from the container (cqw), so it fits a phone or a wide panel.   */
/* -------------------------------------------------------------------------- */

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** The pink is --ai-from, lifted and saturated; pass `accent` to use another hue. */
const ACCENT = 'oklch(from var(--ai-from) calc(l + 0.06) calc(c + 0.07) calc(h - 8))'

/** "Now" for the demo: everything after it is forecast. */
const NOW = Date.UTC(2024, 11, 11, 15)
const DAY = 86_400_000
const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i) // 8 am → 7 pm
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ---------------------------------- Data ---------------------------------- */

/** Deterministic 0..1 per key, so SSR, the client and every reload agree. */
function hash(n: number) {
    let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Visits in one hour: an afternoon peak, quieter weekends, and noise. */
function visits(time: number) {
    const date = new Date(time)
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60
    const weekday = (date.getUTCDay() + 6) % 7
    const curve = Math.exp(-(((hour - 14.5) / 3.2) ** 2))
    const week = weekday >= 5 ? 0.78 : 1
    const day = Math.floor(time / DAY)
    const mood = 0.72 + 0.5 * hash(day * 7 + 3)
    const season = 0.62 + 0.38 * (date.getUTCMonth() / 11)
    return Math.round((80 + 420 * curve) * week * mood * season * (0.8 + 0.4 * hash(Math.floor(time / 600_000))))
}
const dayTotal = (start: number) => HOURS.reduce((sum, h) => sum + visits(start + h * 3_600_000), 0)

type Cell = { value: number; future: boolean; label: string; date?: number }
/** `ratio` is a cell's width ÷ height; `min`/`max` clamp the row height; `minCol` makes a wide view scroll on a phone. */
type Matrix = { cols: { label: string; short: string }[]; rows: string[]; cells: Cell[][]; unit: string; ratio: number; min: number; max: number; minCol?: number }

const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`
const dayName = (t: number) => {
    const d = new Date(t)
    return `${WEEKDAYS[(d.getUTCDay() + 6) % 7]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

type Period = 'day' | 'week' | 'month' | 'year'

/** Each period's ranges for the picker, newest last; the second-to-last holds "now". */
const RANGES: Record<Period, { value: string; label: string; short?: string; start: number }[]> = {
    day: [9, 10, 11].map((d) => ({ value: `d${d}`, label: dayName(Date.UTC(2024, 11, d)), start: Date.UTC(2024, 11, d) })),
    week: [
        { value: 'w-nov', label: '18 Nov – 01 Dec, 24', short: '18 Nov–1 Dec', start: Date.UTC(2024, 10, 18) },
        { value: 'w-dec', label: '02 – 15 Dec, 24', short: '02–15 Dec', start: Date.UTC(2024, 11, 2) },
        { value: 'w-late', label: '16 – 29 Dec, 24', short: '16–29 Dec', start: Date.UTC(2024, 11, 16) },
    ],
    month: [
        { value: 'm-oct', label: 'Oct 2024', start: Date.UTC(2024, 9, 1) },
        { value: 'm-nov', label: 'Nov 2024', start: Date.UTC(2024, 10, 1) },
        { value: 'm-dec', label: 'Dec 2024', start: Date.UTC(2024, 11, 1) },
    ],
    year: [
        { value: 'y23', label: '2023', start: Date.UTC(2023, 0, 1) },
        { value: 'y24', label: '2024', start: Date.UTC(2024, 0, 1) },
    ],
}

function build(period: Period, start: number): Matrix {
    if (period === 'day') {
        // Hours down, ten-minute slots across.
        const slots = [0, 10, 20, 30, 40, 50]
        return {
            cols: slots.map((m) => ({ label: `:${String(m).padStart(2, '0')}`, short: `:${String(m).padStart(2, '0')}` })),
            rows: HOURS.map(hourLabel).reverse(),
            cells: [...HOURS].reverse().map((h) =>
                slots.map((m) => {
                    const t = start + h * 3_600_000 + m * 60_000
                    return { value: Math.round(visits(t) / 6), future: t > NOW, label: `${dayName(start)}, ${hourLabel(h).replace(' ', `:${String(m).padStart(2, '0')} `)}` }
                })
            ),
            unit: 'visits',
            ratio: 2.6,
            min: 18,
            max: 36,
        }
    }
    if (period === 'week') {
        // Hours down, fourteen days across: the design's default view.
        const days = Array.from({ length: 14 }, (_, i) => start + i * DAY)
        return {
            cols: days.map((t) => {
                const d = new Date(t)
                return { label: `${WEEKDAYS[(d.getUTCDay() + 6) % 7]} ${d.getUTCDate()}`, short: String(d.getUTCDate()) }
            }),
            rows: HOURS.map(hourLabel).reverse(),
            cells: [...HOURS].reverse().map((h) =>
                days.map((t) => {
                    const time = t + h * 3_600_000
                    return { value: visits(time), future: time > NOW, label: `${dayName(t)}, ${hourLabel(h)}` }
                })
            ),
            unit: 'visits',
            ratio: 1.7,
            min: 16,
            max: 34,
        }
    }
    const first = new Date(start)
    const monday = start - ((first.getUTCDay() + 6) % 7) * DAY
    const end = period === 'month' ? Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1) : Date.UTC(first.getUTCFullYear() + 1, 0, 1)
    const weeks = Math.ceil((end - monday) / (7 * DAY))
    const cell = (t: number): Cell => {
        // Days outside the range keep their slot as a blank, so the weekdays line up.
        if (t < start || t >= end) return { value: -1, future: false, label: '' }
        return { value: dayTotal(t), future: t + 15 * 3_600_000 > NOW, label: dayName(t) + (period === 'year' ? ` ${new Date(t).getUTCFullYear()}` : ''), date: new Date(t).getUTCDate() }
    }
    if (period === 'month') {
        // A calendar: weekdays across, one row per week.
        return {
            cols: WEEKDAYS.map((d) => ({ label: d, short: d })),
            rows: Array.from({ length: weeks }, (_, w) => {
                const d = new Date(Math.max(start, monday + w * 7 * DAY))
                return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
            }),
            cells: Array.from({ length: weeks }, (_, w) => WEEKDAYS.map((_, wd) => cell(monday + (w * 7 + wd) * DAY))),
            unit: 'visits',
            ratio: 2.4,
            min: 22,
            max: 52,
        }
    }
    // A year: weekdays down, Monday first; weeks across, labelled where a month starts.
    const cols = Array.from({ length: weeks }, (_, w) => {
        const t = monday + w * 7 * DAY
        const startsMonth = w === 0 || new Date(t - 7 * DAY).getUTCMonth() !== new Date(t).getUTCMonth()
        const month = new Date(Math.max(start, t)).getUTCMonth()
        return { label: startsMonth ? MONTHS[month] : '', short: startsMonth ? MONTHS[month] : '' }
    })
    return {
        cols,
        rows: WEEKDAYS,
        cells: WEEKDAYS.map((_, wd) => cols.map((_, w) => cell(monday + (w * 7 + wd) * DAY))),
        unit: 'visits',
        ratio: 1,
        min: 10,
        max: 20,
        minCol: 11,
    }
}

/* -------------------------------- Component -------------------------------- */

export function ActivityHeatmap({ className, accent = ACCENT }: { className?: string; accent?: string }) {
    const [period, setPeriod] = useState<Period>('week')
    const [ranges, setRanges] = useState<Record<Period, string>>({ day: 'd11', week: 'w-dec', month: 'm-dec', year: 'y24' })
    const [table, setTable] = useState(false)
    const [active, setActive] = useState<[number, number] | null>(null)
    const grid = useRef<HTMLDivElement>(null)
    const titleId = useId()

    const range = RANGES[period].find((r) => r.value === ranges[period]) ?? RANGES[period][0]
    const m = useMemo(() => build(period, range.start), [period, range.start])
    const max = useMemo(() => Math.max(1, ...m.cells.flat().map((c) => c.value)), [m])

    const fill = (cell: Cell) => {
        if (cell.value < 0) return 'transparent'
        const t = cell.value / max
        // Sequential: one hue from near-card to full. Forecast reads in grey on the same scale.
        return cell.future
            ? `color-mix(in oklab, var(--muted-foreground) ${Math.round(18 + 72 * t)}%, var(--card))`
            : `color-mix(in oklab, var(--hm-accent) ${Math.round(9 + 91 * t)}%, var(--card))`
    }

    const move = (event: KeyboardEvent, r: number, c: number) => {
        const delta = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, [number, number]>)[event.key]
        let next: [number, number] | null = delta ? [r + delta[0], c + delta[1]] : null
        if (event.key === 'Home') next = [r, 0]
        if (event.key === 'End') next = [r, m.cols.length - 1]
        if (!next) return
        event.preventDefault()
        const [nr, nc] = [Math.min(m.rows.length - 1, Math.max(0, next[0])), Math.min(m.cols.length - 1, Math.max(0, next[1]))]
        grid.current?.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`)?.focus()
    }

    // Rows size from the container's width: (width − hour labels) ÷ columns ÷ the view's aspect.
    const rowHeight = `clamp(${m.min}px, calc(((100cqw - 3.25rem) / ${m.cols.length} - 3px) / ${m.ratio}), ${m.max}px)`
    const year = period === 'year'

    return (
        <section aria-labelledby={titleId} style={{ '--hm-accent': accent } as CSSProperties} className={cn('@container flex w-full flex-col gap-3.5', className)}>
            <h2 id={titleId} className="sr-only">
                Visits by {period === 'week' || period === 'day' ? 'hour' : 'day'}, {range.label}
            </h2>

            <div className="flex items-center gap-2">
                <div role="group" aria-label="Period" className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-[10px] bg-muted p-[3px] [scrollbar-width:none]">
                    {(['day', 'week', 'month', 'year'] as const).map((p, i) => {
                        const on = p === period
                        const label = p[0].toUpperCase() + p.slice(1)
                        // A hairline between inactive neighbours, like the design.
                        const divider = i > 0 && !on && (['day', 'week', 'month', 'year'] as const)[i - 1] !== period
                        return on ? (
                            <DropdownMenu key={p}>
                                <DropdownMenuTrigger
                                    className={cn(
                                        'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] bg-card px-3 text-[13px] @max-md:gap-1 @max-md:px-2 font-medium whitespace-nowrap text-foreground shadow-xs ring-1 ring-border/60',
                                        focusRing
                                    )}>
                                    {label}
                                    <span aria-hidden className="text-muted-foreground">
                                        ·
                                    </span>
                                    <span className="tabular-nums">
                                        <span className="sr-only">range </span>
                                        {/* Narrow cards get the short form, so the whole switcher still fits. */}
                                        <span className={cn(range.short && '@max-md:hidden')}>{range.label}</span>
                                        {range.short ? <span className="@md:hidden">{range.short}</span> : null}
                                    </span>
                                    <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    <DropdownMenuRadioGroup value={range.value} onValueChange={(next) => setRanges((prev) => ({ ...prev, [p]: String(next) }))}>
                                        {RANGES[p].map((r) => (
                                            <DropdownMenuRadioItem key={r.value} value={r.value}>
                                                {r.label}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <BareButton
                                key={p}
                                onClick={() => {
                                    setPeriod(p)
                                    setActive(null)
                                }}
                                className={cn(
                                    'relative h-8 shrink-0 cursor-pointer rounded-[8px] px-3 text-[13px] @max-md:px-2 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
                                    divider && 'before:absolute before:inset-y-2 before:-left-px before:w-px before:bg-border',
                                    focusRing
                                )}>
                                {label}
                            </BareButton>
                        )
                    })}
                </div>
                <BareButton
                    aria-pressed={table}
                    aria-label="Spreadsheet view"
                    onClick={() => setTable((v) => !v)}
                    className={cn(
                        'flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] bg-muted px-3 @max-md:px-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/70 aria-pressed:bg-foreground aria-pressed:text-background',
                        focusRing
                    )}>
                    <PencilLine className="size-3.5" aria-hidden />
                    <span className="hidden @md:inline">Spreadsheet</span>
                </BareButton>
            </div>

            {table ? (
                <div className="max-h-[420px] overflow-auto rounded-lg border border-border/70">
                    <table className="w-full text-xs">
                        <caption className="sr-only">
                            Visits, {range.label}. Values from {dayName(NOW)} 3 pm on are forecast.
                        </caption>
                        <thead className="sticky top-0 bg-card">
                            <tr className="border-b border-border/70 text-muted-foreground">
                                <th scope="col" className="px-3 py-2 text-left font-medium">
                                    <span className="sr-only">Row</span>
                                </th>
                                {m.cols.map((col, c) => (
                                    <th key={c} scope="col" className="px-2 py-2 text-right font-medium whitespace-nowrap">
                                        {col.label || '·'}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70 font-mono tabular-nums">
                            {m.rows.map((row, r) => (
                                <tr key={row}>
                                    <th scope="row" className="px-3 py-1.5 text-left font-sans font-medium whitespace-nowrap">
                                        {row}
                                    </th>
                                    {m.cells[r].map((cell, c) => (
                                        <td key={c} className={cn('px-2 py-1.5 text-right', cell.future && 'text-muted-foreground italic')}>
                                            {cell.value < 0 ? '' : cell.value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={cn(m.minCol && 'overflow-x-auto pb-1 [scrollbar-width:thin]')}>
                <div
                    ref={grid}
                    role="grid"
                    aria-labelledby={titleId}
                    aria-describedby={`${titleId}-note`}
                    onPointerLeave={() => setActive(null)}
                    className={cn('grid', year ? 'gap-[2px]' : 'gap-[3px]')}
                    style={{ gridTemplateColumns: `repeat(${m.cols.length}, minmax(${m.minCol ?? 0}px, 1fr)) 3.25rem`, gridTemplateRows: `repeat(${m.rows.length}, ${rowHeight}) auto` }}>
                    {m.rows.map((row, r) => (
                        <div key={row} role="row" className="contents">
                            {m.cells[r].map((cell, c) => {
                                const on = active?.[0] === r && active?.[1] === c
                                if (cell.value < 0) return <div key={c} role="gridcell" aria-hidden />
                                return (
                                    <div
                                        key={c}
                                        role="gridcell"
                                        data-cell={`${r}-${c}`}
                                        // Roving focus: the first cell is the way in; arrows, Home and End move.
                                        tabIndex={(active ? on : r === 0 && c === 0) ? 0 : -1}
                                        aria-label={`${cell.label}: ${cell.value} ${m.unit}${cell.future ? ', forecast' : ''}`}
                                        onPointerEnter={() => setActive([r, c])}
                                        onFocus={() => setActive([r, c])}
                                        onKeyDown={(e) => move(e, r, c)}
                                        className={cn(
                                            'relative grid cursor-default place-items-center outline-none transition-[background-color,box-shadow] duration-100',
                                            year ? 'rounded-[2px]' : 'rounded-[4px]',
                                            on && 'z-10 shadow-md ring-1 ring-border',
                                            'focus-visible:ring-2 focus-visible:ring-ring'
                                        )}
                                        style={{ background: on && !year ? 'var(--card)' : fill(cell) }}>
                                        {period === 'month' && !on ? (
                                            <span aria-hidden className="absolute start-1.5 top-1 text-[10px] leading-none tabular-nums opacity-55">
                                                {cell.date}
                                            </span>
                                        ) : null}
                                        {on ? (
                                            year ? (
                                                // Year cells are too small to hold a number, so it floats above.
                                                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[11px] font-medium whitespace-nowrap text-background shadow-md">
                                                    {cell.label} · {cell.value}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] leading-none font-semibold tabular-nums">{cell.value}</span>
                                            )
                                        ) : null}
                                    </div>
                                )
                            })}
                            <div aria-hidden className="flex items-center ps-2.5 text-[11px] whitespace-nowrap text-muted-foreground">
                                {year ? (r % 2 === 0 ? row : '') : row}
                            </div>
                        </div>
                    ))}
                    {m.cols.map((col, c) => (
                        <div key={c} aria-hidden className={cn('pt-1 text-[11px] whitespace-nowrap text-muted-foreground', year ? 'overflow-visible text-start' : 'truncate text-center')} style={{ gridRow: m.rows.length + 1 }}>
                            <span className="hidden @xl:inline">{col.label}</span>
                            <span className="@xl:hidden">{col.short}</span>
                        </div>
                    ))}
                </div>
                </div>
            )}
            <p id={`${titleId}-note`} className="sr-only">
                Grey cells are forecast, from {dayName(NOW)} 3 pm on. Use the arrow keys to move between cells.
            </p>
        </section>
    )
}
