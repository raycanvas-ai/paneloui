import type { ComponentType, SVGProps } from 'react'
import {
    Buildings,
    CircleCheck,
    File,
    FileArrowUp,
    FileText,
    Globe,
    Image,
    Inbox,
    LibraryBig,
    MessageSquare,
    Messages,
    Pin,
    Plus,
    Shapes,
    Store,
    Table,
    Users,
    Zap,
} from '@keyline-icons/react'

/* -------------------------------------------------------------------------- */
/*  Sample content for the resource sidebar. Every list is a prop, so swap     */
/*  these for your own spaces, pages and collections.                         */
/* -------------------------------------------------------------------------- */

export type Icon = ComponentType<SVGProps<SVGSVGElement>>

/** An icon on the rail: a space of the app, or an action like "New". */
export type RailItem = {
    id: string
    label: string
    icon: Icon
    /** Shows a small unread dot. */
    dot?: boolean
    /** Draws the icon on a round chip, for actions rather than spaces. */
    action?: boolean
}

/** A page in the panel's main navigation. */
export type NavItem = { id: string; label: string; icon: Icon; count?: number }

/** An entry in a section: a name with an emoji (or any short text) or an icon, and an optional count. */
export type ListItem = { id: string; label: string; emoji?: string; icon?: Icon; count?: number }

/** A titled, scrolling group of entries under the pages. `onAdd` replaces the default "add an untitled entry". */
export type Section = { id: string; label: string; items: ListItem[]; addLabel?: string; onAdd?: () => void }

/** Rail groups, drawn with a gap between them. */
export const railGroups: RailItem[][] = [
    [
        { id: 'new', label: 'New', icon: Plus, action: true },
        { id: 'threads', label: 'Threads', icon: Messages, dot: true },
        { id: 'automations', label: 'Automations', icon: Zap },
    ],
    [
        { id: 'inbox', label: 'Inbox', icon: Inbox },
        { id: 'comments', label: 'Comments', icon: MessageSquare },
        { id: 'resources', label: 'Resources', icon: LibraryBig },
    ],
    [{ id: 'pinned', label: 'Pinned', icon: Pin }],
]

export const railFooter: RailItem[] = [{ id: 'marketplace', label: 'Marketplace', icon: Store }]

export const nav: NavItem[] = [
    { id: 'everything', label: 'Everything', icon: LibraryBig },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'accounts', label: 'Accounts', icon: Buildings },
    { id: 'todos', label: 'To-dos', icon: CircleCheck },
    { id: 'notes', label: 'Notes', icon: FileText },
]

/** The "More" flyout, in groups split by a rule. */
export const more: NavItem[][] = [
    [
        { id: 'images', label: 'Images', icon: Image },
        { id: 'tables', label: 'Tables', icon: Table },
        { id: 'uploads', label: 'Uploads', icon: File },
    ],
    [{ id: 'all-resources', label: 'All resources', icon: Shapes }],
]

export const collections: ListItem[] = [
    { id: 'launches', label: 'Product launches', emoji: '🚀' },
    { id: 'objectives', label: 'Q3 objectives', emoji: '🎯' },
    { id: 'press', label: 'Press & partner newsletters', emoji: '📬' },
    { id: 'editorial', label: 'Editorial calendar', emoji: '🗓️' },
    { id: 'social', label: 'Spring social campaign planner', emoji: '🗓️' },
    { id: 'interviews', label: 'Customer interviews', emoji: '🤝' },
    { id: 'retail', label: 'Retail partnerships pipeline', emoji: '🏪' },
    { id: 'incidents', label: 'Incident reviews & follow-ups', emoji: '🚨' },
    { id: 'beta', label: 'Beta testers', emoji: '🧪' },
    { id: 'data-room', label: 'Series A data room', emoji: '💸' },
    { id: 'research', label: 'Research notes', emoji: '🧠' },
    { id: 'hiring', label: 'Hiring loop', emoji: '👋' },
    { id: 'enterprise', label: 'Enterprise accounts', emoji: '💼' },
    { id: 'content', label: 'Content calendar', emoji: '📅' },
    { id: 'grants', label: 'Grants & funding', emoji: '🌱' },
    { id: 'legal', label: 'Legal & compliance', emoji: '🏛️' },
    { id: 'brand', label: 'Brand assets', emoji: '🎨' },
]

export const sections: Section[] = [{ id: 'collections', label: 'Collections', items: collections, addLabel: 'New collection' }]

export const footer: NavItem = { id: 'import', label: 'Import files', icon: FileArrowUp }
