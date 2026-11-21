'use client'

import { useState, type ReactNode } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Check, ChevronRight, ChevronsUpDown, CircleDashed, Folder as FolderIcon, GripVertical, Plus, X, type LucideIcon } from 'lucide-react'

import { Sheet, SheetContent } from '@/components/panelo/ui/sheet'
import { Button } from '@/components/panelo/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/panelo/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { cn } from '@/components/panelo/lib/utils'

import { dashboards, demoFolders, footerItems, navItems, workspaces, type Folder, type NavItem } from './data'

export interface WorkspaceSidebarProps {
    /** Folder list; pass an empty array to show the empty state. */
    folders?: Folder[]
    className?: string
}

const hideScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
const rowBase = 'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
const rowActive = 'border border-border/70 bg-background font-medium text-foreground shadow-sm'
const rowIdle = 'text-muted-foreground hover:bg-accent hover:text-foreground'
const avatarRing = 'ring-1 ring-inset ring-white/15'

function Kbd({ children, className }: { children: ReactNode; className?: string }) {
    return <kbd className={cn('rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-4 text-muted-foreground', className)}>{children}</kbd>
}

function NotificationDot({ label }: { label: string }) {
    return (
        <span className="ml-auto flex items-center pl-2">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            <span className="sr-only">{label}</span>
        </span>
    )
}

/** Decorative macOS window chrome — drop this row when embedding in your own app shell. */
function TrafficLights() {
    return (
        <span className="flex items-center gap-2" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
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
                    className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-open:border-primary/50 data-open:ring-2 data-open:ring-primary/30">
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold shadow-sm', avatarRing, active.logoClass)} aria-hidden>
                        {active.initial}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">{active.name}</span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="dark w-72 rounded-2xl bg-popover/95 p-1.5 text-popover-foreground shadow-xl ring-1 ring-foreground/10 backdrop-blur-md">
                <DropdownMenuLabel className="px-2.5 py-2 text-xs font-medium text-muted-foreground">Switch Workspace</DropdownMenuLabel>
                {workspaces.map((workspace) => (
                    <DropdownMenuItem key={workspace.id} className="group gap-2 rounded-xl px-1.5 py-2">
                        <GripVertical className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-150 group-focus:opacity-100 group-hover:opacity-100" aria-hidden />
                        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold shadow-sm', avatarRing, workspace.logoClass)} aria-hidden>
                            {workspace.initial}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                            <span className={cn('truncate text-sm text-foreground', workspace.active ? 'font-semibold' : 'font-medium')}>{workspace.name}</span>
                            <span className="text-xs text-muted-foreground">{workspace.members} members</span>
                        </span>
                        {workspace.active ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground">
                                <Check className="size-3.5 text-background" strokeWidth={2.5} aria-hidden />
                                <span className="sr-only">Active workspace</span>
                            </span>
                        ) : (
                            workspace.shortcut && <Kbd>{workspace.shortcut}</Kbd>
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-3 rounded-xl px-2 py-2 text-muted-foreground">
                    <Plus className="size-5" strokeWidth={2} aria-hidden />
                    <span className="flex-1 text-sm">Create new workspace</span>
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
            className={cn(rowBase, item.active ? rowActive : rowIdle)}>
            <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            {item.dot && <NotificationDot label="New items shared with you" />}
        </BareButton>
    )
}

function SidebarGroup({ label, defaultOpen = true, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-xs font-medium tracking-wide text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <ChevronRight className={cn('size-4 shrink-0 transition-transform duration-200 ease-out', open && 'rotate-90')} aria-hidden />
                    {label}
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
        </Collapsible>
    )
}

function DashboardsGroup() {
    return (
        <SidebarGroup label="Dashboards" defaultOpen>
            <ul className="flex flex-col gap-0.5">
                {dashboards.map((dashboard) => (
                    <li key={dashboard.id}>
                        <BareButton
                            aria-current={dashboard.active ? 'page' : undefined}
                            className={cn(rowBase, dashboard.active ? rowActive : rowIdle)}>
                            <CircleDashed className="size-5 shrink-0" strokeWidth={2} aria-hidden />
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
        <SidebarGroup label="Folders" defaultOpen>
            {folders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                    <span className="grid size-12 place-items-center rounded-2xl bg-muted/60" aria-hidden>
                        <FolderIcon className="size-6 text-muted-foreground/60" strokeWidth={2} />
                    </span>
                    <p className="text-sm text-muted-foreground">No Folders</p>
                    <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg px-3 text-sm shadow-sm">
                        New Folder
                        <Kbd>N</Kbd>
                    </Button>
                </div>
            ) : (
                <ul className="flex flex-col gap-0.5">
                    {folders.map((folder) => (
                        <li key={folder.id}>
                            <BareButton
                                className={cn(rowBase, rowIdle, folder.dot && 'font-medium text-foreground', folder.muted && 'opacity-70')}>
                                <FolderIcon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
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
        <BareButton className={cn(rowBase, rowIdle)}>
            <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            {dot && <NotificationDot label="Settings need attention" />}
        </BareButton>
    )
}

/** Shared sidebar content used by both the desktop rail and the mobile drawer. */
function SidebarBody({ folders, onClose }: { folders: Folder[]; onClose?: () => void }) {
    return (
        <>
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
                <TrafficLights />
                {onClose ? (
                    <BareButton
                        onClick={onClose}
                        aria-label="Close navigation"
                        className="-mr-1 grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <X className="size-5" strokeWidth={1.75} aria-hidden />
                    </BareButton>
                ) : null}
            </div>

            <div className="px-3 pt-1 pb-2">
                <WorkspaceSwitcher />
            </div>

            <div className={cn('relative flex-1 overflow-y-auto px-3 pb-4 [mask-image:linear-gradient(to_bottom,transparent,#000_20px,#000_calc(100%-20px),transparent)]', hideScrollbar)}>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <NavRow key={item.id} item={item} />
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
                {footerItems.map((item) => (
                    <FooterRow key={item.id} icon={item.icon} label={item.label} dot={item.dot} />
                ))}
            </div>
        </>
    )
}

/** Desktop sidebar rail — hidden below `lg`, where the mobile drawer takes over. */
export function WorkspaceSidebar({ folders = demoFolders, className }: WorkspaceSidebarProps) {
    return (
        <nav
            aria-label="Workspace"
            className={cn('hidden h-full w-[280px] shrink-0 flex-col border-r border-border/60 bg-muted/40 lg:flex', className)}>
            <SidebarBody folders={folders} />
        </nav>
    )
}

/** Off-canvas workspace drawer for small screens. Controlled by the host. */
export function WorkspaceMobileSidebar({ open, onClose, folders = demoFolders, className }: { open: boolean; onClose: () => void; folders?: Folder[]; className?: string }) {
    return (
        <Sheet side="left" open={open} onOpenChange={(next) => !next && onClose()}>
            <SheetContent
                aria-label="Workspace navigation"
                overlayClassName="bg-foreground/40 backdrop-blur-[1px]"
                className={cn('w-[280px] max-w-[85%] border-r border-border/60 bg-muted/40 shadow-2xl lg:hidden', className)}>
                <SidebarBody folders={folders} onClose={onClose} />
            </SheetContent>
        </Sheet>
    )
}
