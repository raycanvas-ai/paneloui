/* -------------------------------------------------------------------------- */
/*  Sample data for the records table: a partnerships pipeline of generated    */
/*  deals. Replace `deals` with your own rows; the columns in columns.tsx      */
/*  say how each field shows, sorts and filters.                              */
/* -------------------------------------------------------------------------- */

/** A theme tone (`--tone-<name>-solid`), plus `pink` (a violet–red mix) and `red` (`--destructive`). */
export type Tone = 'blue' | 'cyan' | 'green' | 'orange' | 'violet' | 'yellow' | 'pink' | 'red' | 'neutral'

export type Stage = 'won' | 'expansion' | 'evaluating' | 'pilot' | 'follow-up'
export type Strength = 'very-strong' | 'strong' | 'good' | 'weak' | 'very-weak'
export type Status = 'qualified' | 'closed' | 'negotiation' | 'lead' | 'lost' | 'proposal'

export type Deal = {
    id: string
    company: string
    tone: Tone
    stage: Stage
    /** Minutes until the next meeting, or `null` when nothing is booked. */
    meeting: number | null
    strength: Strength
    owner: string
    status: Status
    value: number
}

export const STAGES: { id: Stage; name: string; tone: Tone }[] = [
    { id: 'won', name: 'Won', tone: 'cyan' },
    { id: 'expansion', name: 'Room to expand', tone: 'pink' },
    { id: 'evaluating', name: 'Evaluating', tone: 'violet' },
    { id: 'pilot', name: 'In pilot', tone: 'orange' },
    { id: 'follow-up', name: 'Follow up', tone: 'green' },
]

export const STRENGTHS: { id: Strength; name: string; tone: Tone }[] = [
    { id: 'very-strong', name: 'Very strong', tone: 'green' },
    { id: 'strong', name: 'Strong', tone: 'orange' },
    { id: 'good', name: 'Good', tone: 'yellow' },
    { id: 'weak', name: 'Weak', tone: 'pink' },
    { id: 'very-weak', name: 'Very weak', tone: 'red' },
]

export const STATUSES: { id: Status; name: string; tone: Tone; mark?: string }[] = [
    { id: 'lead', name: 'Lead', tone: 'orange' },
    { id: 'qualified', name: 'Qualified', tone: 'pink' },
    { id: 'proposal', name: 'Proposal', tone: 'violet', mark: '··' },
    { id: 'negotiation', name: 'Negotiation', tone: 'blue' },
    { id: 'closed', name: 'Closed', tone: 'green', mark: '🎉' },
    { id: 'lost', name: 'Lost', tone: 'neutral', mark: '📉' },
]

export const OWNERS = ['Nora Lindqvist', 'Felipe Ortega', 'Hana Sato', 'Dev Malhotra', 'Grace Adebayo', 'Luca Romano', 'Mira Chen', 'Owen Park', 'Selin Kaya', 'Tomás Reyes']

const COMPANIES = [
    'Northwind', 'Lumen', 'Kestrel', 'Halcyon', 'Brightwater', 'Orbit', 'Fernhill', 'Quarry', 'Juniper', 'Atlas',
    'Bluefin', 'Cobalt', 'Corvid', 'Meridian', 'Tidewell', 'Foliage', 'Pebble', 'Sundial', 'Harbor', 'Larkspur',
    'Mosaic', 'Driftwood', 'Beacon', 'Cinder', 'Wayfarer', 'Saltbox', 'Granite', 'Verve', 'Holloway', 'Peregrine',
    'Thistle', 'Marlow', 'Ember', 'Quill', 'Rookery', 'Solace', 'Tamarind', 'Upland', 'Vantage', 'Willow',
    'Yardline', 'Zephyr', 'Arbor', 'Basalt', 'Caspian', 'Dune', 'Everly', 'Fathom',
]
const TONES: Tone[] = ['green', 'violet', 'blue', 'neutral', 'cyan', 'red', 'yellow', 'orange', 'pink']
// Meetings as people book them: soon, later today, this week, next month, or nothing yet.
const MEETINGS = [30, 180, 1440, 1440, 360, 8640, null, 43200, 10080, 7200, 180, 30, 20160, 43200, null, 30240, 20, 4320]

/** Small seeded PRNG (mulberry32): the same rows on every render, server and client alike. */
function random(seed: number) {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const rand = random(12)
const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]

export const deals: Deal[] = COMPANIES.map((company, i) => ({
    id: company.toLowerCase(),
    company,
    tone: TONES[i % TONES.length],
    stage: pick(STAGES).id,
    meeting: MEETINGS[i % MEETINGS.length],
    strength: pick(STRENGTHS).id,
    owner: pick(OWNERS),
    status: pick(STATUSES).id,
    // Round thousands, with the odd precise figure, like a real pipeline.
    value: i % 7 === 3 ? 6880 + Math.floor(rand() * 240) * 1000 + 678 : (2 + Math.floor(rand() * 60)) * 3000,
}))

/** People looking at the table right now: where their cursor is, shown as a coloured cell and a name tag. */
export type Presence = { id: string; name: string; tone: Tone; row: string; column: string }
export const presence: Presence[] = [
    { id: 'rara', name: 'Rara', tone: 'pink', row: 'brightwater', column: 'stage' },
    { id: 'ketoro', name: 'Ketoro', tone: 'violet', row: 'foliage', column: 'meeting' },
    { id: 'ayang', name: 'Ayang', tone: 'yellow', row: 'juniper', column: 'strength' },
]
