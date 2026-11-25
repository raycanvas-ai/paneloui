'use client'

import { useMemo, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent, type ReactElement } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Clock, Columns3, Copy, Download, GripVertical, Link, ListFilter, MoreHorizontal, Plus, RotateCcw, Search, X } from '@keyline-icons/react'

import { Checkbox } from '@/components/panelo/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/panelo/ui/dropdown-menu'
import { Input } from '@/components/panelo/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/panelo/ui/tooltip'
import { cn } from '@/components/panelo/lib/utils'

import { tone, type Column } from './columns'
import type { Presence, Tone } from './data'

/* -------------------------------------------------------------------------- */
/*  Records table: a database-style table for any row type. Columns say how    */
/*  fields draw, sort, filter and export; views are saved filter + sort pairs. */
/*  - Click a header to sort (ascending, descending, off), or use Sort.       */
/*  - Filter by any column with options; search across every column.         */
/*  - Select rows (shift-click a range), drag the handle to reorder when no   */
/*    sort is on, page through, export what's shown as CSV.                   */
/*  - "+" saves the current filters and sort as a new view.                   */
/*  - Optional presence: other people's cursors as tinted cells with names.  */
/* -------------------------------------------------------------------------- */

export type Sort = { column: string; dir: 'asc' | 'desc' }
export type Filters = Record<string, string[]>
export type View = { id: string; label: string; filters?: Filters; sort?: Sort | null }

export type RecordsTableProps<T extends { id: string }> = {
    title?: string
    /** Shown before the title, in the breadcrumb and the heading. */
    emoji?: string
    rows: T[]
    columns: Column<T>[]
    views?: View[]
    defaultView?: string
    /** Who else is here, and which cell each is on. */
    presence?: Presence[]
    pageSize?: number
    pageSizes?: number[]
    defaultSelected?: string[]
    onSelectionChange?: (ids: string[]) => void
    onRowClick?: (row: T) => void
    onShare?: () => void
    /** File name for "Export CSV". */
    exportName?: string
    className?: string
}

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
const SELECTED = 'color-mix(in oklch, var(--tone-blue-solid) 8%, var(--card))'
const toolText = 'flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-[7px] px-1.5 text-[15px] leading-5 font-medium text-foreground/50 transition-colors hover:bg-foreground/[0.05] hover:text-foreground/80 aria-expanded:bg-foreground/[0.05] aria-expanded:text-foreground/80'
const iconButton = 'grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-foreground/50 transition-colors hover:bg-foreground/[0.05] hover:text-foreground/80'

function Tip({ label, children }: { label: string; children: ReactElement }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
    )
}

const cellText = <T,>(col: Column<T>, row: T) => (col.text ? col.text(row) : String(col.sortValue?.(row) ?? ''))

export function RecordsTable<T extends { id: string }>({
    title = 'Records',
    emoji,
    rows,
    columns,
    views: initialViews = [{ id: 'all', label: 'All Records' }],
    defaultView,
    presence = [],
    pageSize: initialPageSize = 20,
    pageSizes = [10, 20, 50],
    defaultSelected = [],
    onSelectionChange,
    onRowClick,
    onShare,
    exportName = 'records',
    className,
}: RecordsTableProps<T>) {
    const [views, setViews] = useState(initialViews)
    const first = initialViews.find((v) => v.id === defaultView) ?? initialViews[0]
    const [view, setView] = useState(first?.id ?? '')
    const [filters, setFilters] = useState<Filters>(first?.filters ?? {})
    const [sort, setSort] = useState<Sort | null>(first?.sort ?? null)
    const [query, setQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [order, setOrder] = useState<string[]>(() => rows.map((r) => r.id))
    const [selected, setSelectedState] = useState<Set<string>>(new Set(defaultSelected))
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [dragging, setDragging] = useState<string | null>(null)
    const [dropAt, setDropAt] = useState<{ id: string; after: boolean } | null>(null)
    const anchor = useRef<string | null>(null)
    const searchInput = useRef<HTMLInputElement>(null)

    const setSelected = (next: Set<string>) => {
        setSelectedState(next)
        onSelectionChange?.([...next])
    }
    const applyView = (v: View) => {
        setView(v.id)
        setFilters(v.filters ?? {})
        setSort(v.sort ?? null)
        setPage(0)
    }

    // Rows in manual order (new rows from props join the end), then filtered, searched and sorted.
    const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows])
    const ordered = useMemo(() => [...order.filter((id) => byId.has(id)), ...rows.filter((r) => !order.includes(r.id)).map((r) => r.id)].map((id) => byId.get(id)!), [order, rows, byId])
    const shown = useMemo(() => {
        const q = query.trim().toLowerCase()
        const out = ordered.filter((row) => {
            for (const col of columns) {
                const want = filters[col.id]
                if (want?.length && col.filter && !want.includes(col.filter.value(row))) return false
            }
            return !q || columns.some((col) => cellText(col, row).toLowerCase().includes(q))
        })
        const col = sort && columns.find((c) => c.id === sort.column)
        if (!col?.sortValue) return out
        const dir = sort!.dir === 'asc' ? 1 : -1
        return [...out].sort((a, b) => {
            const x = col.sortValue!(a)
            const y = col.sortValue!(b)
            // Empty values sink to the bottom whichever way the sort runs.
            if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1
            return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir
        })
    }, [ordered, columns, filters, query, sort])

    const pages = Math.max(1, Math.ceil(shown.length / pageSize))
    const current = Math.min(page, pages - 1)
    const visible = shown.slice(current * pageSize, (current + 1) * pageSize)
    const filterCount = Object.values(filters).reduce((n, list) => n + list.length, 0)
    const visibleSelected = visible.filter((r) => selected.has(r.id)).length
    const canReorder = !sort
    const viewLabel = views.find((v) => v.id === view)?.label ?? ''

    const cycleSort = (column: string) => {
        setSort(!sort || sort.column !== column ? { column, dir: 'asc' } : sort.dir === 'asc' ? { column, dir: 'desc' } : null)
        setPage(0)
    }
    const toggleRow = (id: string, shift: boolean) => {
        const next = new Set(selected)
        // Shift-click selects the run from the last row clicked, like a file list.
        if (shift && anchor.current) {
            const ids = visible.map((r) => r.id)
            const [a, b] = [ids.indexOf(anchor.current), ids.indexOf(id)].sort((m, n) => m - n)
            if (a >= 0) for (const rid of ids.slice(a, b + 1)) next.add(rid)
        } else if (next.has(id)) next.delete(id)
        else next.add(id)
        anchor.current = id
        setSelected(next)
    }
    const toggleAll = () => {
        const next = new Set(selected)
        const all = visibleSelected === visible.length
        for (const r of visible) {
            if (all) next.delete(r.id)
            else next.add(r.id)
        }
        setSelected(next)
    }
    const move = (id: string, target: string, after: boolean) => {
        if (id === target) return
        const ids = ordered.map((r) => r.id)
        ids.splice(ids.indexOf(id), 1)
        ids.splice(ids.indexOf(target) + (after ? 1 : 0), 0, id)
        setOrder(ids)
    }
    const moveBy = (id: string, delta: number, e: KeyboardEvent) => {
        const ids = visible.map((r) => r.id)
        const i = ids.indexOf(id)
        const target = ids[i + delta]
        if (!target) return
        e.preventDefault()
        move(id, target, delta > 0)
        requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-handle="${CSS.escape(id)}"]`)?.focus())
    }
    const saveView = () => {
        const n = views.filter((v) => v.id.startsWith('saved-')).length + 1
        const v: View = { id: `saved-${n}`, label: `View ${n}`, filters, sort }
        setViews([...views, v])
        setView(v.id)
    }
    const [renaming, setRenaming] = useState<string | null>(null)
    const renameView = (id: string, label: string) => {
        const name = label.trim()
        if (name) setViews(views.map((v) => (v.id === id ? { ...v, label: name } : v)))
        setRenaming(null)
    }
    const removeView = (id: string) => {
        const next = views.filter((v) => v.id !== id)
        setViews(next)
        if (view === id && next[0]) applyView(next[0])
    }
    const duplicateView = () => {
        const base = views.find((v) => v.id === view)
        const v: View = { id: `copy-${Date.now()}`, label: `${base?.label ?? 'View'} copy`, filters, sort }
        setViews([...views, v])
        setView(v.id)
    }
    const reset = () => {
        setFilters({})
        setSort(null)
        setQuery('')
        setSearching(false)
        setPage(0)
    }
    const exportCsv = () => {
        const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
        const lines = [columns.map((c) => esc(c.header)).join(','), ...shown.map((row) => columns.map((c) => esc(cellText(c, row))).join(','))]
        const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `${exportName}.csv`
        document.body.append(a)
        a.click()
        a.remove()
        // Released after the browser has started the download; revoking at once cancels it.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    const presenceAt = (row: string, col: string) => presence.find((p) => p.row === row && p.column === col)
    const filterable = columns.filter((c) => c.filter)
    const sortable = columns.filter((c) => c.sortValue)
    const tableWidth = columns.reduce((n, c) => n + c.width, 0)

    return (
        <div className={cn('@container flex h-full min-h-0 flex-col overflow-auto bg-card font-sans text-foreground', className)}>
            {/* ------------------------------ Top bar ------------------------------ */}
            <header className="flex h-[60px] shrink-0 items-center gap-3 ps-4 pe-3 pt-1 @3xl:ps-6">
                <span className="flex min-w-0 items-center gap-2 text-[12.5px] leading-4 font-medium text-foreground/80">
                    {emoji ? <span aria-hidden className="text-[14px]">{emoji}</span> : null}
                    <span className="truncate">{title}</span>
                </span>
                <div className="ms-auto flex items-center gap-1">
                    {presence.length ? (
                        <div className="me-1 flex -space-x-2" aria-label={`${presence.length} people here: ${presence.map((p) => p.name).join(', ')}`}>
                            {presence.map((p) => (
                                <Tip key={p.id} label={p.name}>
                                    <span className="grid size-[26px] place-items-center rounded-full text-[12px] leading-none font-semibold text-foreground/80 ring-2 ring-card" style={{ background: `color-mix(in oklch, ${tone(p.tone)} 55%, var(--card))` }}>
                                        {p.name[0]}
                                    </span>
                                </Tip>
                            ))}
                        </div>
                    ) : null}
                    <Tip label="Invite">
                        <button type="button" aria-label="Invite people" onClick={onShare} className={cn(iconButton, focusRing)}>
                            <Plus className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <button type="button" onClick={onShare} className={cn(toolText, 'ms-1', focusRing)}>
                        Share
                    </button>
                    <Tip label="Edited just now">
                        <span className={cn(iconButton, 'hidden cursor-default hover:bg-transparent @xl:grid')}>
                            <Clock className="size-4" aria-label="Edited just now" />
                        </span>
                    </Tip>
                    <Tip label="Duplicate view">
                        <button type="button" aria-label="Duplicate view" onClick={duplicateView} className={cn(iconButton, 'hidden @xl:grid', focusRing)}>
                            <Copy className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label="More options" className={cn(iconButton, 'aria-expanded:bg-foreground/[0.05]', focusRing)}>
                            <MoreHorizontal className="size-4" aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={exportCsv} className="gap-2">
                                <Download className="size-4" aria-hidden />
                                Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void navigator.clipboard?.writeText(window.location.href)} className="gap-2">
                                <Link className="size-4" aria-hidden />
                                Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={duplicateView} className="gap-2 @xl:hidden">
                                <Copy className="size-4" aria-hidden />
                                Duplicate view
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={reset} className="gap-2">
                                <RotateCcw className="size-4" aria-hidden />
                                Reset filters and sort
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col px-4 @3xl:px-20">
                <h1 className="mt-3 flex items-center gap-2.5 text-[20px] leading-[30px] font-semibold tracking-[-0.012em] @3xl:mt-[18px] @3xl:text-[23px]">
                    {emoji ? <span aria-hidden className="text-[26px] leading-none @3xl:text-[30px]">{emoji}</span> : null}
                    {title}
                </h1>

                {/* ------------------------------ Views and tools ------------------------------ */}
                <div className="mt-3 flex h-[52px] shrink-0 items-stretch gap-4 @3xl:mt-[19px]">
                    <div role="tablist" aria-label="Views" className="flex min-w-0 flex-1 items-stretch gap-8 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] [scrollbar-width:none] @5xl:[mask-image:none]">
                        {views.map((v) => {
                            const custom = !initialViews.some((iv) => iv.id === v.id)
                            const active = view === v.id
                            return (
                                <div key={v.id} className={cn('group/tab relative flex shrink-0 items-center', active && 'after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full after:bg-foreground/70')}>
                                    {renaming === v.id ? (
                                        <input
                                            autoFocus
                                            defaultValue={v.label}
                                            aria-label="View name"
                                            onFocus={(e) => e.currentTarget.select()}
                                            onBlur={(e) => renameView(v.id, e.currentTarget.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') renameView(v.id, e.currentTarget.value)
                                                if (e.key === 'Escape') setRenaming(null)
                                            }}
                                            className="ms-2.5 h-7 w-32 rounded-[6px] bg-foreground/[0.05] px-1.5 text-[15px] leading-5 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            onClick={() => applyView(v)}
                                            onDoubleClick={() => custom && setRenaming(v.id)}
                                            title={custom ? 'Double-click to rename' : undefined}
                                            className={cn(
                                                'flex h-full cursor-pointer items-center gap-[11px] ps-2.5 pe-2 text-[15px] leading-5 font-medium whitespace-nowrap text-foreground/50 transition-colors hover:text-foreground/80',
                                                active && 'text-foreground/85',
                                                'outline-none focus-visible:underline focus-visible:underline-offset-4',
                                            )}>
                                            <Columns3 className="size-[14px]" aria-hidden />
                                            {v.label}
                                        </button>
                                    )}
                                    {/* Views you make can go again; the table's own views stay. */}
                                    {custom && renaming !== v.id ? (
                                        <Tip label="Remove view">
                                            <button
                                                type="button"
                                                aria-label={`Remove ${v.label}`}
                                                onClick={() => removeView(v.id)}
                                                className={cn(iconButton, 'size-5 rounded-[5px] opacity-0 transition-opacity group-hover/tab:opacity-100 focus-visible:opacity-100', active && 'opacity-100', focusRing)}>
                                                <X className="size-3.5" aria-hidden />
                                            </button>
                                        </Tip>
                                    ) : null}
                                </div>
                            )
                        })}
                        <Tip label="Save as a new view">
                            <button type="button" aria-label="Save as a new view" onClick={saveView} className={cn(iconButton, 'self-center', focusRing)}>
                                <Plus className="size-4" aria-hidden />
                            </button>
                        </Tip>
                    </div>
                    <div className="-me-2.5 flex shrink-0 items-center gap-1.5">
                        {filterable.length ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger aria-label={filterCount ? `Filter, ${filterCount} active` : 'Filter'} className={cn(toolText, focusRing)}>
                                    <span className="hidden @2xl:inline">Filter</span>
                                    <ListFilter className="size-4 @2xl:hidden" aria-hidden />
                                    {filterCount ? (
                                        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-[4px] px-1 text-[12px] leading-none font-semibold tabular-nums" style={{ background: SELECTED, color: 'var(--tone-blue-solid)' }}>
                                            {filterCount}
                                        </span>
                                    ) : null}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {filterable.map((col) => {
                                        const active = filters[col.id] ?? []
                                        return (
                                            <DropdownMenuSub key={col.id}>
                                                <DropdownMenuSubTrigger className="gap-2">
                                                    {col.icon ? <col.icon className="size-4 text-foreground/55" aria-hidden /> : null}
                                                    <span className="flex-1">{col.header}</span>
                                                    {active.length ? <span className="text-[12px] text-foreground/50 tabular-nums">{active.length}</span> : null}
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="w-52">
                                                    {col.filter!.options.map((o) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={o.id}
                                                            checked={active.includes(o.id)}
                                                            closeOnSelect={false}
                                                            onCheckedChange={(on) => {
                                                                setFilters({ ...filters, [col.id]: on ? [...active, o.id] : active.filter((x) => x !== o.id) })
                                                                setPage(0)
                                                            }}
                                                            className="gap-2">
                                                            {o.render}
                                                            {o.label}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        )
                                    })}
                                    {filterCount ? (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => (setFilters({}), setPage(0))}>Clear filters</DropdownMenuItem>
                                        </>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                        {sortable.length ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger aria-label={sort ? `Sort, by ${columns.find((c) => c.id === sort.column)?.header}` : 'Sort'} className={cn(toolText, sort && 'text-foreground/80', focusRing)}>
                                    <span className="hidden @2xl:inline">Sort</span>
                                    {sort ? sort.dir === 'asc' ? <ArrowUp className="size-3.5" aria-hidden /> : <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUpDown className="size-4 @2xl:hidden" aria-hidden />}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={sort?.column ?? ''} onValueChange={(column) => (setSort({ column, dir: sort?.dir ?? 'asc' }), setPage(0))}>
                                        {sortable.map((c) => (
                                            <DropdownMenuRadioItem key={c.id} value={c.id}>
                                                {c.header}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    {sort ? (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuRadioGroup value={sort.dir} onValueChange={(dir) => setSort({ ...sort, dir: dir as Sort['dir'] })}>
                                                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => setSort(null)}>Clear sort</DropdownMenuItem>
                                        </>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                        <button type="button" onClick={exportCsv} className={cn(toolText, focusRing)} aria-label="Export CSV">
                            <span className="hidden @2xl:inline">Export</span>
                            <Download className="size-4 @2xl:hidden" aria-hidden />
                        </button>
                        {searching ? (
                            <label className="relative flex h-7 items-center">
                                <Search className="pointer-events-none absolute start-2 size-3.5 text-foreground/45" aria-hidden />
                                <Input
                                    ref={searchInput}
                                    autoFocus
                                    value={query}
                                    onChange={(e) => (setQuery(e.target.value), setPage(0))}
                                    onKeyDown={(e) => e.key === 'Escape' && (setQuery(''), setSearching(false))}
                                    onBlur={() => !query && setSearching(false)}
                                    placeholder="Search records"
                                    aria-label="Search records"
                                    className="h-7 w-40 rounded-[7px] ps-7 pe-6 text-[13.5px] shadow-none md:text-[13.5px] @2xl:w-48"
                                />
                                {query ? (
                                    <button type="button" aria-label="Clear search" onClick={() => (setQuery(''), searchInput.current?.focus())} className="absolute end-1.5 grid size-4 cursor-pointer place-items-center text-foreground/50 hover:text-foreground">
                                        <X className="size-3" aria-hidden />
                                    </button>
                                ) : null}
                            </label>
                        ) : (
                            <Tip label="Search">
                                <button type="button" aria-label="Search records" onClick={() => setSearching(true)} className={cn(iconButton, focusRing)}>
                                    <Search className="size-4" aria-hidden />
                                </button>
                            </Tip>
                        )}
                    </div>
                </div>

                {/* ------------------------------ Table ------------------------------ */}
                {/* The gutter left of the table holds the drag handles, as in a document. */}
                <div data-table-scroll className="-ms-7 overflow-x-auto ps-7 pb-1">
                    <table className="border-collapse text-[15px] leading-5" style={{ width: tableWidth, minWidth: tableWidth }} aria-label={`${title}: ${viewLabel}`}>
                        <colgroup>
                            {columns.map((c) => (
                                <col key={c.id} style={{ width: c.width }} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr className="h-[41px] border-y border-border/90">
                                {columns.map((col, i) => {
                                    const active = sort?.column === col.id
                                    const label = (
                                        <>
                                            {col.icon ? <col.icon className="size-[14px] shrink-0" aria-hidden /> : null}
                                            <span className="truncate">{col.header}</span>
                                            {active ? sort!.dir === 'asc' ? <ArrowUp className="size-3.5 shrink-0 text-foreground/70" aria-hidden /> : <ArrowDown className="size-3.5 shrink-0 text-foreground/70" aria-hidden /> : null}
                                        </>
                                    )
                                    return (
                                        <th
                                            key={col.id}
                                            scope="col"
                                            aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                                            className={cn('border-e border-border/90 p-0 text-start font-normal text-foreground/45 last:border-e-0', i === 0 && 'sticky start-0 z-10 bg-card before:pointer-events-none before:absolute before:inset-y-0 before:-start-7 before:w-7 before:bg-card')}>
                                            <div className={cn('flex h-[40px] items-center', i === 0 ? 'gap-3 ps-[10px] pe-3 shadow-[inset_-1px_0_0_color-mix(in_oklch,var(--border)_90%,transparent)]' : 'px-[14px]', col.align === 'end' && i > 0 && 'justify-end')}>
                                                {i === 0 ? (
                                                    <Checkbox
                                                        aria-label="Select all rows on this page"
                                                        checked={visible.length > 0 && visibleSelected === visible.length ? true : visibleSelected ? 'indeterminate' : false}
                                                        onCheckedChange={toggleAll}
                                                        className={checkboxClass}
                                                    />
                                                ) : null}
                                                {col.sortValue ? (
                                                    <button type="button" onClick={() => cycleSort(col.id)} title={active ? (sort!.dir === 'asc' ? 'Sorted ascending · click for descending' : 'Sorted descending · click to clear') : `Sort by ${col.header}`} className={cn('-mx-1 flex min-w-0 cursor-pointer items-center gap-[10px] rounded-[6px] px-1 py-0.5 hover:bg-foreground/[0.05] hover:text-foreground/70', active && 'text-foreground/70', focusRing)}>
                                                        {label}
                                                    </button>
                                                ) : (
                                                    <span className="flex min-w-0 items-center gap-[10px]">{label}</span>
                                                )}
                                            </div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {visible.length ? (
                                visible.map((row) => {
                                    const isSelected = selected.has(row.id)
                                    const drop = dropAt?.id === row.id ? (dropAt.after ? 'after' : 'before') : null
                                    return (
                                        <tr
                                            key={row.id}
                                            aria-selected={isSelected}
                                            onClick={() => onRowClick?.(row)}
                                            onDragOver={(e: DragEvent) => {
                                                if (!dragging) return
                                                e.preventDefault()
                                                const r = e.currentTarget.getBoundingClientRect()
                                                setDropAt({ id: row.id, after: e.clientY > r.top + r.height / 2 })
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                if (dragging && dropAt) move(dragging, dropAt.id, dropAt.after)
                                                setDragging(null)
                                                setDropAt(null)
                                            }}
                                            className={cn('group/row h-[42px] border-b border-border/90 transition-colors', onRowClick && 'cursor-pointer', dragging === row.id && 'opacity-50')}
                                            style={{
                                                background: isSelected ? SELECTED : undefined,
                                                boxShadow: drop === 'before' ? 'inset 0 2px 0 var(--tone-blue-solid)' : drop === 'after' ? 'inset 0 -2px 0 var(--tone-blue-solid)' : undefined,
                                            }}>
                                            {columns.map((col, i) => {
                                                const here = presenceAt(row.id, col.id)
                                                const hereStyle: CSSProperties | undefined = here ? { boxShadow: `inset 0 0 0 1.5px ${tone(here.tone)}`, background: `color-mix(in oklch, ${tone(here.tone)} 6%, transparent)` } : undefined
                                                return (
                                                    <td
                                                        key={col.id}
                                                        style={hereStyle}
                                                        className={cn('relative border-e border-border/90 p-0 last:border-e-0', i === 0 && 'sticky start-0 z-10 before:pointer-events-none before:absolute before:inset-y-0 before:-start-7 before:w-7 before:bg-card', i === 0 && !isSelected && 'bg-card')}>
                                                        {i === 0 ? (
                                                            <>
                                                                {/* Row tools in the gutter: shown on hover, focus and selection. */}
                                                                {canReorder ? (
                                                                    <button
                                                                        type="button"
                                                                        data-handle={row.id}
                                                                        draggable
                                                                        aria-label={`Move ${cellText(col, row)}: drag, or use the arrow keys`}
                                                                        onDragStart={(e) => {
                                                                            setDragging(row.id)
                                                                            e.dataTransfer.effectAllowed = 'move'
                                                                            e.dataTransfer.setData('text/plain', row.id)
                                                                        }}
                                                                        onDragEnd={() => (setDragging(null), setDropAt(null))}
                                                                        onKeyDown={(e) => (e.key === 'ArrowUp' ? moveBy(row.id, -1, e) : e.key === 'ArrowDown' ? moveBy(row.id, 1, e) : undefined)}
                                                                        className={cn(
                                                                            'absolute top-1/2 -start-6 grid h-6 w-4 -translate-y-1/2 cursor-grab place-items-center rounded-[4px] text-foreground/35 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 hover:text-foreground/70 active:cursor-grabbing',
                                                                            isSelected && 'opacity-100',
                                                                            focusRing,
                                                                        )}>
                                                                        <GripVertical className="size-3.5" aria-hidden />
                                                                    </button>
                                                                ) : null}
                                                                <div className="flex h-[41px] items-center gap-3 ps-[10px] pe-3 shadow-[inset_-1px_0_0_color-mix(in_oklch,var(--border)_90%,transparent)]" style={isSelected ? { background: SELECTED } : undefined}>
                                                                    <Checkbox
                                                                        aria-label={`Select ${cellText(col, row)}`}
                                                                        checked={isSelected}
                                                                        onClick={(e) => (e.stopPropagation(), toggleRow(row.id, e.shiftKey))}
                                                                        className={checkboxClass}
                                                                    />
                                                                    <div className="min-w-0 flex-1">{col.cell(row)}</div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className={cn('flex h-[41px] min-w-0 items-center px-[14px]', col.align === 'end' && 'justify-end')}>{col.cell(row)}</div>
                                                        )}
                                                        {here ? (
                                                            <span
                                                                className="pointer-events-none absolute start-[calc(100%-1px)] bottom-[calc(100%-1px)] z-20 rounded-[4px] px-1.5 py-0.5 text-[11.5px] leading-[15px] font-semibold whitespace-nowrap text-foreground/85"
                                                                style={{ background: `color-mix(in oklch, ${tone(here.tone)} 70%, var(--card))` }}>
                                                                {here.name}
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="h-40 text-center text-[14px] text-foreground/55">
                                        No records match.{' '}
                                        <button type="button" onClick={reset} className={cn('cursor-pointer rounded-sm font-medium text-foreground underline underline-offset-4', focusRing)}>
                                            Clear filters and search
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ------------------------------ Footer ------------------------------ */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-[13px] text-foreground/55" style={{ maxWidth: tableWidth }}>
                    <span aria-live="polite" className="flex items-center gap-2">
                        {selected.size ? (
                            <>
                                <span className="font-medium text-foreground/80">{selected.size} selected</span>
                                <button type="button" onClick={() => setSelected(new Set())} className={cn('cursor-pointer rounded-sm underline underline-offset-4 hover:text-foreground', focusRing)}>
                                    Clear
                                </button>
                            </>
                        ) : (
                            `${shown.length} record${shown.length === 1 ? '' : 's'}`
                        )}
                    </span>
                    <div className="ms-auto flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger className={cn('flex h-7 cursor-pointer items-center gap-1.5 rounded-[7px] px-2 hover:bg-foreground/[0.05]', focusRing)}>
                                Rows <span className="font-medium text-foreground/80 tabular-nums">{pageSize}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-28">
                                <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(v) => (setPageSize(Number(v)), setPage(0))}>
                                    {pageSizes.map((n) => (
                                        <DropdownMenuRadioItem key={n} value={String(n)}>
                                            {n}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <nav aria-label="Pages" className="flex items-center gap-1 tabular-nums">
                            <span className="me-1">
                                {shown.length ? current * pageSize + 1 : 0}–{Math.min(shown.length, (current + 1) * pageSize)} of {shown.length}
                            </span>
                            <button type="button" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} className={cn(iconButton, 'size-7 disabled:pointer-events-none disabled:opacity-35', focusRing)}>
                                <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
                            </button>
                            <button type="button" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className={cn(iconButton, 'size-7 disabled:pointer-events-none disabled:opacity-35', focusRing)}>
                                <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** A small square box: blue when ticked, a grey dash when some rows are. */
const checkboxClass =
    'size-[13px] cursor-pointer rounded-[3px] border-foreground/25 bg-card shadow-none data-checked:border-tone-blue-solid data-checked:bg-tone-blue-solid data-checked:text-white data-indeterminate:border-foreground/30 data-indeterminate:bg-card data-indeterminate:text-foreground/55 [&_svg]:size-[11px]'

export type { Column } from './columns'
export type { Tone }
