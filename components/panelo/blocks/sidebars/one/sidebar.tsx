'use client'

import { Fragment, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactElement, type ReactNode } from 'react'
import { MoreHorizontal, PanelLeft, PanelLeftOpen, Plus } from '@keyline-icons/react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { ScrollArea } from '@/components/panelo/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/panelo/ui/tooltip'
import { cn } from '@/components/panelo/lib/utils'

import * as sample from './data'
import type { ListItem, NavItem, RailItem, Section } from './data'

/* -------------------------------------------------------------------------- */
/*  Resource sidebar: an icon rail for the app's spaces beside a panel for the */
/*  current one. The panel holds a title, the space's pages (with a "More"    */
/*  flyout for the rest), scrolling sections of entries and a footer action.  */
/*                                                                            */
/*  - Hide the panel from its header button, "[" or by choosing; bring it     */
/*    back from the rail (the top button, or any space).                      */
/*  - Drag its edge (or focus it and use the arrow keys) to resize it;        */
/*    double-click the edge to reset.                                         */
/*  - Below `overlayBelow` px of viewport (or with `layout="overlay"`) it     */
/*    floats over the page instead of pushing it, and closes on Escape, a     */
/*    click outside, or a choice.                                             */
/*  Every list, label and size is a prop; either half can be left out.        */
/* -------------------------------------------------------------------------- */

export type { ListItem, NavItem, RailItem, Section } from './data'

type PanelState = 'open' | 'hidden'

export type ResourceSidebarProps = {
    /** Panel heading. */
    title?: string
    /** Extra buttons in the panel header, before the hide button. */
    headerActions?: ReactNode
    /** Rail icons in groups (a gap goes between groups), or `false` for no rail. */
    rail?: RailItem[][] | false
    /** Rail icons pinned to the bottom, above the account. */
    railFooter?: RailItem[]
    /** Runs for rail items marked `action` (like "New"). */
    onRailAction?: (id: string) => void
    /** The mark at the top of the rail. While the panel is hidden, a "Show panel" button takes its place. */
    brand?: ReactNode
    /** The account button at the foot of the rail. */
    account?: ReactNode
    /** The panel's main pages. */
    nav?: NavItem[]
    /** Pages behind "More", in groups split by a rule. An empty array hides "More". */
    more?: NavItem[][]
    moreLabel?: string
    /** Scrolling sections under the pages, or `false` for none. */
    sections?: Section[] | false
    /** A pinned action under the sections, or `false`. */
    footer?: NavItem | false
    onFooter?: () => void
    /** Panel visibility, uncontrolled or controlled. */
    defaultPanel?: PanelState
    panel?: PanelState
    onPanelChange?: (panel: PanelState) => void
    /** Show the header's hide button. With a rail it defaults to on. */
    collapsible?: boolean
    /** The selected rail space. */
    defaultSpace?: string
    space?: string
    onSpaceChange?: (id: string) => void
    /** The selected page or entry. */
    defaultActive?: string
    active?: string
    onActiveChange?: (id: string) => void
    /** Panel width in px, uncontrolled or controlled. */
    defaultWidth?: number
    width?: number
    onWidthChange?: (width: number) => void
    /** Let people drag the panel's edge to resize it, between `minWidth` and `maxWidth`. */
    resizable?: boolean
    minWidth?: number
    maxWidth?: number
    /** `auto` docks the panel and floats it over the page below `overlayBelow`; `docked` and `overlay` force one. */
    layout?: 'auto' | 'docked' | 'overlay'
    /** With `layout="auto"`, the viewport width (px) below which the panel floats over the page. */
    overlayBelow?: number
    /** Row height: 32px, or 28px when compact. */
    density?: 'default' | 'compact'
    /** Listen for "[" to show and hide the panel. Give it to one sidebar per page. */
    shortcuts?: boolean
    className?: string
    railClassName?: string
    panelClassName?: string
}

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
const RAIL = 56

/** Controlled when `value` is given, otherwise keeps its own state; either way `onChange` hears about it. */
function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
    const [own, setOwn] = useState(initial)
    const current = value ?? own
    const set = (next: T) => {
        if (value === undefined) setOwn(next)
        onChange?.(next)
    }
    return [current, set] as const
}

/** True while the viewport is narrower than `below` px. */
function useNarrow(below: number | false) {
    const [narrow, setNarrow] = useState(false)
    useEffect(() => {
        if (below === false) return setNarrow(false)
        const query = window.matchMedia(`(max-width: ${below - 0.02}px)`)
        const update = () => setNarrow(query.matches)
        update()
        query.addEventListener('change', update)
        return () => query.removeEventListener('change', update)
    }, [below])
    return narrow
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function ResourceSidebar({
    title = 'Resources',
    headerActions,
    rail = sample.railGroups,
    railFooter = sample.railFooter,
    onRailAction,
    brand = <BrandMark />,
    account = <AccountMark />,
    nav = sample.nav,
    more = sample.more,
    moreLabel = 'More',
    sections = sample.sections,
    footer = sample.footer,
    onFooter,
    defaultPanel = 'open',
    panel: panelProp,
    onPanelChange,
    collapsible,
    defaultSpace = 'resources',
    space: spaceProp,
    onSpaceChange,
    defaultActive = 'everything',
    active: activeProp,
    onActiveChange,
    defaultWidth = 260,
    width: widthProp,
    onWidthChange,
    resizable = false,
    minWidth = 220,
    maxWidth = 400,
    layout = 'auto',
    overlayBelow = 768,
    density = 'default',
    shortcuts = false,
    className,
    railClassName,
    panelClassName,
}: ResourceSidebarProps) {
    const [panel, setPanel] = useControllable(panelProp, defaultPanel, onPanelChange)
    const [space, setSpace] = useControllable(spaceProp, defaultSpace, onSpaceChange)
    const [active, setActiveState] = useControllable(activeProp, defaultActive, onActiveChange)
    const [width, setWidth] = useControllable(widthProp, defaultWidth, onWidthChange)
    const [added, setAdded] = useState<Record<string, ListItem[]>>({})
    const [dragging, setDragging] = useState(false)
    const root = useRef<HTMLElement>(null)
    const showButton = useRef<HTMLButtonElement>(null)

    const hasRail = rail !== false
    const narrow = useNarrow(hasRail && layout === 'auto' ? overlayBelow : false)
    // Without a rail nothing could bring a hidden panel back, so it always shows.
    const open = !hasRail || panel === 'open'
    const overlay = hasRail && (layout === 'overlay' || narrow)
    const canHide = hasRail && (collapsible ?? true)
    const w = clamp(width, minWidth, maxWidth)

    const show = () => setPanel('open')
    const hide = (refocus = false) => {
        setPanel('hidden')
        if (refocus) requestAnimationFrame(() => showButton.current?.focus())
    }
    // In overlay mode, choosing a page also puts the panel away, like a mobile menu.
    const setActive = (id: string) => {
        setActiveState(id)
        if (overlay) hide()
    }

    // Entering overlay mode starts closed, so a phone never opens on a page-covering panel.
    const wasNarrow = useRef(narrow)
    useEffect(() => {
        if (narrow && !wasNarrow.current && panel === 'open') setPanel('hidden')
        wasNarrow.current = narrow
    })

    // "[" toggles; in overlay mode Escape and a click outside close.
    useEffect(() => {
        if (!hasRail) return
        const onKey = (e: globalThis.KeyboardEvent) => {
            const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
            if (overlay && open && e.key === 'Escape') return hide(true)
            if (!shortcuts || typing || e.metaKey || e.ctrlKey || e.altKey || e.key !== '[') return
            e.preventDefault()
            if (open) hide()
            else show()
        }
        const onPointer = (e: globalThis.PointerEvent) => {
            if (overlay && open && root.current && !root.current.contains(e.target as Node) && !(e.target as Element).closest?.('[role="menu"]')) hide()
        }
        window.addEventListener('keydown', onKey)
        window.addEventListener('pointerdown', onPointer)
        return () => {
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('pointerdown', onPointer)
        }
    })

    // Edge drag: pointer capture keeps the drag going outside the handle; RTL flips the direction.
    const startResize = (e: PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        e.preventDefault()
        const handle = e.currentTarget
        handle.setPointerCapture(e.pointerId)
        const startX = e.clientX
        const startW = w
        const dir = getComputedStyle(handle).direction === 'rtl' ? -1 : 1
        setDragging(true)
        const move = (ev: globalThis.PointerEvent) => setWidth(clamp(startW + (ev.clientX - startX) * dir, minWidth, maxWidth))
        const end = () => {
            setDragging(false)
            handle.removeEventListener('pointermove', move)
            handle.removeEventListener('pointerup', end)
            handle.removeEventListener('pointercancel', end)
        }
        handle.addEventListener('pointermove', move)
        handle.addEventListener('pointerup', end)
        handle.addEventListener('pointercancel', end)
    }
    const resizeKey = (e: KeyboardEvent<HTMLDivElement>) => {
        const dir = getComputedStyle(e.currentTarget).direction === 'rtl' ? -1 : 1
        const step = e.shiftKey ? 48 : 16
        const next = { ArrowRight: w + step * dir, ArrowLeft: w - step * dir, Home: minWidth, End: maxWidth }[e.key]
        if (next === undefined) return
        e.preventDefault()
        setWidth(clamp(next, minWidth, maxWidth))
    }

    const addTo = (section: Section) => {
        if (section.onAdd) return section.onAdd()
        const list = added[section.id] ?? []
        const n = list.length + 1
        const item: ListItem = { id: `${section.id}-untitled-${n}`, label: n > 1 ? `Untitled ${n}` : 'Untitled', emoji: '📁' }
        setAdded((all) => ({ ...all, [section.id]: [...list, item] }))
        setActiveState(item.id)
        // Next frame, once the row exists: bring it into view at the end of its section.
        requestAnimationFrame(() => document.getElementById(`resource-sidebar-${item.id}`)?.scrollIntoView({ block: 'nearest' }))
    }
    const moreActive = more.flat().find((item) => item.id === active)

    const body = (
        <>
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center gap-1 ps-[18px] pe-2 pt-1">
                <h2 className="min-w-0 flex-1 truncate text-[15px] leading-5 font-semibold tracking-[-0.006em]">{title}</h2>
                {headerActions}
                {canHide ? (
                    <Tip label="Hide panel · [" side="bottom">
                        <button type="button" aria-label="Hide panel" onClick={() => hide(true)} className={cn(iconButton, 'size-7 rounded-[8px]', focusRing)}>
                            <PanelLeft className="size-4" aria-hidden />
                        </button>
                    </Tip>
                ) : null}
            </div>

            <ScrollArea fade="from-background" className="min-h-0 flex-1 [mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)]">
                <div className="flex flex-col px-3 pb-6">
                    <nav aria-label={title}>
                        <ul className="flex flex-col">
                            {nav.map((item) => (
                                <li key={item.id}>
                                    <Row icon={<item.icon className="size-4" aria-hidden />} label={item.label} count={item.count} current={active === item.id} onSelect={() => setActive(item.id)} />
                                </li>
                            ))}
                            {more.length ? (
                                <li>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger aria-label={moreActive ? `${moreLabel}, ${moreActive.label} selected` : moreLabel} className={cn(rowClass, 'aria-expanded:bg-foreground/[0.05] aria-expanded:text-foreground', moreActive && 'bg-foreground/[0.1]', focusRing)}>
                                            <Glyph>{moreActive ? <moreActive.icon className="size-4" aria-hidden /> : <MoreHorizontal className="size-4" aria-hidden />}</Glyph>
                                            <span className="truncate">{moreActive ? moreActive.label : moreLabel}</span>
                                        </DropdownMenuTrigger>
                                        {/* Beside the row when there's room; under it in overlay mode, where the panel fills the screen. */}
                                        <DropdownMenuContent
                                            side={overlay ? 'bottom' : 'right'}
                                            align="start"
                                            sideOffset={overlay ? 4 : 9}
                                            alignOffset={overlay ? 0 : 4}
                                            className="min-w-[208px] rounded-[12px] border-border/80 px-1 py-px shadow-[0_8px_24px_-6px_rgb(0_0_0/0.12),0_2px_6px_-2px_rgb(0_0_0/0.06)]">
                                            {more.map((group, i) => (
                                                <Fragment key={i}>
                                                    {i > 0 ? <DropdownMenuSeparator className="mx-0 my-1 bg-border/80" /> : null}
                                                    {group.map((item) => (
                                                        <DropdownMenuItem
                                                            key={item.id}
                                                            onSelect={() => setActive(item.id)}
                                                            className={cn('h-8 gap-[9px] rounded-[8px] ps-2 pe-[7px] py-0 text-[15px] font-medium text-foreground focus:bg-foreground/[0.05] [&_svg]:text-foreground/60', active === item.id && 'bg-foreground/[0.05]')}>
                                                            <item.icon className="size-4" aria-hidden />
                                                            {item.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </Fragment>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </li>
                            ) : null}
                        </ul>
                    </nav>

                    {(sections || []).map((section) => {
                        const addLabel = section.addLabel ?? `Add to ${section.label}`
                        return (
                            <section key={section.id} aria-label={section.label} className="mt-2">
                                <div className="flex h-9 items-center justify-between ps-[7px] pe-1">
                                    <h3 className="truncate text-[12.5px] leading-4 font-medium text-foreground/60">{section.label}</h3>
                                    <Tip label={addLabel} side="bottom">
                                        <button type="button" aria-label={addLabel} onClick={() => addTo(section)} className={cn(iconButton, 'size-6 rounded-[6px]', focusRing)}>
                                            <Plus className="size-4" aria-hidden />
                                        </button>
                                    </Tip>
                                </div>
                                <ul className="flex flex-col">
                                    {[...section.items, ...(added[section.id] ?? [])].map((item) => (
                                        <li key={item.id} id={`resource-sidebar-${item.id}`}>
                                            <Row
                                                icon={item.icon ? <item.icon className="size-4" aria-hidden /> : <span className="text-[12px] leading-none">{item.emoji}</span>}
                                                label={item.label}
                                                count={item.count}
                                                current={active === item.id}
                                                onSelect={() => setActive(item.id)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )
                    })}
                </div>
            </ScrollArea>

            {footer ? (
                <div className="shrink-0 px-3 pb-2">
                    <button type="button" onClick={onFooter} className={cn(rowClass, 'ps-[8px] text-foreground/60 hover:text-foreground', focusRing)}>
                        <Glyph>
                            <footer.icon className="size-4" aria-hidden />
                        </Glyph>
                        <span className="truncate">{footer.label}</span>
                    </button>
                </div>
            ) : null}

            {resizable && !overlay ? (
                <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize panel"
                    aria-valuemin={minWidth}
                    aria-valuemax={maxWidth}
                    aria-valuenow={Math.round(w)}
                    tabIndex={0}
                    onPointerDown={startResize}
                    onKeyDown={resizeKey}
                    onDoubleClick={() => setWidth(defaultWidth)}
                    className="group/resize absolute inset-y-0 end-0 z-20 w-2 cursor-col-resize touch-none outline-none">
                    <span aria-hidden className={cn('absolute inset-y-3 end-0 w-0.5 rounded-full bg-transparent transition-colors group-hover/resize:bg-ring/50 group-focus-visible/resize:bg-ring', dragging && 'bg-ring')} />
                </div>
            ) : null}
        </>
    )

    const panelSurface = 'flex flex-col bg-background'
    const railSurface = 'rounded-s-[16px] border-s border-border shadow-[-8px_0_20px_-8px_rgb(0_0_0/0.07)]'

    return (
        <aside
            ref={root}
            aria-label={`${title} navigation`}
            style={{ '--row': density === 'compact' ? '28px' : '32px' } as CSSProperties}
            className={cn('relative flex h-full rounded-[18px] bg-muted font-sans text-foreground ring-1 ring-border/70', !overlay && 'overflow-hidden', className)}>
            {hasRail ? (
                <nav aria-label="Spaces" style={{ width: RAIL }} className={cn('flex shrink-0 flex-col items-center', railClassName)}>
                    <div className="flex h-12 shrink-0 items-center justify-center pt-1">
                        {open ? (
                            brand
                        ) : (
                            <Tip label={shortcuts ? 'Show panel · [' : 'Show panel'}>
                                <button ref={showButton} type="button" aria-label="Show panel" aria-expanded={false} onClick={show} className={cn(iconButton, 'size-8 rounded-[9px]', focusRing)}>
                                    <PanelLeftOpen className="size-4" aria-hidden />
                                </button>
                            </Tip>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-3.5 pt-0.5">
                        {rail.map((group, i) => (
                            <ul key={i} className="flex flex-col items-center">
                                {group.map((item) => (
                                    <li key={item.id}>
                                        <RailButton
                                            item={item}
                                            current={!item.action && space === item.id}
                                            onSelect={() => {
                                                if (item.action) return onRailAction?.(item.id)
                                                // Choosing a space always shows its panel.
                                                setSpace(item.id)
                                                if (!open) show()
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                    <ul className="mt-auto flex flex-col items-center pb-[3px]">
                        {railFooter.map((item) => (
                            <li key={item.id}>
                                <RailButton
                                    item={item}
                                    current={!item.action && space === item.id}
                                    onSelect={() => {
                                        if (item.action) return onRailAction?.(item.id)
                                        setSpace(item.id)
                                        if (!open) show()
                                    }}
                                />
                            </li>
                        ))}
                        <li>{account}</li>
                    </ul>
                </nav>
            ) : null}

            {!hasRail ? (
                <div style={{ width: w }} className={cn(panelSurface, 'relative min-w-0 shrink-0 rounded-[inherit]', panelClassName)}>
                    {body}
                </div>
            ) : overlay ? (
                // Floats over the page from the rail's edge; kept mounted so it can animate, inert while closed.
                <div
                    inert={!open}
                    style={{ width: `min(${w}px, calc(100vw - ${RAIL + 16}px))`, insetInlineStart: RAIL }}
                    className={cn(
                        panelSurface,
                        railSurface,
                        'absolute inset-y-0 z-30 rounded-e-[16px] border-e shadow-[0_24px_48px_-12px_rgb(0_0_0/0.25)] transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none',
                        open ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-3 opacity-0 rtl:translate-x-3',
                        panelClassName,
                    )}>
                    {body}
                </div>
            ) : (
                // Docked: the wrapper's width animates between 0 and the panel's; the clip lets the shadow fall on the rail.
                <div
                    style={{ width: open ? w : 0 }}
                    className={cn('relative shrink-0 [clip-path:inset(0_0_0_-24px)] rtl:[clip-path:inset(0_-24px_0_0)]', !dragging && 'transition-[width] duration-200 ease-out motion-reduce:transition-none')}>
                    <div inert={!open} style={{ width: w }} className={cn(panelSurface, railSurface, 'absolute inset-y-0 start-0', panelClassName)}>
                        {body}
                    </div>
                </div>
            )}
        </aside>
    )
}

/* ---------------------------------- Parts ---------------------------------- */

const iconButton = 'grid shrink-0 cursor-pointer place-items-center text-foreground/60 transition-colors hover:bg-foreground/[0.05] hover:text-foreground'

const rowClass =
    'flex h-(--row) w-full min-w-0 cursor-pointer items-center gap-[7px] rounded-[9px] ps-[5px] pe-2 text-start text-[15px] leading-5 font-medium tracking-[-0.006em] text-foreground transition-colors hover:bg-foreground/[0.05]'

/** The 18px slot every row's icon or emoji sits in, so labels line up whatever the glyph. */
function Glyph({ children }: { children: ReactNode }) {
    return <span className="grid size-[18px] shrink-0 place-items-center text-foreground/60">{children}</span>
}

function Row({ icon, label, count, current, onSelect }: { icon: ReactNode; label: string; count?: number; current: boolean; onSelect: () => void }) {
    return (
        <button type="button" aria-current={current ? 'page' : undefined} onClick={onSelect} className={cn(rowClass, current && 'bg-foreground/[0.1] hover:bg-foreground/[0.1]', focusRing)}>
            <Glyph>{icon}</Glyph>
            <span className="flex-1 truncate">{label}</span>
            {count !== undefined ? <span className="text-[12.5px] text-foreground/60 tabular-nums">{count}</span> : null}
        </button>
    )
}

function RailButton({ item, current, onSelect }: { item: RailItem; current: boolean; onSelect: () => void }) {
    return (
        <Tip label={item.label}>
            <button
                type="button"
                aria-label={item.dot ? `${item.label}, unread` : item.label}
                aria-current={current ? 'page' : undefined}
                onClick={onSelect}
                className={cn(
                    'group/rail relative grid size-10 cursor-pointer place-items-center rounded-[10px] text-foreground/60 transition-colors hover:text-foreground',
                    item.action ? '' : 'hover:bg-foreground/[0.05]',
                    current && 'bg-foreground/[0.1] text-foreground hover:bg-foreground/[0.1]',
                    focusRing,
                )}>
                {item.action ? (
                    <span className="grid size-[22px] place-items-center rounded-full bg-foreground/[0.09] text-foreground transition-colors group-hover/rail:bg-foreground/[0.13]">
                        <item.icon className="size-[14px]" strokeWidth={2.25} aria-hidden />
                    </span>
                ) : (
                    <item.icon className="size-4" aria-hidden />
                )}
                {item.dot ? <span aria-hidden className="absolute top-[10px] left-[24px] size-[6px] rounded-full bg-tone-blue-solid ring-[1.5px] ring-muted" /> : null}
            </button>
        </Tip>
    )
}

function Tip({ label, side = 'right', children }: { label: string; side?: 'right' | 'bottom'; children: ReactElement }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side}>{label}</TooltipContent>
        </Tooltip>
    )
}

/** The default mark: a ring. Pass `brand` for your own. */
function BrandMark() {
    return <span aria-hidden className="size-[14px] rounded-full border-[2.5px] border-foreground" />
}

/** The default account: a dark tile with a ring. Pass `account` for an avatar menu. */
function AccountMark() {
    return (
        <button type="button" aria-label="Account" className={cn('grid size-10 cursor-pointer place-items-center rounded-[10px] transition-colors hover:bg-foreground/[0.05]', focusRing)}>
            <span aria-hidden className="grid size-[17px] place-items-center rounded-[5px] bg-foreground">
                <span className="size-[9px] rounded-full border-2 border-background" />
            </span>
        </button>
    )
}
