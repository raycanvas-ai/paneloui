'use client'

import type { ReactNode } from 'react'

import { cn } from '@/components/panelo/lib/utils'

import { dealColumns } from './columns'
import { deals, presence, type Deal } from './data'
import { RecordsTable, type View } from './records-table'

/* -------------------------------------------------------------------------- */
/*  tables/two preview: a partnerships pipeline in the records table. The      */
/*  views are saved filter + sort pairs; two rows start selected and three    */
/*  teammates are "here", as in a shared workspace.                           */
/* -------------------------------------------------------------------------- */

export { RecordsTable } from './records-table'
export { dealColumns, meetingLabel, Pill, Logo, tone } from './columns'
export type { RecordsTableProps, Sort, Filters, View } from './records-table'
export type { Column } from './columns'
export type { Deal, Presence, Tone } from './data'

export const dealViews: View[] = [
    { id: 'all', label: 'All Records' },
    { id: 'priority', label: 'High Priority', filters: { strength: ['very-strong', 'strong'], status: ['qualified', 'proposal', 'negotiation'] } },
    { id: 'value', label: 'Estimated Value', sort: { column: 'value', dir: 'desc' } },
    { id: 'soon', label: 'Meetings Soon', sort: { column: 'meeting', dir: 'asc' } },
]

/** The pipeline as one component: the deals, their columns and views, ready to drop in. */
export function DealsTable({ className }: { className?: string }) {
    return <RecordsTable<Deal> title="Growth Partnerships" emoji="🚀" rows={deals} columns={dealColumns} views={dealViews} presence={presence} defaultSelected={['lumen', 'corvid']} exportName="partnerships" className={className} />
}

function State({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <figure className={cn('flex w-full flex-col gap-3', className)}>
            <figcaption className="ps-1 text-[12.5px] leading-4 font-medium text-muted-foreground">{label}</figcaption>
            {children}
        </figure>
    )
}

const frame = 'overflow-hidden rounded-[18px] bg-card ring-1 ring-border/70'

export default function RecordsTableSheet() {
    return (
        <div className="flex min-h-svh flex-col items-center gap-12 bg-muted/40 px-4 py-6 font-sans text-foreground sm:px-6">
            <State label="Views, filters, sort, selection and presence" className="max-w-[1254px]">
                <div className={cn(frame, 'h-[986px]')}>
                    <DealsTable />
                </div>
            </State>
        </div>
    )
}
