'use client'

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Box, Grid3x3 } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/panelo/ui/toggle-group'
import { cn } from '@/components/panelo/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Contribution chart: a year of daily counts as the week-by-weekday          */
/*  calendar, and the same tiles morphing into an isometric city of bars       */
/*  where height is the count. One canvas, so nothing is swapped out: tiles    */
/*  slide into the isometric plane, then rise. The toggle never moves.         */
/* -------------------------------------------------------------------------- */

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** The green leans a little yellow, toward the classic contribution ramp. */
const ACCENT = 'oklch(from var(--tone-green-solid) calc(l - 0.04) c calc(h - 20))'

const DAY = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* ---------------------------------- Data ---------------------------------- */

export type Day = { date: number; count: number }

/** Deterministic 0..1, so the server, the client and every reload draw the same year. */
function hash(n: number) {
    let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** A year ending on `end`: quiet weekends, steady weekdays, and a few sprints. */
export function sampleYear(end = Date.UTC(2026, 10, 20)): Day[] {
    const first = end - (52 * 7 + new Date(end).getUTCDay()) * DAY
    const total = Math.round((end - first) / DAY) + 1
    const sprints: [number, number][] = [
        [88, 16],
        [126, 24],
        [205, 9],
        [298, 11],
    ]
    return Array.from({ length: total }, (_, i) => {
        const date = first + i * DAY
        const weekday = new Date(date).getUTCDay()
        const sprint = sprints.some(([s, len]) => i >= s && i < s + len)
        const chance = sprint ? (i < 104 ? 1 : 0.9) : weekday === 0 || weekday === 6 ? 0.22 : 0.56
        if (hash(i * 3 + 1) > chance) return { date, count: 0 }
        let count = 1 + Math.floor(hash(i * 7 + 2) ** 2.3 * (sprint ? 26 : 11))
        if (hash(i * 13 + 5) > 0.975) count += 18 + Math.floor(hash(i) * 18)
        return { date, count }
    })
}

const fmt = (t: number, year = true) => {
    const d = new Date(t)
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}${year ? `, ${d.getUTCFullYear()}` : ''}`
}
const fmtLong = (t: number) => {
    const d = new Date(t)
    return `${WEEKDAYS[d.getUTCDay()].slice(0, 3)}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function stats(days: Day[]) {
    const total = days.reduce((s, d) => s + d.count, 0)
    const busiest = days.reduce((best, d) => (d.count > best.count ? d : best), days[0])
    let longest = { length: 0, from: 0, to: 0 }
    let run = 0
    days.forEach((d, i) => {
        run = d.count ? run + 1 : 0
        if (run > longest.length) longest = { length: run, from: days[i - run + 1].date, to: d.date }
    })
    let current = 0
    for (let i = days.length - 1; i >= 0 && days[i].count; i--) current++
    const last = days[days.length - 1].date
    return { total, busiest, longest, current: { length: current, from: last - Math.max(0, current - 1) * DAY, to: last }, from: days[0].date, to: last }
}

/** GitHub-style levels: zero, then quartiles of the non-zero days. */
function levels(days: Day[]) {
    const counts = days.map((d) => d.count).filter(Boolean).sort((a, b) => a - b)
    const q = (p: number) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))] ?? 1
    const cuts = [q(0.25), q(0.5), q(0.75)]
    return (count: number) => (count === 0 ? 0 : count <= cuts[0] ? 1 : count <= cuts[1] ? 2 : count <= cuts[2] ? 3 : 4)
}

/** One sequential ramp: empty cells sit on the surface, then the accent from faint to deep. */
const RAMP = [
    'color-mix(in oklab, var(--foreground) 7%, var(--card))',
    'color-mix(in oklab, var(--cg) 32%, var(--card))',
    'color-mix(in oklab, var(--cg) 62%, var(--card))',
    'var(--cg)',
    'oklch(from var(--cg) calc(l - 0.2) c h)',
]

/* -------------------------------- Geometry -------------------------------- */

const S = 12 // a cell's edge, in viewBox units
const GAP = 0.16 // gap between cells, in cells
const TALLEST = 9.5 // the busiest day's height, in cells
const PLATE = 0.14 // empty days are thin plates
const COS = Math.cos(Math.PI / 6)
const MS = 900 // the morph, either way
const CORNER = 2 // calendar tile corner radius, in viewBox units (~2.5px); it fades out as tiles turn into bars

/** Isometric: week runs down-right, weekday down-left, height straight up. */
const iso = (x: number, y: number, z: number) => [(x - y) * COS * S, (x + y) * 0.5 * S - z * S] as const
const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const clamp = (t: number) => Math.min(1, Math.max(0, t))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/* -------------------------------- Component -------------------------------- */

type StatItem = { label: string; value: string; unit: string; detail: string }

export function ContributionChart({ days: given, accent = ACCENT, className }: { days?: Day[]; accent?: string; className?: string }) {
    const days = useMemo(() => given ?? sampleYear(), [given])
    const s = useMemo(() => stats(days), [days])
    const level = useMemo(() => levels(days), [days])
    const [view, setView] = useState<'calendar' | '3d'>('calendar')
    const [t, setT] = useState(0)
    // Where the morph is right now, readable synchronously: a new toggle starts from here, even mid-flight.
    const tNow = useRef(0)
    const [active, setActive] = useState<number | null>(null)
    const [width, setWidth] = useState(0)
    const stage = useRef<HTMLDivElement>(null)
    const scroller = useRef<HTMLDivElement>(null)
    const titleId = useId()

    // Drive the morph toward the chosen view; reduced motion jumps straight there.
    // The start point comes from the ref, never from inside a state updater: React runs updaters
    // lazily, so reading one there handed the first frame a stale 0 and snapped 3D flat for a frame.
    useEffect(() => {
        const target = view === '3d' ? 1 : 0
        const apply = (value: number) => {
            tNow.current = value
            setT(value)
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(target)
        const from = tNow.current
        if (from === target) return
        // A reversal mid-flight covers only the distance left, at the same speed.
        const duration = MS * Math.abs(target - from)
        let frame = 0
        let start = 0
        const tick = (now: number) => {
            start ||= now
            const k = clamp((now - start) / duration)
            apply(lerp(from, target, ease(k)))
            if (k < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [view])

    useEffect(() => {
        const el = stage.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // A narrow calendar scrolls; keep the newest weeks in view, on load and while the morph changes its width.
    useLayoutEffect(() => {
        if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth
    }, [t])

    const wide = width >= 720
    const offset = new Date(days[0].date).getUTCDay()
    const weeks = Math.ceil((days.length + offset) / 7)
    const max = Math.max(1, ...days.map((d) => d.count))

    const statItems: StatItem[] = [
        { label: '1 year total', value: s.total.toLocaleString('en-US'), unit: 'contributions', detail: `${fmt(s.from)} — ${fmt(s.to)}` },
        { label: 'Busiest day', value: String(s.busiest.count), unit: 'contributions', detail: fmt(s.busiest.date, false) },
        { label: 'Longest streak', value: String(s.longest.length), unit: 'days', detail: `${fmt(s.longest.from, false)} — ${fmt(s.longest.to, false)}` },
        { label: 'Current streak', value: String(s.current.length), unit: 'days', detail: s.current.length ? `${fmt(s.current.from, false)} — ${fmt(s.current.to, false)}` : 'None today' },
    ]

    /* The two layouts share one viewBox width; the height eases between them. */
    const frame = useMemo(() => {
        const corners = days.map((_, i) => {
            const slot = i + offset
            return [Math.floor(slot / 7), slot % 7] as const
        })
        const xs = corners.flatMap(([gx, gy]) => [iso(gx, gy + 1, 0)[0], iso(gx + 1, gy, 0)[0]])
        const minX = Math.min(...xs) - 6
        const maxX = Math.max(...xs) + 6
        const vbW = maxX - minX
        // Isometric extent, padded for the tallest bar.
        const isoTop = Math.min(...corners.map(([gx, gy]) => iso(gx, gy, TALLEST + PLATE)[1])) - 10
        const isoBottom = Math.max(...corners.map(([gx, gy]) => iso(gx + 1, gy + 1, 0)[1])) + 8
        // Flat: a label gutter, then 53 columns across the same width.
        const gutter = 2.6 * S
        const pitch = (vbW - gutter - 4) / weeks
        return { minX, vbW, isoTop, isoH: isoBottom - isoTop, gutter, pitch }
    }, [days, offset, weeks])

    // On wide cards the stats sit in a band above the calendar; the band is in viewBox units.
    const unitsPerPx = width ? frame.vbW / width : 1
    const band = wide ? 92 * unitsPerPx : 0
    const monthBand = 1.5 * S
    const flatH = band + monthBand + 7 * frame.pitch + 6
    const layout = ease(clamp(t / 0.62)) // tiles slide into the plane…
    const rise = ease(clamp((t - 0.38) / 0.62)) // …then bars grow
    const vbH = lerp(flatH, frame.isoH, layout)
    const top = frame.isoTop
    const flatOrigin = { x: frame.minX + frame.gutter, y: top + band + monthBand }

    const point = (x: number, y: number, z: number) => {
        const flat = [flatOrigin.x + x * frame.pitch, flatOrigin.y + y * frame.pitch] as const
        const p = iso(x, y, z * rise)
        return [lerp(flat[0], p[0], layout), lerp(flat[1], p[1], layout)] as const
    }
    const poly = (pts: (readonly [number, number])[]) => pts.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(' ')

    const prisms = days
        .map((d, i) => {
            const slot = i + offset
            const gx = Math.floor(slot / 7)
            const gy = slot % 7
            return { d, i, gx, gy, depth: gx + gy, h: d.count ? PLATE + (d.count / max) * TALLEST : PLATE, color: RAMP[level(d.count)] }
        })
        .sort((a, b) => a.depth - b.depth)

    const hovered = active === null ? null : prisms.find((p) => p.i === active)
    const anchor = hovered ? point(hovered.gx + 0.5, hovered.gy + 0.5 * layout, hovered.h) : null
    const tip = active === null ? '' : `${days[active].count || 'No'} contribution${days[active].count === 1 ? '' : 's'} on ${fmtLong(days[active].date)}`

    const months: { week: number; label: string }[] = []
    for (let w = 0; w < weeks - 1; w++) {
        const m = new Date(days[Math.max(0, w * 7 - offset)].date).getUTCMonth()
        if (w === 0 || new Date(days[Math.max(0, (w - 1) * 7 - offset)].date).getUTCMonth() !== m) months.push({ week: w, label: MONTHS[m] })
    }

    const onKey = (event: KeyboardEvent) => {
        const step = ({ ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 } as Record<string, number>)[event.key]
        const from = active ?? days.length - 1
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? days.length - 1 : step === undefined ? null : from + step
        if (next === null) return
        event.preventDefault()
        setActive(Math.max(0, Math.min(days.length - 1, next)))
    }

    return (
        <section aria-labelledby={titleId} style={{ '--cg': accent } as CSSProperties} className={cn('@container flex w-full flex-col gap-4', className)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id={titleId} className="text-base leading-6 font-medium tracking-tight">
                    {s.total.toLocaleString('en-US')} contributions in the last year
                </h2>
                <ToggleGroup type="single" value={view} onValueChange={(next: string) => next && setView(next as 'calendar' | '3d')} aria-label="View" className="shrink-0 gap-0.5 rounded-[10px] bg-muted p-[3px]">
                    {(
                        [
                            ['calendar', 'Calendar', Grid3x3],
                            ['3d', '3D', Box],
                        ] as const
                    ).map(([value, label, Icon]) => (
                        <ToggleGroupItem
                            key={value}
                            value={value}
                            className="h-7 flex-none cursor-pointer gap-1.5 rounded-[7px] px-3 text-[13px] font-normal text-muted-foreground first:rounded-[7px] last:rounded-[7px] hover:bg-transparent hover:text-foreground data-pressed:bg-card data-pressed:font-medium data-pressed:text-foreground data-pressed:shadow-xs">
                            <Icon className="size-3.5" aria-hidden />
                            {label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {/* Narrow cards keep the stats as a plain grid; wide ones float them on the canvas. */}
            {!wide ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {statItems.map((item) => (
                        <Stat key={item.label} item={item} compact />
                    ))}
                </dl>
            ) : null}

            <div ref={scroller} className="-mx-1 overflow-x-auto px-1 pt-1 pb-1 [scrollbar-width:thin]">
                <div
                    ref={stage}
                    tabIndex={0}
                    role="group"
                    aria-roledescription="contribution chart"
                    aria-label={`Contributions by day, ${view === '3d' ? '3D' : 'calendar'} view. Arrow keys move between days.`}
                    onKeyDown={onKey}
                    onBlur={() => setActive(null)}
                    className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    // A calendar needs ~600px to stay legible, so it scrolls on a phone; the 3D city fits any width, so the minimum melts away as it morphs.
                    style={{ minWidth: `${Math.round(lerp(600, 0, layout))}px` }}
                    onPointerLeave={() => setActive(null)}>
                    <svg viewBox={`${frame.minX} ${top} ${frame.vbW} ${vbH}`} aria-hidden className="block h-auto w-full overflow-visible">
                        {/* Calendar labels fade as the tiles leave the plane. */}
                        <g opacity={1 - layout} style={{ fontSize: 8.5 }} className="fill-muted-foreground">
                            {months.map((m) => (
                                <text key={m.week} x={flatOrigin.x + m.week * frame.pitch} y={flatOrigin.y - 5}>
                                    {m.label}
                                </text>
                            ))}
                            {['Mon', 'Wed', 'Fri'].map((label, i) => (
                                <text key={label} x={frame.minX} y={flatOrigin.y + (1 + i * 2 + 0.5) * frame.pitch} dominantBaseline="central">
                                    {label}
                                </text>
                            ))}
                        </g>
                        {prisms.map((p) => {
                            const [x0, x1, y0, y1] = [p.gx + GAP / 2, p.gx + 1 - GAP / 2, p.gy + GAP / 2, p.gy + 1 - GAP / 2]
                            const on = active === p.i
                            // Rounded tiles: the top face is inset by the radius, then a same-colour round-joined
                            // stroke grows it back, which rounds every corner. In 3D the radius is gone.
                            const round = CORNER * (1 - layout)
                            const inset = round / frame.pitch
                            const top = poly([point(x0 + inset, y0 + inset, p.h), point(x1 - inset, y0 + inset, p.h), point(x1 - inset, y1 - inset, p.h), point(x0 + inset, y1 - inset, p.h)])
                            const fill = on ? `oklch(from ${p.color} calc(l + 0.06) c h)` : p.color
                            const sides = rise > 0.001
                            return (
                                <g key={p.i} onPointerEnter={() => setActive(p.i)}>
                                    {sides ? (
                                        <>
                                            {/* Faces share the day's colour, darkened by their angle to the light. */}
                                            <polygon points={poly([point(x0, y1, p.h), point(x1, y1, p.h), point(x1, y1, 0), point(x0, y1, 0)])} fill={`oklch(from ${p.color} calc(l * 0.86) c h)`} />
                                            <polygon points={poly([point(x1, y0, p.h), point(x1, y1, p.h), point(x1, y1, 0), point(x1, y0, 0)])} fill={`oklch(from ${p.color} calc(l * 0.72) c h)`} />
                                        </>
                                    ) : null}
                                    {/* The hover ring: the same rounded shape, 1.2 units wider, under the tile. */}
                                    {on ? <polygon points={top} fill="var(--foreground)" stroke="var(--foreground)" strokeWidth={2 * round + 2.4} strokeLinejoin="round" /> : null}
                                    <polygon points={top} fill={fill} stroke={fill} strokeWidth={2 * round} strokeLinejoin="round" />
                                </g>
                            )
                        })}
                    </svg>

                    {wide
                        ? statItems.map((item, i) => {
                              // Calendar: a row of four across the band. 3D: the corners the board leaves empty.
                              // The total carries the longest date range, so it gets the widest slot.
                              const flat = { left: [0, 31, 56, 79][i], top: 0, shift: 0 }
                              const cube = [
                                  { left: 100, top: 0, shift: -100 },
                                  { left: 100, top: 19, shift: -100 },
                                  { left: 0, top: 52, shift: 0 },
                                  { left: 0, top: 71, shift: 0 },
                              ][i]
                              return (
                                  <dl
                                      key={item.label}
                                      className="pointer-events-none absolute"
                                      style={{
                                          // Capped to its slot (the gap to the next one), so a card just past 720px wraps the range instead of overlapping.
                                          maxWidth: `${[31, 25, 23, 21][i] - 2}%`,
                                          left: `${lerp(flat.left, cube.left, layout)}%`,
                                          top: `${lerp(flat.top, cube.top, layout)}%`,
                                          transform: `translateX(${lerp(flat.shift, cube.shift, layout)}%)`,
                                      }}>
                                      <Stat item={item} />
                                  </dl>
                              )
                          })
                        : null}

                    {anchor && hovered ? (
                        <span
                            aria-hidden
                            className="pointer-events-none absolute"
                            style={{ left: `${((anchor[0] - frame.minX) / frame.vbW) * 100}%`, top: `${((anchor[1] - top) / vbH) * 100}%` }}>
                            <span
                                className={cn(
                                    'absolute bottom-0 mb-2 rounded-md bg-foreground px-2 py-1 text-[11.5px] font-medium whitespace-nowrap text-background shadow-md',
                                    (anchor[0] - frame.minX) / frame.vbW < 0.18 ? '-left-3' : (anchor[0] - frame.minX) / frame.vbW > 0.82 ? '-right-3' : 'left-0 -translate-x-1/2'
                                )}>
                                {tip}
                            </span>
                        </span>
                    ) : null}
                </div>
            </div>
            <p aria-live="polite" className="sr-only">
                {tip}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
                <a href="#how-contributions-count" className={cn('rounded-sm text-[color-mix(in_oklab,var(--cg),var(--foreground)_35%)] hover:underline', focusRing)}>
                    How contributions are counted
                </a>
                <div className="flex items-center gap-1.5" aria-hidden>
                    Less
                    {RAMP.map((c) => (
                        <span key={c} className="size-[11px] rounded-[3px]" style={{ background: c }} />
                    ))}
                    More
                </div>
            </div>
        </section>
    )
}

function Stat({ item, compact }: { item: StatItem; compact?: boolean }) {
    return (
        <div className="flex flex-col">
            <dt className="text-[13px] text-muted-foreground">{item.label}</dt>
            <dd className={cn('flex items-end gap-2', compact && 'flex-wrap gap-y-0.5')}>
                <span className={cn('leading-[0.95] font-bold tracking-[-0.02em] text-[oklch(from_var(--cg)_calc(l_-_0.2)_c_h)] tabular-nums', compact ? 'text-[30px]' : 'text-[38px]')}>{item.value}</span>
                <span className="flex flex-col pb-0.5 leading-tight">
                    <span className="text-[14px] text-foreground">{item.unit}</span>
                    {/* A date range ("Nov 16, 2025 — Nov 20, 2026") can be wider than its slot: it wraps rather than running under the next stat. */}
                    <span className="text-[12px] text-pretty text-muted-foreground">{item.detail}</span>
                </span>
            </dd>
        </div>
    )
}
