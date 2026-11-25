'use client'

import type { ReactNode } from 'react'

import { cn } from '@/components/panelo/lib/utils'

import { TaskTable } from './task-table'

/* -------------------------------------------------------------------------- */
/*  tables/one preview: the task table's views, each one live. Overview        */
/*  groups and pages each project; Table sorts by column and pages the lot.   */
/* -------------------------------------------------------------------------- */

export { TaskTable } from './task-table'
export type { Filters, GroupBy, Row, Sort, SortKey, TaskTableProps, View } from './task-table'
export type { Label, Person, Priority, Project, Status, Task } from './data'

function State({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <figure className={cn('flex w-full flex-col gap-3', className)}>
            <figcaption className="ps-1 text-[12.5px] leading-4 font-medium text-muted-foreground">{label}</figcaption>
            {children}
        </figure>
    )
}

const frame = 'overflow-hidden rounded-[18px] bg-card ring-1 ring-border/70'

export default function TaskTableSheet() {
    return (
        <div className="flex min-h-svh flex-col items-center gap-12 bg-muted/40 px-4 py-6 font-sans text-foreground sm:px-6">
            <State label="Overview: grouped by label, paged per group" className="max-w-[1240px]">
                <div className={cn(frame, 'h-[1104px]')}>
                    <TaskTable shortcuts />
                </div>
            </State>
            <State label="Table: sortable columns and pages" className="max-w-[1240px]">
                <div className={cn(frame, 'h-[640px]')}>
                    <TaskTable defaultView="table" defaultSort={{ key: 'priority', dir: 'asc' }} />
                </div>
            </State>
        </div>
    )
}
