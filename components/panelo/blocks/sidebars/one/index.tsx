'use client'

import type { ReactNode } from 'react'
import { Bell, Clock, Folder, Inbox, LibraryBig, Search, Star, Users } from '@keyline-icons/react'

import { cn } from '@/components/panelo/lib/utils'

import { ResourceSidebar } from './sidebar'

/* -------------------------------------------------------------------------- */
/*  sidebars/one preview: every state of the resource sidebar side by side,    */
/*  like a design sheet. Each one is live; the first listens for "[".         */
/* -------------------------------------------------------------------------- */

export { ResourceSidebar } from './sidebar'
export type { ListItem, NavItem, RailItem, ResourceSidebarProps, Section } from './sidebar'

function State({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <figure className={cn('flex h-full shrink-0 flex-col gap-3', className)}>
            <figcaption className="ps-1 text-[12.5px] leading-4 font-medium text-muted-foreground">{label}</figcaption>
            <div className="flex min-h-0 flex-1">{children}</div>
        </figure>
    )
}

export default function ResourceSidebarSheet() {
    return (
        <div className="flex min-h-svh items-start bg-card font-sans text-foreground">
            <div className="flex h-[min(900px,calc(100svh-48px))] min-h-[680px] w-full snap-x snap-mandatory scroll-px-6 gap-8 overflow-x-auto px-6 py-6 sm:gap-10 xl:justify-center-safe [&>*]:snap-start">
                <State label="Rail and panel">
                    <ResourceSidebar shortcuts resizable layout="docked" />
                </State>

                <State label="Panel hidden">
                    <ResourceSidebar layout="docked" defaultPanel="hidden" defaultSpace="inbox" />
                </State>

                <State label="Customised">
                    <ResourceSidebar
                        layout="docked"
                        title="Workspace"
                        headerActions={
                            <button type="button" aria-label="Search" className="grid size-7 cursor-pointer place-items-center rounded-[8px] text-foreground/60 transition-colors outline-none hover:bg-foreground/[0.05] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                                <Search className="size-4" aria-hidden />
                            </button>
                        }
                        rail={[
                            [
                                { id: 'home', label: 'Library', icon: LibraryBig },
                                { id: 'inbox', label: 'Inbox', icon: Inbox, dot: true },
                                { id: 'alerts', label: 'Alerts', icon: Bell },
                            ],
                        ]}
                        railFooter={[]}
                        defaultSpace="home"
                        nav={[
                            { id: 'recent', label: 'Recent', icon: Clock },
                            { id: 'starred', label: 'Starred', icon: Star, count: 12 },
                            { id: 'shared', label: 'Shared with me', icon: Users, count: 4 },
                        ]}
                        more={[]}
                        sections={[
                            {
                                id: 'teams',
                                label: 'Teams',
                                addLabel: 'New team',
                                items: [
                                    { id: 'design', label: 'Design', icon: Folder, count: 38 },
                                    { id: 'growth', label: 'Growth', icon: Folder, count: 21 },
                                    { id: 'platform', label: 'Platform', icon: Folder, count: 57 },
                                ],
                            },
                            {
                                id: 'projects',
                                label: 'Projects',
                                addLabel: 'New project',
                                items: [
                                    { id: 'atlas', label: 'Atlas redesign', emoji: '🧭' },
                                    { id: 'pulse', label: 'Pulse analytics', emoji: '📈' },
                                    { id: 'harbor', label: 'Harbor billing', emoji: '⚓️' },
                                    { id: 'lumen', label: 'Lumen mobile app', emoji: '📱' },
                                ],
                            },
                        ]}
                        footer={false}
                        defaultActive="starred"
                    />
                </State>
            </div>
        </div>
    )
}
