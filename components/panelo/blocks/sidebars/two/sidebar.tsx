'use client'

import { useEffect, useRef, useState } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Check, ChevronDown, ChevronsUpDown, Layers, Search, Sparkle, SquarePlus } from '@keyline-icons/react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { cn } from '@/components/panelo/lib/utils'

import { type NavItem, NAV, SPACE_TONES, type SpaceItem, SPACES, type Workspace, WORKSPACES } from './data'

/* -------------------------------------------------------------------------- */
/*  Workspace sidebar: switcher, a search that filters everything below it    */
/*  ("/" focuses it), folding navigation, a tree of spaces you can add to,     */
/*  and an upgrade card pinned to the foot.                                    */
/* -------------------------------------------------------------------------- */

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
const row = cn(
    'group/row flex h-8 w-full min-w-0 items-center gap-2.5 rounded-lg pe-2 text-start text-[14px] text-foreground/90 transition-[background-color,color,scale] duration-150 ease-out hover:bg-foreground/[0.04] hover:text-foreground active:scale-[0.985] motion-reduce:transition-none',
    focusRing,
)
const current = 'bg-foreground/[0.055] text-foreground hover:bg-foreground/[0.055]'
const glyph = 'size-4 shrink-0 text-foreground/70'
const iconButton = cn('grid size-6 place-items-center rounded-md text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-foreground/[0.05] hover:text-foreground active:scale-90 motion-reduce:transition-none', focusRing)
/** Each level of a tree steps in by this much. */
const STEP = 20

/** Height that eases open and shut (grid rows 0fr → 1fr); folded rows are inert so focus skips them. */
function Fold({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div inert={!open} className={cn('grid transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none', open ? 'grid-rows-[1fr] opacity-100 duration-250' : 'grid-rows-[0fr] opacity-0 duration-200')}>
            <div className="min-h-0 overflow-hidden">{children}</div>
        </div>
    )
}

/** Keeps items whose label matches, and the parents that lead to them. */
function prune<T extends { label: string; children?: T[] }>(items: T[], query: string): T[] {
    if (!query) return items
    return items.flatMap((item) => {
        if (item.label.toLowerCase().includes(query)) return [item]
        const kids = item.children ? prune(item.children, query) : []
        return kids.length ? [{ ...item, children: kids }] : []
    })
}

type TreeProps<T extends NavItem | SpaceItem> = {
    items: T[]
    depth?: number
    active: string
    folded: ReadonlySet<string>
    /** While searching, every branch stays open. */
    searching: boolean
    onSelect: (id: string) => void
    onToggle: (id: string) => void
    /** Top-level spaces draw their tile; nav keeps its plain icons. */
    tiles?: boolean
    /** Nav shows its chevron; the spaces tree only on hover, as the tile is the marker. */
    chevron?: 'always' | 'hover'
}

function Tree<T extends NavItem | SpaceItem>({ items, depth = 0, active, folded, searching, onSelect, onToggle, tiles, chevron = 'always' }: TreeProps<T>) {
    return (
        <ul className="flex flex-col gap-px">
            {items.map((item) => {
                const kids = item.children as T[] | undefined
                const open = searching || !folded.has(item.id)
                const tone = tiles && depth === 0 ? (item as SpaceItem).tone : undefined
                const ItemIcon = item.icon
                return (
                    <li key={item.id}>
                        <BareButton
                            aria-current={!kids && active === item.id ? 'page' : undefined}
                            aria-expanded={kids ? open : undefined}
                            onClick={() => (kids ? onToggle(item.id) : onSelect(item.id))}
                            style={{ paddingInlineStart: 8 + depth * STEP }}
                            className={cn(row, !kids && active === item.id && current)}>
                            {tone ? (
                                <span aria-hidden="true" className={cn('grid size-4 shrink-0 place-items-center rounded-[4.5px] text-white', tone)}>
                                    <ItemIcon className="size-[11px]" strokeWidth={2.4} />
                                </span>
                            ) : (
                                <ItemIcon className={glyph} aria-hidden="true" />
                            )}
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {kids ? (
                                <ChevronDown
                                    aria-hidden="true"
                                    className={cn(
                                        'size-4 shrink-0 text-muted-foreground transition-[rotate,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
                                        !open && '-rotate-90 rtl:rotate-90',
                                        chevron === 'hover' && 'opacity-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100',
                                    )}
                                />
                            ) : null}
                        </BareButton>
                        {kids ? (
                            <Fold open={open}>
                                <div className="pt-px">
                                    <Tree items={kids} depth={depth + 1} active={active} folded={folded} searching={searching} onSelect={onSelect} onToggle={onToggle} tiles={tiles} chevron={chevron} />
                                </div>
                            </Fold>
                        ) : null}
                    </li>
                )
            })}
        </ul>
    )
}

/** The workspace mark: a soft two-tone tile with a solid triangle, as in most product logos at this size. */
function Mark({ workspace, className }: { workspace: Workspace; className?: string }) {
    return (
        <span aria-hidden="true" className={cn('grid size-7 shrink-0 place-items-center rounded-lg bg-linear-to-br ring-1 ring-foreground/[0.06] ring-inset', workspace.tone, className)}>
            <svg viewBox="0 0 12 12" className="size-3 text-foreground">
                <path d="M6 1.75 10.5 10H1.5Z" fill="currentColor" strokeLinejoin="round" stroke="currentColor" strokeWidth="1" />
            </svg>
        </span>
    )
}

export interface WorkspaceSidebarProps {
    workspaces?: Workspace[]
    nav?: NavItem[]
    spaces?: SpaceItem[]
    /** The id of the page that starts selected. */
    defaultActive?: string
    /** Text the search starts with. */
    defaultQuery?: string
    /** The signed-in person's picture. */
    avatar?: string
    /** "/" anywhere focuses this sidebar's search. Turn off when more than one sidebar is on the page. */
    shortcut?: boolean
    /** Show the upgrade card at the foot. */
    upgrade?: boolean
    onNavigate?: (id: string) => void
    onUpgrade?: () => void
    className?: string
}

export function WorkspaceSidebar({
    workspaces = WORKSPACES,
    nav = NAV,
    spaces: initialSpaces = SPACES,
    defaultActive = 'revenue',
    defaultQuery = '',
    avatar = '/avatars/livia-saris.webp',
    shortcut = true,
    upgrade = true,
    onNavigate,
    onUpgrade,
    className,
}: WorkspaceSidebarProps) {
    const [workspace, setWorkspace] = useState(workspaces[0])
    const [active, setActive] = useState(defaultActive)
    const [folded, setFolded] = useState<ReadonlySet<string>>(() => new Set())
    const [spaces, setSpaces] = useState(initialSpaces)
    const [query, setQuery] = useState(defaultQuery)
    const [creating, setCreating] = useState(false)
    const search = useRef<HTMLInputElement>(null)

    // "/" anywhere outside a text field jumps to search, as the hint says.
    useEffect(() => {
        if (!shortcut) return
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement
            if (event.key !== '/' || event.metaKey || event.ctrlKey || target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
            event.preventDefault()
            search.current?.focus()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [shortcut])

    const q = query.trim().toLowerCase()
    const shownNav = prune(nav, q)
    const shownSpaces = prune(spaces, q)
    const select = (id: string) => {
        setActive(id)
        onNavigate?.(id)
    }
    const toggle = (id: string) =>
        setFolded((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    const create = (label: string) => {
        const id = `space-${spaces.length}-${label.toLowerCase().replace(/\W+/g, '-')}`
        setSpaces((all) => [...all, { id, label, icon: Layers, tone: SPACE_TONES[(all.length - initialSpaces.length) % SPACE_TONES.length] }])
        select(id)
    }
    const tree = { active, folded, searching: Boolean(q), onSelect: select, onToggle: toggle }

    return (
        <aside aria-label="Sidebar" className={cn('flex h-full w-[272px] shrink-0 flex-col rounded-2xl bg-card text-card-foreground ring-1 ring-border/70 shadow-[0_1px_2px_rgb(0_0_0/0.03)]', className)}>
            <div className="flex h-14 shrink-0 items-center gap-2 px-3 pt-1">
                <DropdownMenu>
                    <DropdownMenuTrigger className={cn('-ms-0.5 flex min-w-0 items-center gap-2.5 rounded-lg py-1 ps-0.5 pe-1.5 transition-[background-color,scale] duration-150 ease-out hover:bg-foreground/[0.04] active:scale-[0.98] motion-reduce:transition-none', focusRing)}>
                        <Mark workspace={workspace} />
                        <span className="truncate text-[15px] font-medium tracking-[-0.01em]">{workspace.name}</span>
                        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        {workspaces.map((w) => (
                            <DropdownMenuItem key={w.id} onClick={() => setWorkspace(w)} className="gap-2.5 py-1.5 text-[13.5px]">
                                <Mark workspace={w} className="size-6 rounded-md" />
                                <span className="flex-1 truncate">{w.name}</span>
                                {w.id === workspace.id ? <Check className="size-4 text-foreground/70" aria-hidden="true" /> : null}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <BareButton aria-label="Account" className={cn('ms-auto shrink-0 rounded-full transition-[scale] duration-150 ease-out active:scale-95 motion-reduce:transition-none', focusRing)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar} alt="" className="size-7 rounded-full object-cover ring-1 ring-foreground/[0.06]" />
                </BareButton>
            </div>

            <nav aria-label="Workspace" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pt-2 pb-3 [scrollbar-width:thin] *:shrink-0">
                <label className={cn(row, 'cursor-text ps-2 focus-within:bg-foreground/[0.04] active:scale-100')}>
                    <Search className={glyph} aria-hidden="true" />
                    <input
                        ref={search}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key !== 'Escape') return
                            setQuery('')
                            event.currentTarget.blur()
                        }}
                        placeholder="Search"
                        aria-label="Search the sidebar"
                        autoComplete="off"
                        className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-foreground/90 focus:placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                    />
                    {shortcut ? (
                    <kbd className={cn('grid h-5 min-w-5 place-items-center rounded-[5px] bg-foreground/[0.06] px-1 font-sans text-[11.5px] text-muted-foreground transition-opacity duration-150', query && 'opacity-0')}>/</kbd>
                    ) : null}
                </label>

                <div className="mt-px">
                    <Tree items={shownNav} {...tree} />
                </div>

                <div className="mt-6 flex h-8 items-center ps-2 pe-1">
                    <h2 className="flex-1 text-[13px] text-muted-foreground">Spaces</h2>
                    <BareButton aria-label="Search spaces" onClick={() => search.current?.focus()} className={iconButton}>
                        <Search className="size-4" aria-hidden="true" />
                    </BareButton>
                    <BareButton aria-label="New space" onClick={() => setCreating(true)} className={iconButton}>
                        <SquarePlus className="size-4" aria-hidden="true" />
                    </BareButton>
                </div>

                <Tree items={shownSpaces} {...tree} tiles chevron="hover" />
                {q && !shownNav.length && !shownSpaces.length ? <p className="px-2 py-2 text-[13px] text-muted-foreground">Nothing matches “{query.trim()}”</p> : null}

                {creating ? (
                    <NewSpace
                        onCreate={(label) => {
                            create(label)
                            setCreating(false)
                        }}
                        onCancel={() => setCreating(false)}
                    />
                ) : q ? null : (
                    <BareButton onClick={() => setCreating(true)} className={cn(row, 'mt-px ps-2 text-muted-foreground hover:text-foreground')}>
                        <SquarePlus className="size-4 shrink-0" aria-hidden="true" />
                        Create space
                    </BareButton>
                )}
            </nav>

            {upgrade ? (
                <div className="shrink-0 px-3 pb-3">
                    <section aria-labelledby="sidebar-upgrade" className="rounded-xl border border-dashed border-border p-3.5">
                        <h2 id="sidebar-upgrade" className="flex items-center gap-2 text-[14.5px] font-medium tracking-[-0.01em]">
                            <Sparkle className="size-4 text-foreground/80" aria-hidden="true" />
                            Try {workspace.name} AI
                        </h2>
                        <p className="mt-1.5 text-[13px] leading-5 text-pretty text-muted-foreground">Upgrade for file uploads, smarter answers and unlimited AI search.</p>
                        <BareButton
                            onClick={onUpgrade}
                            className={cn(
                                'mt-3 inline-flex h-8 items-center rounded-lg bg-linear-to-r from-tone-violet-solid to-tone-orange-solid px-3.5 text-[13.5px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-[filter,scale] duration-150 ease-out hover:brightness-105 active:scale-[0.97] motion-reduce:transition-none',
                                focusRing,
                            )}>
                            Upgrade
                        </BareButton>
                    </section>
                </div>
            ) : null}
        </aside>
    )
}

/** An inline row for a new space's name: Enter adds it, Escape or leaving it empty cancels. */
function NewSpace({ onCreate, onCancel }: { onCreate: (label: string) => void; onCancel: () => void }) {
    const input = useRef<HTMLInputElement>(null)
    useEffect(() => input.current?.focus(), [])
    return (
        <div className="mt-px flex h-8 items-center gap-2.5 rounded-lg bg-foreground/[0.04] ps-2 pe-2 transition-[opacity,translate] duration-200 ease-out starting:-translate-y-0.5 starting:opacity-0 motion-reduce:transition-none">
            <span aria-hidden="true" className="size-4 shrink-0 rounded-[4.5px] border border-dashed border-muted-foreground/60" />
            <input
                ref={input}
                aria-label="New space name"
                placeholder="Space name"
                autoComplete="off"
                onKeyDown={(event) => {
                    const label = event.currentTarget.value.trim()
                    if (event.key === 'Enter' && label) onCreate(label)
                    if (event.key === 'Escape') onCancel()
                }}
                onBlur={(event) => !event.currentTarget.value.trim() && onCancel()}
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
        </div>
    )
}
