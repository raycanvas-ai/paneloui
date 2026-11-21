import { AudioLines, BookOpen, FileText, House, MessageSquare, Settings2, Share2, Users, UserPlus, type LucideIcon } from 'lucide-react'

export interface Workspace {
    id: string
    name: string
    members: number
    initial: string
    /** Tailwind classes for the avatar tile (gradient + text colour). */
    logoClass: string
    active?: boolean
    shortcut?: string
}

export interface NavItem {
    id: string
    label: string
    icon: LucideIcon
    active?: boolean
    dot?: boolean
}

export interface DashboardItem {
    id: string
    label: string
    active?: boolean
}

export interface Folder {
    id: string
    name: string
    dot?: boolean
    /** Render dimmed (e.g. archived / inactive). */
    muted?: boolean
}

export interface FooterItem {
    id: string
    label: string
    icon: LucideIcon
    dot?: boolean
}

export const workspaces: Workspace[] = [
    { id: 'buildbetter', name: 'BuildBetter', members: 22, initial: 'B', logoClass: 'bg-gradient-to-br from-chart-4/80 to-chart-4 text-primary-foreground', active: true },
    { id: 'buildbetter-hq', name: 'BuildBetter HQ', members: 4, initial: 'B', logoClass: 'bg-gradient-to-br from-chart-2/80 to-chart-2 text-primary-foreground', shortcut: '⌘2' },
    { id: 'slack', name: 'Slack', members: 48, initial: 'S', logoClass: 'bg-gradient-to-br from-chart-3/80 to-chart-3 text-primary-foreground', shortcut: '⌘3' },
    { id: 'figma', name: 'Figma', members: 80, initial: 'F', logoClass: 'bg-gradient-to-br from-foreground/80 to-foreground text-background', shortcut: '⌘4' },
]

export const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: House, active: true },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'recordings', label: 'Recordings', icon: AudioLines },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'shared', label: 'Shared With Me', icon: Share2, dot: true },
    { id: 'people', label: 'People', icon: Users },
]

export const dashboards: DashboardItem[] = [
    { id: 'issues-support', label: 'issues - support', active: true },
    { id: 'requests-sales', label: 'requests - sales' },
    { id: 'feedback-all', label: 'feedback - all' },
]

export const demoFolders: Folder[] = [
    { id: 'all-user-research', name: 'all user research', dot: true },
    { id: 'persona-prodops', name: 'persona - ProdOps' },
    { id: 'calls-sales', name: 'calls - sales' },
    { id: 'calls-strategy', name: 'calls - strategy', dot: true },
    { id: 'calls-standup', name: 'calls - standup' },
    { id: 'process-documentation', name: 'process - documentation' },
    { id: 'process-feedback', name: 'process - feedback' },
    { id: 'client-salesforce', name: 'client - salesforce', dot: true },
    { id: 'client-apple', name: 'client - apple' },
    { id: 'client-theragun', name: 'client - theragun', muted: true },
]

export const footerItems: FooterItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings2, dot: true },
    { id: 'invite', label: 'Invite people', icon: UserPlus },
    { id: 'help', label: 'Help & guides', icon: BookOpen },
]
