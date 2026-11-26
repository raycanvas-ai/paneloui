'use client'

import { useId, useState } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { ChartArea, Grid2x2 } from 'lucide-react'

import { cn } from '@/components/panelo/lib/utils'

import { CHART_MAX, CHART_STEP, card, cardTitle, categories, focusRing, money, months, total } from './finance-data'

/* -------------------------------------------------------------------------- */
/*  Current Balance. Stacked monthly bars: the active   */
/*  month takes its category colours and a breakdown; the rest stay neutral so  */
/*  one month reads at a time. Hover previews, click or arrow keys pin. The     */
/*  table view is the same data for anyone who'd rather read than point.        */
/*  `compact` drops the caption, the fourth stat and the view switch.           */
/* -------------------------------------------------------------------------- */

const OPENS_ON = 6 // July, the month the design opens on
const ticks = Array.from({ length: CHART_MAX / CHART_STEP + 1 }, (_, i) => CHART_MAX - i * CHART_STEP)
const tickLabel = (v: number) => (v ? `${v / 1000} K` : '0')
const latest = months[months.length - 1]
const stats = [{ label: 'Total', value: total(latest) }, ...categories.map((c) => ({ label: c.label, value: latest[c.key] }))]

export function BalanceChart({ className, compact = false }: { className?: string; compact?: boolean }) {
    const [hover, setHover] = useState<number | null>(null)
    const [pinned, setPinned] = useState(OPENS_ON)
    const [view, setView] = useState<'chart' | 'table'>('chart')
    const headingId = useId()

    const active = hover ?? pinned
    const month = months[active]
    const last = months.length - 1

    const onKeyDown = (event: React.KeyboardEvent) => {
        const next = ({ ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: last } as Record<string, number>)[event.key]
        if (next === undefined) return
        event.preventDefault()
        setHover(null)
        setPinned(Math.min(last, Math.max(0, next)))
    }

    return (
        <section aria-labelledby={headingId} className={cn(card, '@container flex h-full flex-col p-4.5', className)}>
            <h2 id={headingId} className={cardTitle}>
                Current Balance
            </h2>
            {compact ? null : <p className="mt-3 text-[13px] leading-5 text-muted-foreground">As of {latest.name}:</p>}

            <div className="mt-3 flex items-end justify-between gap-4">
                <dl className={compact ? 'flex' : 'grid grid-cols-2 gap-y-3 @lg:flex @lg:gap-y-0'}>
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={cn(
                                'border-border/70 px-4.5 first:pl-0',
                                (compact ? i > 0 : i % 2 === 1) && 'border-l',
                                !compact && i === 2 && 'pl-0 @lg:border-l @lg:pl-4.5',
                                compact && i === 3 && 'hidden',
                            )}
                        >
                            <dt className="text-[11px] leading-4 text-muted-foreground">{s.label}</dt>
                            <dd className="mt-1 font-mono text-lg font-semibold leading-7 tracking-tight">{money(s.value)}</dd>
                        </div>
                    ))}
                </dl>

                {compact ? null : (
                    <div role="group" aria-label="View" className="flex shrink-0 gap-1">
                        {(
                            [
                                ['chart', 'Chart view', ChartArea],
                                ['table', 'Table view', Grid2x2],
                            ] as const
                        ).map(([value, label, Icon]) => (
                            <BareButton
                                key={value}
                                aria-label={label}
                                aria-pressed={view === value}
                                onClick={() => setView(value)}
                                className={cn(
                                    'grid size-7 place-items-center rounded-md transition-colors duration-150',
                                    focusRing,
                                    view === value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                )}
                            >
                                <Icon className="size-3.5" aria-hidden="true" />
                            </BareButton>
                        ))}
                    </div>
                )}
            </div>

            <div className={cn('flex flex-1 flex-col', compact ? 'mt-6 min-h-36' : 'mt-14 min-h-[269px]')}>
                {view === 'table' ? (
                    <div className="min-h-0 flex-1 basis-0 overflow-y-auto">
                        <table className="w-full text-xs">
                            <caption className="sr-only">Balance by month and category</caption>
                            <thead className="sticky top-0 bg-card">
                                <tr className="border-b border-border/70 text-muted-foreground">
                                    <th scope="col" className="py-2 text-left font-medium">Month</th>
                                    {categories.map((c) => (
                                        <th key={c.key} scope="col" className="py-2 text-right font-medium">{c.label}</th>
                                    ))}
                                    <th scope="col" className="py-2 text-right font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/70 font-mono">
                                {months.map((row) => (
                                    <tr key={row.label}>
                                        <th scope="row" className="py-2 text-left font-sans font-medium">{row.label}</th>
                                        {categories.map((c) => (
                                            <td key={c.key} className="py-2 text-right text-muted-foreground">{money(row[c.key])}</td>
                                        ))}
                                        <td className="py-2 text-right font-semibold">{money(total(row))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        <div className="flex min-h-0 flex-1">
                            <div aria-hidden="true" className="relative w-13 shrink-0 text-[10px] text-muted-foreground">
                                {ticks.map((v) => (
                                    <span key={v} className="absolute left-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${(1 - v / CHART_MAX) * 100}%` }}>
                                        {tickLabel(v)}
                                    </span>
                                ))}
                            </div>

                            <div
                                // One stop per month: pointer previews, click pins, arrow/Home/End keys move it.
                                role="slider"
                                tabIndex={0}
                                aria-label="Month"
                                aria-valuemin={0}
                                aria-valuemax={last}
                                aria-valuenow={active}
                                aria-valuetext={`${month.name}: ${categories.map((c) => `${c.label} ${money(month[c.key])}`).join(', ')}`}
                                onKeyDown={onKeyDown}
                                onPointerLeave={() => setHover(null)}
                                className={cn('relative flex-1 rounded-sm', focusRing, 'focus-visible:ring-offset-4 focus-visible:ring-offset-card')}
                            >
                                {ticks.map((v) => (
                                    <div key={v} aria-hidden="true" className="absolute inset-x-0 border-t border-border/60" style={{ top: `${(1 - v / CHART_MAX) * 100}%` }} />
                                ))}

                                <div className="absolute inset-0 flex">
                                    {months.map((row, i) => {
                                        const on = i === active
                                        const share = total(row) / CHART_MAX
                                        return (
                                            <div
                                                key={row.label}
                                                onPointerEnter={() => setHover(i)}
                                                onClick={() => setPinned(i)}
                                                className="flex h-full flex-1 cursor-pointer items-end justify-center"
                                            >
                                                <div className="flex w-3/5 max-w-10 flex-col-reverse gap-[3px] @2xl:relative" style={{ height: `${share * 100}%` }}>
                                                    {categories.map((c) => (
                                                        <div
                                                            key={c.key}
                                                            className={cn('rounded-[4px] transition-colors duration-150', on ? c.swatch : 'bg-muted-foreground/20')}
                                                            style={{ flexGrow: row[c.key], flexBasis: 0 }}
                                                        />
                                                    ))}

                                                    {on ? (
                                                        <div
                                                            aria-hidden="true"
                                                            className={cn(
                                                                'pointer-events-none absolute z-10 w-48 rounded-lg border border-border/70 bg-popover p-3 text-popover-foreground shadow-lg',
                                                                // Wide cards: beside the bar, flipped near the right edge. Narrow cards have
                                                                // no room beside a bar, so it docks in the plot corner away from the month.
                                                                'top-0',
                                                                share < 0.6 && '@2xl:top-auto @2xl:bottom-0',
                                                                i < 6 ? 'right-0' : 'left-0',
                                                                i >= 8 ? '@2xl:left-auto @2xl:right-full @2xl:mr-2.5' : '@2xl:right-auto @2xl:left-full @2xl:ml-2.5',
                                                            )}
                                                        >
                                                            <p className="text-[11px] leading-4 text-muted-foreground">{row.name}</p>
                                                            <ul className="mt-2 flex flex-col gap-1.5">
                                                                {categories.map((c) => (
                                                                    <li key={c.key} className="flex items-center gap-2 text-xs leading-4">
                                                                        <span className={cn('size-2.5 rounded-[3px]', c.swatch)} />
                                                                        <span className="text-foreground/80">{c.label}</span>
                                                                        <span className="ml-auto font-mono font-semibold">{money(row[c.key])}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div aria-hidden="true" className="mt-3 flex pl-13 text-[11px] leading-4 text-muted-foreground">
                            {months.map((row, i) => (
                                <span key={row.label} className={cn('min-w-0 flex-1 whitespace-nowrap text-center', i % 2 === 1 && '@max-xl:invisible')}>
                                    {row.label}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
