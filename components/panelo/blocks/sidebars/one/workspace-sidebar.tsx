'use client'

import { useState, type ReactNode } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Check, ChevronRight, ChevronsUpDown, CircleDashed, CircleHelp, Folder as FolderIcon, GripVertical, Plus, Settings, UserPlus, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/panelo/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/panelo/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { cn } from '@/components/panelo/lib/utils'

import { dashboards, demoFolders, navItems, workspaces, type Folder, type NavItem } from './data'

export interface WorkspaceSidebarProps {
    folders?: Folder[]
    className?: string
}

function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return <kbd className={cn('rounded border border-border bg-muted px-1 py-px font-mono text-[10px] leading-4 text-muted-foreground', className)}>{children}</kbd>
}

function NotificationDot({ label }: { label: string }) {
    return (
        <span className="ml-auto flex items-center">
            <span
                className="size-1.5 rounded-full bg-primary"
                aria-hidden
            />
            <span className="sr-only">{label}</span>
        </span>
    )
}

function WorkspaceSwitcher() {
    const active = workspaces.find((workspace) => workspace.active) ?? workspaces[0]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none data-open:bg-accent">
                    <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold', active.logoClass)} aria-hidden>
                        {active.initial}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{active.name}</span>
                    <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="dark w-72 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-xl">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Switch Workspace</DropdownMenuLabel>
                {workspaces.map((workspace) => (
                    <DropdownMenuItem
                        key={workspace.id}
                        className="group gap-2 rounded-lg px-1.5 py-2">
                        <GripVertical
                            className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 group-focus:opacity-100 group-hover:opacity-100"
                            aria-hidden
                        />
                        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold', workspace.logoClass)} aria-hidden>
                            {workspace.initial}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">{workspace.name}</span>
                            <span className="text-xs text-muted-foreground">{workspace.members} members</span>
                        </span>
                        {workspace.active ? (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground">
                                <Check className="size-3 text-background" aria-hidden />
                                <span className="sr-only">Active workspace</span>
                            </span>
                        ) : (
                            workspace.shortcut && <Kbd>{workspace.shortcut}</Kbd>
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2.5 rounded-lg px-2 py-2 text-muted-foreground">
                    <Plus
                        className="size-4"
                        aria-hidden
                    />
                    <span className="flex-1">Create new workspace</span>
                    <Kbd>⌘N</Kbd>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function NavRow({ item }: { item: NavItem }) {
    const Icon = item.icon

    return (
        <BareButton
            aria-current={item.active ? 'page' : undefined}
            className={cn(
                'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                item.active ? 'border border-border/60 bg-background font-medium text-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}>
            <Icon
                className="size-4 shrink-0"
                aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            {item.dot && <NotificationDot label="New items shared with you" />}
        </BareButton>
    )
}

function SidebarGroup({ label, defaultOpen = true, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className="flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                    <ChevronRight
                        className={cn('size-3 shrink-0 transition-transform duration-200 ease-out', open && 'rotate-90')}
                        aria-hidden
                    />
                    {label}
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
        </Collapsible>
    )
}

function DashboardsGroup() {
    return (
        <SidebarGroup label="Dashboards">
            <ul className="flex flex-col gap-0.5">
                {dashboards.map((dashboard) => (
                    <li key={dashboard.id}>
                        <BareButton
                            aria-current={dashboard.active ? 'true' : undefined}
                            className={cn(
                                'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                                dashboard.active ? 'border border-border/60 bg-background font-medium text-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}>
                            <CircleDashed
                                className="size-4 shrink-0"
                                aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate text-left">{dashboard.label}</span>
                        </BareButton>
                    </li>
                ))}
            </ul>
        </SidebarGroup>
    )
}

function FoldersGroup({ folders }: { folders: Folder[] }) {
    return (
        <SidebarGroup label="Folders">
            {folders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                    <FolderIcon
                        className="size-5 text-muted-foreground/70"
                        aria-hidden
                    />
                    <p className="text-xs text-muted-foreground">No Folders</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 rounded-lg px-2.5 text-xs">
                        New Folder
                        <Kbd>N</Kbd>
                    </Button>
                </div>
            ) : (
                <ul className="flex flex-col gap-0.5">
                    {folders.map((folder) => (
                        <li key={folder.id}>
                            <BareButton
                                className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                                <FolderIcon
                                    className="size-4 shrink-0"
                                    aria-hidden
                                />
                                <span className="min-w-0 flex-1 truncate text-left">{folder.name}</span>
                                {folder.dot && <NotificationDot label="Folder has new activity" />}
                            </BareButton>
                        </li>
                    ))}
                </ul>
            )}
        </SidebarGroup>
    )
}

function FooterRow({ icon: Icon, label, dot }: { icon: LucideIcon; label: string; dot?: boolean }) {
    return (
        <BareButton
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
            <Icon
                className="size-4 shrink-0"
                aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            {dot && <NotificationDot label="Settings need attention" />}
        </BareButton>
    )
}

export function WorkspaceSidebar({ folders = demoFolders, className }: WorkspaceSidebarProps) {
    return (
        <nav
            aria-label="Workspace"
            className={cn('flex h-full w-[280px] shrink-0 flex-col border-r border-border/60 bg-muted/40', className)}>
            <div className="p-3 pb-2">
                <WorkspaceSwitcher />
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <NavRow
                            key={item.id}
                            item={item}
                        />
                    ))}
                </div>
                <div className="mt-5">
                    <DashboardsGroup />
                </div>
                <div className="mt-5">
                    <FoldersGroup folders={folders} />
                </div>
            </div>
            <div className="flex flex-col gap-0.5 border-t border-border/60 p-3">
                <FooterRow
                    icon={Settings}
                    label="Settings"
                    dot
                />
                <FooterRow
                    icon={UserPlus}
                    label="Invite people"
                />
                <FooterRow
                    icon={CircleHelp}
                    label="Help & guides"
                />
            </div>
        </nav>
    )
}
