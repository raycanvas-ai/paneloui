'use client'

import type { ReactNode } from 'react'
import { cn } from '@/components/panelo/lib/utils'

import { NAV, SPACES, WORKSPACES } from './data'
import { WorkspaceSidebar } from './sidebar'

/* -------------------------------------------------------------------------- */
/*  sidebars/two preview: the workspace sidebar's states side by side, like a  */
/*  design sheet. Each one is live; the first listens for "/".     */
/* -------------------------------------------------------------------------- */

export { WorkspaceSidebar } from './sidebar'
export type { WorkspaceSidebarProps } from './sidebar'
export type { NavItem, SpaceItem, Workspace } from './data'

/** The same sidebar with only its words changed: what yours looks like with your own pages and spaces. */
const WORDS: Record<string, string> = {
    Notifications: 'Activity',
    Dashboard: 'Insights',
    Overview: 'Summary',
    Revenue: 'Pipeline',
    'Assigned to me': 'My tasks',
    Projects: 'Initiatives',
    Drafts: 'Notes',
    Schedule: 'Calendar',
    Customers: 'Clients',
    Company: 'Team',
    Everything: 'All work',
    Product: 'Engineering',
    'Website redesign': 'Platform',
    Homepage: 'Auth service',
    'Pricing page': 'Search API',
    Docs: 'Billing jobs',
    'Mobile app': 'Infrastructure',
    'Billing revamp': 'Reliability',
    Marketing: 'Growth',
    Personal: 'Private',
}
function relabel<T extends { label: string; children?: T[] }>(items: T[]): T[] {
    return items.map((item) => ({ ...item, label: WORDS[item.label] ?? item.label, children: item.children && relabel(item.children) }))
}

function State({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <figure className={cn('flex h-full shrink-0 flex-col gap-3', className)}>
            <figcaption className="ps-1 text-[12.5px] leading-4 font-medium text-muted-foreground">{label}</figcaption>
            <div className="flex min-h-0 flex-1">{children}</div>
        </figure>
    )
}

export default function WorkspaceSidebarSheet() {
    return (
        <div className="flex min-h-svh items-start bg-card font-sans text-foreground">
            <div className="flex h-[min(900px,calc(100svh-48px))] min-h-[680px] w-full snap-x snap-mandatory gap-8 overflow-x-auto px-6 py-6 sm:gap-10 xl:justify-center [&>*]:snap-start">
                <State label="Default">
                    <WorkspaceSidebar />
                </State>

                <State label="Searching">
                    <WorkspaceSidebar shortcut={false} defaultQuery="pricing" defaultActive="pricing" />
                </State>

                <State label="Your content">
                    <WorkspaceSidebar shortcut={false} workspaces={[{ ...WORKSPACES[0], name: 'Northstar' }]} nav={relabel(NAV)} spaces={relabel(SPACES)} defaultActive="revenue" />
                </State>
            </div>
        </div>
    )
}
