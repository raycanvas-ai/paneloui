/* -------------------------------------------------------------------------- */
/*  Sample data for the task table: two projects of generated tasks. Swap in   */
/*  your own `projects`, `people` and `labels`; nothing else reads this file. */
/* -------------------------------------------------------------------------- */

export type Status = 'todo' | 'progress' | 'done'
export type Priority = 'none' | 'normal' | 'high' | 'urgent'
/** A tone from the theme (`--tone-<name>-solid`), used for label hashes and avatars. */
export type Tone = 'blue' | 'cyan' | 'green' | 'orange' | 'violet' | 'yellow' | 'neutral'

export type Person = { id: string; name: string; tones: [Tone, Tone] }
export type Label = { id: string; name: string; tone: Tone }

export type Task = {
    id: string
    title: string
    status: Status
    priority: Priority
    label: string
    /** ISO date, `YYYY-MM-DD`. */
    due: string
    assignee: string
    subtasks: number
    parent?: string
}

export type Project = { id: string; name: string; visibility: 'public' | 'private'; tones: [Tone, Tone]; tasks: Task[] }

export const STATUSES: { id: Status; name: string }[] = [
    { id: 'todo', name: 'To do' },
    { id: 'progress', name: 'In progress' },
    { id: 'done', name: 'Done' },
]

export const PRIORITIES: { id: Priority; name: string }[] = [
    { id: 'urgent', name: 'Urgent' },
    { id: 'high', name: 'High' },
    { id: 'normal', name: 'Normal' },
    { id: 'none', name: 'No priority' },
]

export const people: Person[] = [
    { id: 'maya', name: 'Maya Okafor', tones: ['cyan', 'violet'] },
    { id: 'theo', name: 'Theo Lindqvist', tones: ['orange', 'yellow'] },
    { id: 'priya', name: 'Priya Raman', tones: ['violet', 'orange'] },
    { id: 'jonas', name: 'Jonas Berg', tones: ['blue', 'cyan'] },
    { id: 'ines', name: 'Inés Duarte', tones: ['green', 'cyan'] },
    { id: 'kofi', name: 'Kofi Mensah', tones: ['yellow', 'orange'] },
    { id: 'ana', name: 'Ana Petrova', tones: ['blue', 'violet'] },
    { id: 'sam', name: 'Sam Whitfield', tones: ['neutral', 'blue'] },
]

export const labels: Label[] = [
    { id: 'discovery', name: 'Discovery', tone: 'neutral' },
    { id: 'prototype', name: 'Prototype', tone: 'violet' },
    { id: 'usability', name: 'Usability', tone: 'green' },
    { id: 'launch', name: 'Launch', tone: 'green' },
    { id: 'content', name: 'Content', tone: 'orange' },
    { id: 'metrics', name: 'Metrics', tone: 'blue' },
]

// Titles are a verb and a subject, so every generated task reads like real work.
const VERBS = ['Draft', 'Audit', 'Map', 'Prototype', 'Refine', 'Benchmark', 'Document', 'Validate', 'Plan', 'Test', 'Simplify', 'Polish']
const SUBJECTS = [
    'onboarding checklist',
    'pricing page copy',
    'search relevance',
    'billing emails',
    'empty states',
    'mobile navigation',
    'CSV export flow',
    'team permissions',
    'dark mode tokens',
    'usage dashboard',
    'referral flow',
    'release notes',
    'settings layout',
    'invite modal',
    'error messages',
    'keyboard shortcuts',
    'notification digest',
    'trial expiry flow',
    'help center links',
    'integration gallery',
]

/** Small seeded PRNG (mulberry32): the same tasks on every render, server and client alike. */
function random(seed: number) {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function generate(project: string, seed: number, groups: [label: string, count: number][], parents: string[]): Task[] {
    const rand = random(seed)
    const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
    const tasks: Task[] = []
    for (const [label, count] of groups) {
        for (let i = 0; i < count; i++) {
            const roll = rand()
            const month = 1 + Math.floor(rand() * 12)
            const day = 1 + Math.floor(rand() * 28)
            tasks.push({
                id: `${project}-${label}-${i + 1}`,
                title: `${pick(VERBS)} ${pick(SUBJECTS)}`,
                status: roll < 0.3 ? 'todo' : roll < 0.68 ? 'progress' : 'done',
                priority: pick(['none', 'normal', 'normal', 'high', 'high', 'urgent'] as const),
                label,
                due: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                assignee: pick(people).id,
                subtasks: 1 + Math.floor(rand() * 12),
                parent: rand() < 0.8 ? pick(parents) : undefined,
            })
        }
    }
    return tasks
}

export const projects: Project[] = [
    {
        id: 'atlas',
        name: 'Atlas Studio',
        visibility: 'public',
        tones: ['orange', 'violet'],
        tasks: generate('atlas', 7, [['discovery', 14], ['prototype', 49], ['usability', 80]], ['Onboarding revamp', 'Billing v2', 'Search']),
    },
    {
        id: 'northbeam',
        name: 'Northbeam',
        visibility: 'private',
        tones: ['blue', 'violet'],
        tasks: generate('northbeam', 21, [['launch', 30], ['content', 16], ['metrics', 49]], ['Spring launch', 'Lifecycle emails', 'Analytics']),
    },
]

/** Whose "My tasks" the person button shows. */
export const currentUser = 'maya'
