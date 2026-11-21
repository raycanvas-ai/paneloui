'use client'

import { useId, useState } from 'react'

import { cn } from '@/components/panelo/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Rounded pie: part-to-whole in one ink, darker for the bigger share. Each   */
/*  slice is drawn inset, then a same-colour round-joined stroke grows it back */
/*  out, so every corner (the centre point too) is rounded and the gaps stay   */
/*  an even width. Hover or focus a slice or its legend row to lift it.        */
/* -------------------------------------------------------------------------- */

export type PieDatum = { label: string; value: number }

const DEFAULT: PieDatum[] = [
    { label: 'Social', value: 6.3 },
    { label: 'Direct', value: 56.2 },
    { label: 'Organic search', value: 24.4 },
    { label: 'Referral', value: 13.1 },
]

const SIZE = 240
const R = 112 // outer radius, corners included
const ROUND = 13 // corner radius
const GAP = 7 // space between slices

/** Polar to x/y, with 0 at twelve o'clock going clockwise. */
const at = (angle: number, radius: number) => [SIZE / 2 + radius * Math.sin(angle), SIZE / 2 - radius * Math.cos(angle)] as const

/** The inset wedge: edges pushed in by ROUND + GAP/2, outer arc pulled in by ROUND. */
function wedge(start: number, end: number) {
    const sweep = end - start
    const inset = ROUND + GAP / 2
    const r = R - ROUND
    const apex = at(start + sweep / 2, inset / Math.sin(Math.min(sweep, 2 * Math.PI - 1e-6) / 2))
    const trim = Math.asin(Math.min(1, inset / r))
    const a = at(start + trim, r)
    const b = at(end - trim, r)
    const large = sweep - 2 * trim > Math.PI ? 1 : 0
    return `M${apex[0]},${apex[1]} L${a[0]},${a[1]} A${r},${r} 0 ${large} 1 ${b[0]},${b[1]} Z`
}

export function PieChart({ data = DEFAULT, title = 'Traffic sources', className }: { data?: PieDatum[]; title?: string; className?: string }) {
    const [active, setActive] = useState<number | null>(null)
    const titleId = useId()
    const total = data.reduce((sum, d) => sum + d.value, 0)

    // Shade by size: the largest share gets full ink, the smallest the lightest step.
    const rank = [...data.keys()].sort((x, y) => data[y].value - data[x].value)
    const shade = (i: number) => {
        const step = rank.indexOf(i) / Math.max(1, data.length - 1)
        return Math.round(88 - step * 66)
    }

    let cursor = 0
    const slices = data.map((d, i) => {
        const start = (cursor / total) * 2 * Math.PI
        cursor += d.value
        const end = (cursor / total) * 2 * Math.PI
        const mid = (start + end) / 2
        const share = d.value / total
        // Small slices carry their label further out, where there is room for it.
        const pos = at(mid, R * (share < 0.1 ? 0.74 : share > 0.4 ? 0.5 : 0.64))
        const lift = at(mid, 7)
        return { ...d, i, path: wedge(start, end), pos, lift: [lift[0] - SIZE / 2, lift[1] - SIZE / 2], pct: Math.round(share * 100), mix: shade(i) }
    })

    return (
        <section aria-labelledby={titleId} className={cn('@container flex flex-col gap-5', className)}>
            <h2 id={titleId} className="text-base leading-6 font-medium tracking-tight">
                {title}
            </h2>
            <div className="flex flex-col items-center gap-6 @md:flex-row @md:gap-10">
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    role="img"
                    aria-label={`${title}: ${slices.map((s) => `${s.label} ${s.pct}%`).join(', ')}`}
                    className="w-full max-w-[260px] shrink-0 overflow-visible"
                    onPointerLeave={() => setActive(null)}>
                    {slices.map((s) => {
                        const fill = `color-mix(in oklab, var(--foreground) ${s.mix}%, var(--card))`
                        const on = active === s.i
                        return (
                            <g
                                key={s.label}
                                onPointerEnter={() => setActive(s.i)}
                                className="transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
                                style={{ transform: on ? `translate(${s.lift[0]}px, ${s.lift[1]}px)` : undefined, opacity: active === null || on ? 1 : 0.55 }}>
                                <path d={s.path} fill={fill} stroke={fill} strokeWidth={ROUND * 2} strokeLinejoin="round" />
                                <text
                                    x={s.pos[0]}
                                    y={s.pos[1]}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    aria-hidden
                                    className="text-[11px] font-semibold tabular-nums"
                                    // Light text on the darker steps, ink on the lightest.
                                    fill={s.mix > 40 ? 'var(--card)' : 'var(--foreground)'}>
                                    {s.pct}%
                                </text>
                            </g>
                        )
                    })}
                </svg>

                <ul className="grid w-full max-w-[260px] gap-1 @md:max-w-[320px] @md:flex-1">
                    {[...slices]
                        .sort((x, y) => y.value - x.value)
                        .map((s) => (
                            <li key={s.label}>
                                <button
                                    type="button"
                                    onPointerEnter={() => setActive(s.i)}
                                    onPointerLeave={() => setActive(null)}
                                    onFocus={() => setActive(s.i)}
                                    onBlur={() => setActive(null)}
                                    aria-label={`${s.label}: ${s.pct}%`}
                                    className={cn(
                                        'flex h-9 w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        active === s.i ? 'bg-muted' : 'hover:bg-muted/60'
                                    )}>
                                    <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: `color-mix(in oklab, var(--foreground) ${s.mix}%, var(--card))` }} />
                                    <span className="flex-1 truncate text-start text-foreground/85">{s.label}</span>
                                    <span className="font-mono text-[12px] font-medium tabular-nums">{s.pct}%</span>
                                </button>
                            </li>
                        ))}
                </ul>
            </div>
        </section>
    )
}
