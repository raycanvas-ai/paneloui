/* -------------------------------------------------------------------------- */
/*  Sample data for the planner: a studio's week of events, laid out around    */
/*  whichever week is current, plus to-do lists. Swap in your own.            */
/* -------------------------------------------------------------------------- */

export type Tone = 'blue' | 'cyan' | 'green' | 'orange' | 'violet' | 'yellow' | 'pink' | 'neutral'

export type Person = { id: string; name: string; initials: string; tone: Tone }

export type CalendarEvent = {
    id: string
    title: string
    start: Date
    end: Date
    tone: Tone
    /** A small glyph before the title. */
    emoji?: string
    location?: string
    description?: string
    /** Minutes before the start to remind. */
    reminder?: number
    /** Person ids. */
    members?: string[]
    /** A video link; shows "Join meeting". */
    meeting?: string
    /** Your reply, when you've given one. */
    rsvp?: Reply
    /** Other guests' replies, by person id. The first member is the organiser. */
    replies?: Record<string, Reply>
}

export type Reply = 'yes' | 'no' | 'maybe'

export type Todo = { id: string; label: string; done: boolean; group: string }
export type TodoGroup = { id: string; label: string; tone: Tone; open?: boolean }

export const people: Person[] = [
    { id: 'maya', name: 'Maya Okafor', initials: 'MO', tone: 'orange' },
    { id: 'theo', name: 'Theo Lindqvist', initials: 'TL', tone: 'blue' },
    { id: 'priya', name: 'Priya Raman', initials: 'PR', tone: 'yellow' },
    { id: 'jonas', name: 'Jonas Berg', initials: 'JB', tone: 'green' },
]

/** Monday 00:00 of the week holding `date`. */
export function mondayOf(date: Date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return d
}

/**
 * A busy week around `today`,: weekday offsets from Monday and times in
 * hours. Two events in the weeks either side, so paging has something to show.
 */
export function sampleEvents(today: Date): CalendarEvent[] {
    const monday = mondayOf(today)
    const at = (day: number, hour: number) => {
        const d = new Date(monday)
        d.setDate(d.getDate() + day)
        d.setMinutes(Math.round(hour * 60))
        return d
    }
    const ev = (id: string, day: number, from: number, to: number, title: string, tone: Tone, extra: Partial<CalendarEvent> = {}): CalendarEvent => ({ id, title, start: at(day, from), end: at(day, to), tone, ...extra })
    return [
        ev('mon-standup', 0, 9, 10, 'Team standup', 'pink', { members: ['maya', 'theo', 'priya'], meeting: 'https://meet.example.com/standup', reminder: 10, location: 'Studio, room 2', replies: { theo: 'yes', priya: 'yes' } }),
        ev('mon-inbox', 0, 11, 11.5, 'Inbox zero', 'neutral'),
        ev('mon-review', 0, 14, 15, 'Sprint review', 'neutral', { emoji: '📅', members: ['maya', 'jonas'] }),
        ev('mon-mobile', 0, 15.5, 16.5, 'Mobile nav pass', 'neutral'),
        ev('mon-launch', 0, 18, 19, 'Launch checklist', 'green'),
        ev('tue-tokens', 1, 10, 11, 'Token audit', 'violet', { members: ['priya', 'theo'] }),
        ev('tue-coffee', 1, 11.75, 12.5, 'Coffee with Inés', 'cyan', { location: 'Corner café' }),
        ev('tue-standup', 1, 13, 14, 'Team standup', 'pink', { members: ['maya', 'theo', 'priya'], meeting: 'https://meet.example.com/standup', reminder: 10 }),
        ev('tue-demo', 1, 14.5, 15.5, 'Client demo prep', 'cyan', { description: 'Walk through the new onboarding and the pricing page.' }),
        ev('tue-climb', 1, 16.5, 18.75, 'Climbing', 'cyan', { emoji: '🧗' }),
        ev('wed-standup', 2, 8.5, 9.5, 'Team standup', 'cyan', { members: ['maya', 'theo', 'priya'], meeting: 'https://meet.example.com/standup' }),
        ev('wed-research', 2, 11, 13, 'Research synthesis', 'violet', { members: ['priya', 'jonas'] }),
        ev('wed-lunch', 2, 13.5, 14, 'Lunch', 'cyan', { emoji: '🍜' }),
        ev('wed-plan-a', 2, 16, 16.5, 'Planning', 'green'),
        ev('wed-plan-b', 2, 17, 17.75, 'Planning', 'green'),
        ev('wed-chat', 2, 18.5, 19.5, 'Support inbox', 'violet', { emoji: '💬' }),
        ev('thu-inbox', 3, 9, 9.5, 'Inbox zero', 'neutral'),
        ev('thu-layouts', 3, 10, 12, 'Settings layout', 'cyan', { members: ['theo'] }),
        ev('thu-sync', 3, 14, 16, 'Atlas × Northbeam weekly sync', 'blue', {
            members: ['maya', 'theo', 'priya'],
            meeting: 'https://meet.example.com/atlas-sync',
            location: 'Lisbon, Portugal',
            reminder: 10,
            replies: { theo: 'yes', priya: 'maybe' },
            description: 'Both teams join without fail: we walk through the release, agree on owners, and book the follow-up for next week.',
        }),
        ev('fri-lunch', 4, 12, 13, 'Team lunch', 'neutral', { location: 'Tasca do Bairro' }),
        ev('fri-inbox', 4, 15, 15.5, 'Inbox zero', 'neutral'),
        ev('sat-tokens', 5, 9, 10, 'Sketch session', 'violet'),
        ev('sat-market', 5, 11, 12, 'Farmers market', 'orange', { emoji: '🧺' }),
        ev('prev-retro', -4, 10, 11, 'Quarterly retro', 'violet'),
        ev('next-offsite', 9, 9, 17, 'Team offsite', 'orange', { location: 'Sintra' }),
    ]
}

export const todoGroups: TodoGroup[] = [
    { id: 'week', label: 'This week', tone: 'cyan', open: true },
    { id: 'next', label: 'Next week', tone: 'pink', open: false },
    { id: 'month', label: 'This month', tone: 'green', open: true },
    { id: 'someday', label: 'Someday', tone: 'yellow', open: true },
    { id: 'personal', label: 'Personal', tone: 'neutral', open: false },
]

export const todos: Todo[] = [
    { id: 't1', label: 'Pricing page copy', done: false, group: 'week' },
    { id: 't2', label: 'Onboarding — first pass', done: false, group: 'week' },
    { id: 't3', label: 'Empty states', done: false, group: 'week' },
    { id: 't4', label: 'Usability test notes', done: false, group: 'week' },
    { id: 't5', label: 'Book venue for demo day', done: false, group: 'next' },
    { id: 't6', label: 'Connect the help desk', done: false, group: 'month' },
    { id: 't7', label: 'Invoice template', done: false, group: 'month' },
    { id: 't8', label: 'Calendar sync settings', done: false, group: 'month' },
    { id: 't9', label: 'Usability test notes', done: true, group: 'month' },
    { id: 't10', label: 'Landing page refresh', done: false, group: 'someday' },
    { id: 't11', label: 'Review widget library', done: false, group: 'someday' },
    { id: 't12', label: 'Responsive grid', done: false, group: 'someday' },
    { id: 't13', label: 'Keyboard shortcuts', done: false, group: 'someday' },
    { id: 't14', label: 'Renew passport', done: false, group: 'personal' },
]
