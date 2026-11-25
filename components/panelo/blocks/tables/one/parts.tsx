import type { CSSProperties } from 'react'
import { CircleCheck, Flag, TriangleAlert } from '@keyline-icons/react/fill'

import { cn } from '@/components/panelo/lib/utils'

import type { Person, Priority, Status, Tone } from './data'

/* ----------------------------- Small visual parts ---------------------------- */

/** A theme tone as a CSS colour; `neutral` follows the text colour, so it works in dark mode too. */
export const tone = (t: Tone) => (t === 'neutral' ? 'color-mix(in oklch, var(--foreground) 50%, transparent)' : `var(--tone-${t}-solid)`)

const STATUS_NAMES: Record<Status, string> = { todo: 'To do', progress: 'In progress', done: 'Done' }
const PRIORITY_NAMES: Record<Priority, string> = { none: 'No priority', normal: 'Normal priority', high: 'High priority', urgent: 'Urgent' }

/** To do: a dashed ring. In progress: an orange sun. Done: a filled green check. */
export function StatusIcon({ status, className }: { status: Status; className?: string }) {
    const label = STATUS_NAMES[status]
    if (status === 'done') return <CircleCheck role="img" aria-label={label} className={cn('size-[15px] shrink-0 text-tone-green-solid', className)} />
    if (status === 'progress') {
        return (
            <svg role="img" aria-label={label} viewBox="0 0 14 14" className={cn('size-[14px] shrink-0 text-tone-orange-solid', className)}>
                <circle cx="7" cy="7" r="2.9" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    {Array.from({ length: 8 }, (_, i) => {
                        const a = (i * Math.PI) / 4
                        return <line key={i} x1={7 + Math.cos(a) * 4.7} y1={7 + Math.sin(a) * 4.7} x2={7 + Math.cos(a) * 6.2} y2={7 + Math.sin(a) * 6.2} />
                    })}
                </g>
            </svg>
        )
    }
    return (
        <svg role="img" aria-label={label} viewBox="0 0 14 14" className={cn('size-[14px] shrink-0 text-foreground/40', className)}>
            <circle cx="7" cy="7" r="5.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 2.28" />
        </svg>
    )
}

/** A flag in the priority's colour; urgent is a red warning triangle. */
export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
    const label = PRIORITY_NAMES[priority]
    if (priority === 'urgent') return <TriangleAlert role="img" aria-label={label} className={cn('size-[15px] shrink-0 text-destructive', className)} />
    return (
        <Flag
            role="img"
            aria-label={label}
            className={cn('size-[14px] shrink-0', priority === 'high' ? 'text-tone-orange-solid' : priority === 'normal' ? 'text-tone-blue-solid' : 'text-foreground/30', className)}
        />
    )
}

/** A glossy two-tone sphere standing in for a profile photo. Pass a person to label it. */
export function Orb({ person, size = 18, className, style }: { person: Person; size?: number; className?: string; style?: CSSProperties }) {
    const [a, b] = person.tones
    return (
        <span
            role="img"
            aria-label={person.name}
            title={person.name}
            className={cn('inline-block shrink-0 rounded-full', className)}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 26%, color-mix(in oklch, white 70%, ${tone(a)}) 0, ${tone(a)} 34%, color-mix(in oklch, ${tone(a)} 40%, ${tone(b)}) 62%, ${tone(b)} 100%)`,
                ...style,
            }}
        />
    )
}

/** The project's colour tile beside its name. */
export function ProjectMark({ tones, className }: { tones: [Tone, Tone]; className?: string }) {
    return <span aria-hidden className={cn('size-[14px] shrink-0 rounded-[4px]', className)} style={{ background: `linear-gradient(160deg, ${tone(tones[0])}, ${tone(tones[1])})` }} />
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** `2026-03-15` → `Mar 15`, without time zones shifting the day. */
export const shortDate = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`
