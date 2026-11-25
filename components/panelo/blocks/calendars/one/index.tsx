'use client'

import type { ReactNode } from 'react'

import { cn } from '@/components/panelo/lib/utils'

import { Planner } from './planner'

/* -------------------------------------------------------------------------- */
/*  calendars/one preview: the planner's week with its to-do sidebar and the   */
/*  month view. Each is live; on a phone the sidebar becomes a drawer.        */
/* -------------------------------------------------------------------------- */

export { Planner, tone } from './planner'
export type { PlannerProps, View } from './planner'
export { mondayOf, sampleEvents } from './data'
export type { CalendarEvent, Person, Todo, TodoGroup, Tone } from './data'

function State({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <figure className={cn('flex w-full flex-col gap-3', className)}>
            <figcaption className="ps-1 text-[12.5px] leading-4 font-medium text-muted-foreground">{label}</figcaption>
            {children}
        </figure>
    )
}

const frame = 'overflow-hidden rounded-[18px] bg-card ring-1 ring-border/70'

export default function PlannerSheet() {
    return (
        <div className="flex min-h-svh flex-col items-center gap-12 bg-muted/40 px-4 py-6 font-sans text-foreground sm:px-6">
            <State label="Week: click an event for its card, or an empty slot to add one" className="max-w-[1288px]">
                <div className={cn(frame, 'h-[1048px]')}>
                    <Planner />
                </div>
            </State>
            <State label="Month" className="max-w-[1288px]">
                <div className={cn(frame, 'h-[760px]')}>
                    <Planner defaultView="month" sidebar={false} />
                </div>
            </State>
        </div>
    )
}
