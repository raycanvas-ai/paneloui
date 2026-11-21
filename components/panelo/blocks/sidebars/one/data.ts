import { FileText, Home, MessageSquare, Share2, Users, Video, type LucideIcon } from 'lucide-react'

export interface Workspace {
    id: string
    name: string
    members: number
    initial: string
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
}

export const workspaces: Workspace[] = [
    { id: 'acmeflow', name: 'Acmeflow', members: 23, initial: 'A', logoClass: 'bg-chart-4/20 text-chart-4', active: true },
    { id: 'acmeflow-hq', name: 'Acmeflow HQ', members: 48, initial: 'A', logoClass: 'bg-foreground text-background', shortcut: '⌘2' },
    { id: 'northpeak', name: 'Northpeak', members: 64, initial: 'N', logoClass: 'bg-chart-3/20 text-chart-3', shortcut: '⌘3' },
    { id: 'lumen-health', name: 'Lumen Health', members: 89, initial: 'L', logoClass: 'bg-chart-5/20 text-chart-5', shortcut: '⌘4' },
]

export const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, active: true },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'recordings', label: 'Recordings', icon: Video },
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
    { id: 'client-theragun', name: 'client - theragun' },
]
