import { Bell, Buildings, Calendar, ChartColumn, ChartPie, ClipboardList, Contacts, Folder, Grid2x2, Inbox, Layers, ListChecks, Megaphone, PenLine, Receipt, User } from '@keyline-icons/react'

export type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>

/** A destination; `children` fold under it. */
export interface NavItem {
    id: string
    label: string
    icon: Icon
    children?: NavItem[]
}

/** A space: a coloured tile at the top level, folders and lists below it. `tone` only applies at the top. */
export interface SpaceItem {
    id: string
    label: string
    icon: Icon
    tone?: string
    children?: SpaceItem[]
}

export interface Workspace {
    id: string
    name: string
    /** The tile behind the mark. */
    tone: string
}

export const WORKSPACES: Workspace[] = [
    { id: 'halcyon', name: 'Halcyon', tone: 'from-tone-violet-bg to-tone-blue-bg' },
    { id: 'fieldnotes', name: 'Fieldnotes', tone: 'from-tone-green-bg to-tone-cyan-bg' },
    { id: 'kestrel', name: 'Kestrel', tone: 'from-tone-orange-bg to-tone-yellow-bg' },
]

export const NAV: NavItem[] = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: ChartPie,
        children: [
            { id: 'overview', label: 'Overview', icon: ChartColumn },
            { id: 'revenue', label: 'Revenue', icon: Receipt },
        ],
    },
    { id: 'assigned', label: 'Assigned to me', icon: Inbox },
    { id: 'projects', label: 'Projects', icon: ClipboardList },
    { id: 'drafts', label: 'Drafts', icon: PenLine },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Contacts },
    { id: 'company', label: 'Company', icon: Buildings },
]

export const SPACES: SpaceItem[] = [
    { id: 'everything', label: 'Everything', icon: Layers, tone: 'bg-tone-violet-solid' },
    {
        id: 'product',
        label: 'Product',
        icon: Grid2x2,
        tone: 'bg-tone-blue-solid',
        children: [
            {
                id: 'website',
                label: 'Website redesign',
                icon: Folder,
                children: [
                    { id: 'homepage', label: 'Homepage', icon: ListChecks },
                    { id: 'pricing', label: 'Pricing page', icon: ListChecks },
                    { id: 'docs', label: 'Docs', icon: ListChecks },
                ],
            },
            { id: 'mobile', label: 'Mobile app', icon: Folder },
            { id: 'billing', label: 'Billing revamp', icon: Folder },
        ],
    },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, tone: 'bg-tone-orange-solid' },
    { id: 'personal', label: 'Personal', icon: User, tone: 'bg-tone-green-solid' },
]

/** New spaces take the next of these in turn. */
export const SPACE_TONES = ['bg-tone-cyan-solid', 'bg-tone-yellow-solid', 'bg-tone-violet-solid', 'bg-tone-blue-solid']
