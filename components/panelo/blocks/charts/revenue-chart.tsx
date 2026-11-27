'use client'

import { useId, useRef, useState } from 'react'

import { cn } from '@/components/panelo/lib/utils'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/* ------------------------------ Revenue chart ----------------------------- */

/** Daily revenue, 19 Nov → 16 Dec (today), against the same days a period earlier. */
const REVENUE_START = Date.UTC(2024, 10, 19)

const revenueSeries: { current: number; previous: number }[] = [
    { current: 17200, previous: 14800 },
    { current: 16400, previous: 15600 },
    { current: 14800, previous: 16100 },
    { current: 13200, previous: 15400 },
    { current: 14600, previous: 14200 },
    { current: 16000, previous: 13900 },
    { current: 15200, previous: 14600 },
    { current: 16800, previous: 15800 },
    { current: 18200, previous: 14200 },
    { current: 17400, previous: 15100 },
    { current: 19600, previous: 16400 },
    { current: 21400, previous: 17200 },
    { current: 20100, previous: 16800 },
    { current: 22600, previous: 18100 },
    { current: 24200, previous: 17500 },
    { current: 23100, previous: 19300 },
    { current: 25400, previous: 18600 },
    { current: 27200, previous: 20600 },
    { current: 26100, previous: 19800 },
    { current: 28400, previous: 21400 },
    { current: 30100, previous: 20900 },
    { current: 28900, previous: 22600 },
    { current: 27600, previous: 21600 },
    { current: 29800, previous: 22900 },
    { current: 31400, previous: 21800 },
    { current: 30200, previous: 20400 },
    { current: 31800, previous: 21200 },
    { current: 30600, previous: 20000 },
]

/* -------------------------------------------------------------------------- */
/*  Daily revenue: this period (line + area) against last period (dashed).     */
/*  The <svg> stretches to its box, so HTML overlays (dots, tooltip, labels)   */
/*  use the same fractions and stay pixel-aligned at any width. The crosshair  */
/*  rests on today and follows the pointer; arrow keys, Home and End move it.  */
/* -------------------------------------------------------------------------- */

const VW = 1000
const VH = 300
const MIN = 10_000
const MAX = 35_000
const TICKS = [35_000, 30_000, 25_000, 20_000, 15_000, 10_000]
const DAY = 86_400_000

// UTC on both sides of hydration, so the server and the client print the same date.
const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' })
// Joined by hand: Node and Chrome disagree on the comma after the weekday, which breaks hydration.
const longFormat = { format: (d: Date) => `${weekdayFormat.format(d)} ${dayFormat.format(d)}` }
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const y = (v: number) => (1 - (v - MIN) / (MAX - MIN)) * VH
const top = (v: number) => `${(y(v) / VH) * 100}%`

export function RevenueChart({ days = revenueSeries.length, showPrevious = true, className }: { days?: number; showPrevious?: boolean; className?: string }) {
    const gradient = `rev-${useId().replace(/[^\w-]/g, '')}`
    const plot = useRef<HTMLDivElement>(null)
    const [hover, setHover] = useState<number | null>(null)

    const first = revenueSeries.length - days
    const series = revenueSeries.slice(first)
    const last = series.length - 1
    const clamp = (i: number) => Math.min(last, Math.max(0, i))
    const index = clamp(hover ?? last)
    const point = series[index]
    const pct = (i: number) => (i / last) * 100
    const dateOf = (i: number) => new Date(REVENUE_START + (first + i) * DAY)
    const line = (key: 'current' | 'previous') => series.map((p, i) => `${i ? 'L' : 'M'}${((i / last) * VW).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ')
    const current = line('current')
    const change = point.current / point.previous - 1

    // Labels count back from today so it's always labelled. Narrow plots keep every other one, and phone-width
    // ones (under 24rem, plot under ~225px) every fourth, or "10 Dec" runs into "Today".
    const step = days <= 7 ? 1 : days <= 14 ? 2 : 3
    const ticks = Array.from({ length: Math.floor(last / step) + 1 }, (_, k) => last - k * step)

    const track = (clientX: number) => {
        const box = plot.current?.getBoundingClientRect()
        if (box) setHover(clamp(Math.round(((clientX - box.left) / box.width) * last)))
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
        const next = ({ ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last } as Record<string, number>)[event.key]
        if (next === undefined) return
        event.preventDefault()
        setHover(clamp(next))
    }

    // The tooltip sits beside the crosshair, never on it, and flips sides past the middle.
    const at = pct(index)
    const tooltipLeft = at > 50 ? `max(0px, calc(${at}% - 11rem - 12px))` : `min(calc(100% - 11rem), calc(${at}% + 12px))`

    return (
        <div className={cn('@container select-none', className)}>
            <div className="flex gap-3">
                <div
                    ref={plot}
                    role="slider"
                    tabIndex={0}
                    aria-label="Daily revenue"
                    aria-orientation="horizontal"
                    aria-valuemin={0}
                    aria-valuemax={last}
                    aria-valuenow={index}
                    aria-valuetext={`${longFormat.format(dateOf(index))}: ${money.format(point.current)}${showPrevious ? `, last period ${money.format(point.previous)}` : ''}`}
                    onPointerDown={(event) => track(event.clientX)}
                    onPointerMove={(event) => track(event.clientX)}
                    onPointerLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    onKeyDown={onKeyDown}
                    // pan-y: a vertical swipe still scrolls the page, a horizontal one scrubs.
                    className={cn('relative h-56 min-w-0 flex-1 cursor-crosshair touch-pan-y rounded-sm @2xl:h-72', focusRing, 'focus-visible:ring-offset-4 focus-visible:ring-offset-card')}
                >
                    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
                        <defs>
                            <linearGradient id={gradient} className="text-chart-1" x1="0" y1="0" x2="0" y2={VH} gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
                                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {TICKS.map((v) => (
                            <line
                                key={v}
                                x1={0}
                                x2={VW}
                                y1={y(v)}
                                y2={y(v)}
                                className={v === MIN ? 'text-border' : 'text-border/70'}
                                stroke="currentColor"
                                strokeDasharray={v === MIN ? undefined : '2 4'}
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                        <path d={`${current} L${VW} ${VH} L0 ${VH} Z`} fill={`url(#${gradient})`} />
                        {showPrevious ? (
                            <path d={line('previous')} className="text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        ) : null}
                        <path d={current} className="text-chart-1" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        {hover !== null ? (
                            <line x1={(at / 100) * VW} x2={(at / 100) * VW} y1={0} y2={VH} className="text-foreground/25" stroke="currentColor" vectorEffect="non-scaling-stroke" />
                        ) : null}
                    </svg>

                    {/* HTML dots stay round under the plot's non-uniform scale. At rest they mark today. */}
                    {showPrevious ? (
                        <span aria-hidden="true" className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground bg-card" style={{ left: `${at}%`, top: top(point.previous) }} />
                    ) : null}
                    <span aria-hidden="true" className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-chart-1 shadow-sm" style={{ left: `${at}%`, top: top(point.current) }} />

                    {hover !== null ? (
                        <div aria-hidden="true" className="pointer-events-none absolute top-1 z-10 w-44 rounded-lg border border-border/70 bg-popover p-2.5 text-popover-foreground shadow-lg" style={{ left: tooltipLeft }}>
                            <p className="text-[11px] font-medium text-muted-foreground">{longFormat.format(dateOf(index))}</p>
                            <dl className="mt-1.5 flex flex-col gap-1 text-xs">
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="h-0.5 w-3 rounded-full bg-chart-1" />
                                        This period
                                    </dt>
                                    <dd className="font-semibold tabular-nums">{money.format(point.current)}</dd>
                                </div>
                                {showPrevious ? (
                                    <>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="flex items-center gap-1.5 text-muted-foreground">
                                                <span className="w-3 border-t-2 border-dashed border-muted-foreground/70" />
                                                Last period
                                            </dt>
                                            <dd className="tabular-nums text-muted-foreground">{money.format(point.previous)}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-1">
                                            <dt className="text-muted-foreground">Change</dt>
                                            <dd className={cn('font-medium tabular-nums', change >= 0 ? 'text-success' : 'text-destructive')}>
                                                {change >= 0 ? '+' : '−'}
                                                {Math.abs(change * 100).toFixed(1)}%
                                            </dd>
                                        </div>
                                    </>
                                ) : null}
                            </dl>
                        </div>
                    ) : null}
                </div>

                <div aria-hidden="true" className="relative w-10 shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {TICKS.map((v) => (
                        <span key={v} className="absolute start-0 -translate-y-1/2" style={{ top: top(v) }}>
                            ${v / 1000}k
                        </span>
                    ))}
                </div>
            </div>

            {/* mr-13 = gutter (w-10) + gap-3, so labels share the plot's width. Edge labels hug the edges instead of overflowing. */}
            <div aria-hidden="true" className="relative mr-13 mt-2.5 h-4 text-[11px] text-muted-foreground">
                {ticks.map((i, k) => (
                    <span
                        key={i}
                        className={cn('absolute whitespace-nowrap', i === last ? '-translate-x-full font-medium text-foreground' : i === 0 ? '' : '-translate-x-1/2', k % 2 === 1 && 'hidden @xl:block', k % 4 === 2 && 'hidden @sm:block')}
                        style={{ left: `${pct(i)}%` }}
                    >
                        {i === last ? 'Today' : dayFormat.format(dateOf(i))}
                    </span>
                ))}
            </div>
        </div>
    )
}
