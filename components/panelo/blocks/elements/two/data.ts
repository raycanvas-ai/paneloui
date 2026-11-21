import { ChartNoAxesColumn, FileText, Inbox, LifeBuoy, MessagesSquare, type LucideIcon } from 'lucide-react'

export interface CommandItem {
    id: string
    label: string
    sublabel: string
    icon: LucideIcon
    /** Which agent picks the task up, shown while it runs. */
    agent: string
}

export interface CommandGroup {
    id: string
    label: string
    items: CommandItem[]
}

export const commandGroups: CommandGroup[] = [
    {
        id: 'agents',
        label: 'Agents',
        items: [
            { id: 'sarah', label: 'Sarah · Support', sublabel: 'Hand the support queue to Sarah', icon: LifeBuoy, agent: 'Sarah' },
            { id: 'alex', label: 'Alex · Data analyst', sublabel: 'Pull a fresh report from the analyst', icon: ChartNoAxesColumn, agent: 'Alex' },
        ],
    },
    {
        id: 'actions',
        label: 'Actions',
        items: [
            { id: 'triage', label: 'Triage new support tickets', sublabel: '12 tickets waiting in the queue', icon: Inbox, agent: 'Sarah' },
            { id: 'release', label: 'Draft weekly release notes', sublabel: "From this week's merged PRs", icon: FileText, agent: 'Alex' },
            { id: 'summary', label: 'Summarise customer feedback', sublabel: 'Across 48 recent conversations', icon: MessagesSquare, agent: 'Sarah' },
        ],
    },
]

export const agentsOnline = 3
