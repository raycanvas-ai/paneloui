import type { ComponentType, ReactNode, SVGProps } from 'react'
import { CalendarClock, CircleDot, FileText, Grid2x2, Hash, Sparkle } from '@keyline-icons/react'
import { Sparkle as SparkleFill } from '@keyline-icons/react/fill'

import { cn } from '@/components/panelo/lib/utils'

import { STAGES, STATUSES, STRENGTHS, type Deal, type Tone } from './data'

/* -------------------------------------------------------------------------- */
/*  Columns: how each field draws, sorts, filters and exports. The table reads */
/*  nothing else about a row, so any record type works with its own columns.  */
/* -------------------------------------------------------------------------- */

export type Icon = ComponentType<SVGProps<SVGSVGElement>>

export type Column<T> = {
    id: string
    header: string
    icon?: Icon
    /** Width in px; the first column stays pinned when the table scrolls sideways. */
    width: number
    align?: 'start' | 'end'
    cell: (row: T) => ReactNode
    /** Makes the column sortable: what to compare. */
    sortValue?: (row: T) => string | number | null
    /** Makes the column filterable: the options, and which one a row has. */
    filter?: { options: { id: string; label: string; render?: ReactNode }[]; value: (row: T) => string }
    /** Plain text for search and CSV export; defaults to `sortValue`. */
    text?: (row: T) => string
}

/** A theme tone as a CSS colour. `pink` mixes violet and red; `neutral` follows the text colour. */
export const tone = (t: Tone) =>
    t === 'neutral'
        ? 'color-mix(in oklch, var(--foreground) 45%, transparent)'
        : t === 'red'
          ? 'var(--destructive)'
          : t === 'pink'
            ? 'color-mix(in oklch, var(--tone-violet-solid) 45%, var(--destructive))'
            : `var(--tone-${t}-solid)`

/** A soft tinted pill, like the status tags. */
export function Pill({ tone: t, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
    return (
        <span
            className={cn('inline-flex h-[26px] max-w-full items-center gap-1.5 truncate rounded-[5px] px-[14px] text-[15px] leading-5 font-medium text-foreground/75', className)}
            style={{ background: `color-mix(in oklch, ${tone(t)} ${t === 'neutral' ? 18 : 16}%, var(--card))` }}>
            {children}
        </span>
    )
}

/** A company's letter tile, standing in for its logo. */
export function Logo({ name, tone: t }: { name: string; tone: Tone }) {
    return (
        <span aria-hidden className="grid size-[14px] shrink-0 place-items-center rounded-[3px] text-[9px] leading-none font-bold text-white" style={{ background: tone(t) }}>
            {name[0]}
        </span>
    )
}

/** Minutes from now as people say it: "In 30 minutes", "Tomorrow", "Next month". */
export function meetingLabel(minutes: number | null) {
    if (minutes === null) return 'No contact'
    if (minutes < 60) return `In ${minutes} minutes`
    if (minutes < 1440) return `In ${Math.round(minutes / 60)} hour${minutes < 120 ? '' : 's'}`
    const days = Math.round(minutes / 1440)
    if (days === 1) return 'Tomorrow'
    if (days < 14) return `In ${days} days`
    if (days < 28) return `In ${Math.round(days / 7)} weeks`
    return 'Next month'
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
const byId = <T extends { id: string },>(list: T[], id: string) => list.find((x) => x.id === id)!

/** The pipeline's columns, in reading order. */
export const dealColumns: Column<Deal>[] = [
    {
        id: 'company',
        header: 'Company',
        icon: Grid2x2,
        width: 156,
        cell: (d) => (
            <span className="flex min-w-0 items-center gap-[11px]">
                <Logo name={d.company} tone={d.tone} />
                <span className="truncate font-medium text-foreground/80">{d.company}</span>
            </span>
        ),
        sortValue: (d) => d.company,
    },
    {
        id: 'stage',
        header: 'Stage',
        icon: FileText,
        width: 196,
        cell: (d) => {
            const s = byId(STAGES, d.stage)
            return (
                <span className="flex min-w-0 items-center gap-[13px]">
                    <span aria-hidden className="size-[7px] shrink-0 rounded-full" style={{ background: tone(s.tone) }} />
                    <span className="truncate font-medium text-foreground/80">{s.name}</span>
                </span>
            )
        },
        sortValue: (d) => STAGES.findIndex((s) => s.id === d.stage),
        filter: { options: STAGES.map((s) => ({ id: s.id, label: s.name, render: <span className="size-[7px] rounded-full" style={{ background: tone(s.tone) }} /> })), value: (d) => d.stage },
        text: (d) => byId(STAGES, d.stage).name,
    },
    {
        id: 'meeting',
        header: 'Next Meeting',
        icon: CalendarClock,
        width: 154,
        align: 'end',
        cell: (d) => <span className={cn('truncate font-medium', d.meeting === null ? 'text-foreground/50' : 'text-foreground/85')}>{meetingLabel(d.meeting)}</span>,
        // No meeting sorts last either way round.
        sortValue: (d) => d.meeting,
        text: (d) => meetingLabel(d.meeting),
    },
    {
        id: 'strength',
        header: 'Connection Strength',
        icon: Sparkle,
        width: 276,
        cell: (d) => {
            const s = byId(STRENGTHS, d.strength)
            return (
                <span className="flex min-w-0 items-center gap-3">
                    <SparkleFill className="size-[14px] shrink-0" style={{ color: tone(s.tone) }} aria-hidden />
                    <span className="truncate font-medium text-foreground/80">
                        {s.name} with {d.owner}
                    </span>
                </span>
            )
        },
        sortValue: (d) => STRENGTHS.findIndex((s) => s.id === d.strength),
        filter: { options: STRENGTHS.map((s) => ({ id: s.id, label: s.name, render: <SparkleFill className="size-3" style={{ color: tone(s.tone) }} /> })), value: (d) => d.strength },
        text: (d) => `${byId(STRENGTHS, d.strength).name} with ${d.owner}`,
    },
    {
        id: 'status',
        header: 'Status',
        icon: CircleDot,
        width: 151,
        cell: (d) => {
            const s = byId(STATUSES, d.status)
            return (
                <Pill tone={s.tone}>
                    {s.name}
                    {s.mark ? <span aria-hidden className="text-[11px] opacity-60">{s.mark}</span> : null}
                </Pill>
            )
        },
        sortValue: (d) => STATUSES.findIndex((s) => s.id === d.status),
        filter: { options: STATUSES.map((s) => ({ id: s.id, label: s.name, render: <span className="size-2.5 rounded-[3px]" style={{ background: `color-mix(in oklch, ${tone(s.tone)} 45%, var(--card))` }} /> })), value: (d) => d.status },
        text: (d) => byId(STATUSES, d.status).name,
    },
    {
        id: 'value',
        header: 'Estimated Value',
        icon: Hash,
        width: 164,
        align: 'end',
        cell: (d) => <span className="font-medium text-foreground/65 tabular-nums">{money.format(d.value)}</span>,
        sortValue: (d) => d.value,
        text: (d) => money.format(d.value),
    },
]
