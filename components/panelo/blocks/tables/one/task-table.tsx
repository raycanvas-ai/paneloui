'use client'

import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactElement, type ReactNode, type SVGProps } from 'react'
import {
    ArrowDownWideNarrow,
    ArrowRightLeft,
    ArrowUpDown,
    Bell,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    CirclePlus,
    CircleQuestion,
    CircleUser,
    ClipboardCheck,
    EyeOff,
    Flag,
    Globe,
    Grid2x2,
    Hash,
    List,
    Lock,
    MoreHorizontal,
    PanelsTopLeft,
    Search,
    SearchX,
    SlidersHorizontal,
    SquareArrowUp,
    Table,
    User,
    Users,
    X,
} from '@keyline-icons/react'

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
import { ScrollArea } from '@/components/panelo/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/panelo/ui/tooltip'
import { cn } from '@/components/panelo/lib/utils'

import * as sample from './data'
import type { Label, Person, Priority, Project, Status, Task } from './data'
import { Orb, PriorityIcon, ProjectMark, shortDate, StatusIcon, tone } from './parts'

/* -------------------------------------------------------------------------- */
/*  Task table: a project tracker's data table. One pipeline (search, filters, */
/*  "mine", completed, sort) feeds three views:                               */
/*  - Overview: a panel per project, grouped (label, assignee, status, parent */
/*    or priority), each group paged.                                         */
/*  - List: every task in one panel, grouped by status.                       */
/*  - Table: classic rows and columns with sortable headers and pages.        */
/*  Data, views, labels and sizes are props; `renderView` adds your own view. */
/* -------------------------------------------------------------------------- */

type Icon = ComponentType<SVGProps<SVGSVGElement>>
export type GroupBy = 'label' | 'assignee' | 'status' | 'parent' | 'priority' | 'none'
export type SortKey = 'due' | 'priority' | 'title' | 'status'
export type Sort = { key: SortKey; dir: 'asc' | 'desc' }
export type Filters = { status: Status[]; priority: Priority[]; label: string[]; assignee: string[] }
export type View = { id: string; label: string; icon: Icon }
/** A task with the project it belongs to, as views receive them. */
export type Row = Task & { project: string }

export type TaskTableProps = {
    /** Breadcrumb: the section, then the page. */
    section?: string
    title?: string
    projects?: Project[]
    people?: Person[]
    labels?: Label[]
    /** The person "My tasks" filters to. */
    currentUser?: string
    /** Tabs. The built-in ids are `overview`, `list` and `table`; give `renderView` for any other. */
    views?: View[]
    defaultView?: string
    view?: string
    onViewChange?: (id: string) => void
    renderView?: (view: string, rows: Row[]) => ReactNode
    /** How Overview panels group at first; each panel's chips change its own. */
    defaultGroupBy?: GroupBy
    defaultSort?: Sort
    sort?: Sort
    onSortChange?: (sort: Sort) => void
    defaultFilters?: Partial<Filters>
    filters?: Filters
    onFiltersChange?: (filters: Filters) => void
    /** Rows per group in Overview and List, and per page in Table. */
    pageSize?: number
    tablePageSize?: number
    onTaskClick?: (task: Row) => void
    /** Replaces the default "add an untitled task to the first project". */
    onAddTask?: () => void
    onShare?: () => void
    /** Listen for ⌘K / Ctrl K to focus search. Give it to one table per page. */
    shortcuts?: boolean
    className?: string
}

const DEFAULT_VIEWS: View[] = [
    { id: 'overview', label: 'Overview', icon: PanelsTopLeft },
    { id: 'list', label: 'List', icon: List },
    { id: 'table', label: 'Table', icon: Table },
]

const EMPTY_FILTERS: Filters = { status: [], priority: [], label: [], assignee: [] }
const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, none: 3 }
const STATUS_RANK: Record<Status, number> = { progress: 0, todo: 1, done: 2 }
const SORT_LABELS: Record<SortKey, string> = { due: 'Due date', priority: 'Priority', title: 'Name', status: 'Status' }
const GROUP_LABELS: Record<GroupBy, string> = { label: 'Label', assignee: 'Assignee', status: 'Status', parent: 'Parent', priority: 'Priority', none: 'No grouping' }

// A teal for the primary button, derived from the theme's green so it follows the theme.
const TEAL = 'oklch(from var(--tone-green-solid) 0.64 0.105 184)'
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
const bordered = 'border border-border/80 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-muted/60'

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

function compare(sort: Sort) {
    const dir = sort.dir === 'asc' ? 1 : -1
    return (a: Row, b: Row) => {
        const by =
            sort.key === 'due'
                ? a.due.localeCompare(b.due)
                : sort.key === 'priority'
                  ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
                  : sort.key === 'status'
                    ? STATUS_RANK[a.status] - STATUS_RANK[b.status]
                    : a.title.localeCompare(b.title)
        return by * dir || a.title.localeCompare(b.title) || a.id.localeCompare(b.id)
    }
}

const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

export function TaskTable({
    section = 'Tasks',
    title = 'Overview',
    projects: projectsProp = sample.projects,
    people = sample.people,
    labels = sample.labels,
    currentUser = sample.currentUser,
    views = DEFAULT_VIEWS,
    defaultView = 'overview',
    view: viewProp,
    onViewChange,
    renderView,
    defaultGroupBy = 'label',
    defaultSort = { key: 'due', dir: 'asc' },
    sort: sortProp,
    onSortChange,
    defaultFilters,
    filters: filtersProp,
    onFiltersChange,
    pageSize = 5,
    tablePageSize = 10,
    onTaskClick,
    onAddTask,
    onShare,
    shortcuts = false,
    className,
}: TaskTableProps) {
    const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
    const [sort, setSort] = useControllable(sortProp, defaultSort, onSortChange)
    const [filters, setFilters] = useControllable(filtersProp, { ...EMPTY_FILTERS, ...defaultFilters }, onFiltersChange)
    const [query, setQuery] = useState('')
    const [mine, setMine] = useState(false)
    const [hideDone, setHideDone] = useState(false)
    const [columns, setColumns] = useState<1 | 2>(2)
    const [selected, setSelected] = useState<string | null>(null)
    const [added, setAdded] = useState<Task[]>([])
    const search = useRef<HTMLInputElement>(null)

    const projects = useMemo(() => projectsProp.map((p, i) => (i === 0 && added.length ? { ...p, tasks: [...added, ...p.tasks] } : p)), [projectsProp, added])
    const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])
    const labelsById = useMemo(() => new Map(labels.map((l) => [l.id, l])), [labels])

    // The one pipeline every view reads.
    const rows = useMemo(() => {
        const q = query.trim().toLowerCase()
        const out: Row[] = []
        for (const project of projects) {
            for (const task of project.tasks) {
                if (q && !task.title.toLowerCase().includes(q)) continue
                if (filters.status.length && !filters.status.includes(task.status)) continue
                if (filters.priority.length && !filters.priority.includes(task.priority)) continue
                if (filters.label.length && !filters.label.includes(task.label)) continue
                if (filters.assignee.length && !filters.assignee.includes(task.assignee)) continue
                if (mine && task.assignee !== currentUser) continue
                if (hideDone && task.status === 'done') continue
                out.push({ ...task, project: project.id })
            }
        }
        // Tasks added here stay on top whatever the sort, so a new task is never on page 3 of its group.
        const fresh = new Set(added.map((t) => t.id))
        const by = compare(sort)
        return out.sort((a, b) => Number(fresh.has(b.id)) - Number(fresh.has(a.id)) || by(a, b))
    }, [projects, added, query, filters, mine, currentUser, hideDone, sort])

    const filterCount = filters.status.length + filters.priority.length + filters.label.length + filters.assignee.length

    useEffect(() => {
        if (!shortcuts) return
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                search.current?.focus()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [shortcuts])

    const addTask = () => {
        if (onAddTask) return onAddTask()
        const first = projectsProp[0]
        if (!first) return
        const task: Task = {
            id: `new-${added.length + 1}`,
            title: added.length ? `Untitled task ${added.length + 1}` : 'Untitled task',
            status: 'todo',
            priority: 'none',
            label: first.tasks[0]?.label ?? labels[0]?.id ?? '',
            due: new Date().toISOString().slice(0, 10),
            assignee: currentUser,
            subtasks: 0,
        }
        setAdded((list) => [task, ...list])
        setSelected(task.id)
        setQuery('')
    }
    const openTask = (task: Row) => {
        setSelected(task.id)
        onTaskClick?.(task)
    }

    const ctx: Ctx = { peopleById, labelsById, pageSize, selected, openTask }
    const viewLabel = views.find((v) => v.id === view)?.label ?? title
    const custom = renderView?.(view, rows)

    return (
        <div className={cn('@container flex h-full min-h-0 flex-col bg-card font-sans text-foreground', className)}>
            {/* ------------------------------ Top bar ------------------------------ */}
            <header className="flex h-10 shrink-0 items-center gap-3 px-1.5 @xl:gap-2">
                <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[14px] leading-5 font-medium">
                    <ClipboardCheck className="size-4 shrink-0 text-foreground/70" aria-hidden />
                    <span className="hidden text-foreground/80 @xl:inline">{section}</span>
                    <span aria-hidden className="hidden px-1.5 text-foreground/35 @xl:inline">
                        /
                    </span>
                    <span aria-current="page" className="truncate">
                        {viewLabel}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label="Page options" className={cn('ms-2 grid size-6 shrink-0 cursor-pointer place-items-center rounded-[6px] text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground', focusRing)}>
                            <MoreHorizontal className="size-4" aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onSelect={() => setColumns(columns === 2 ? 1 : 2)}>{columns === 2 ? 'One column' : 'Two columns'}</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => (setFilters(EMPTY_FILTERS), setMine(false), setHideDone(false), setQuery(''))}>Reset filters</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Tip label="Only your workspace can see this page">
                        <span className="grid size-6 shrink-0 place-items-center text-foreground/50">
                            <Lock className="size-[15px]" aria-label="Private page" />
                        </span>
                    </Tip>
                </nav>

                <div className="ms-auto flex items-center gap-2">
                    <div className="me-2 hidden -space-x-1 @5xl:flex" aria-label={`${people.length} people on this page`}>
                        {people.slice(0, 6).map((p) => (
                            <Orb key={p.id} person={p} size={20} className="ring-2 ring-card" />
                        ))}
                    </div>
                    <label className="relative hidden h-8 w-[234px] items-center @3xl:flex">
                        <Search className="pointer-events-none absolute start-2.5 size-4 text-foreground/40" aria-hidden />
                        <Input
                            ref={search}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search tasks…"
                            aria-label="Search tasks"
                            className="h-8 rounded-[9px] border-border/70 bg-muted/40 ps-8 pe-11 text-[13.5px] shadow-none placeholder:text-foreground/40 md:text-[13.5px] [&::-webkit-search-cancel-button]:hidden"
                        />
                        {query ? (
                            <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className={cn('absolute end-2 grid size-5 cursor-pointer place-items-center rounded-[5px] text-foreground/50 hover:text-foreground', focusRing)}>
                                <X className="size-3.5" aria-hidden />
                            </button>
                        ) : (
                            <kbd className="pointer-events-none absolute end-2 rounded-[5px] bg-foreground/[0.06] px-1.5 py-px font-sans text-[11px] font-medium text-foreground/50">⌘K</kbd>
                        )}
                    </label>
                    <Tip label="Notifications">
                        <button type="button" aria-label="Notifications" className={cn(iconBox, bordered, focusRing)}>
                            <Bell className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <Tip label="Help">
                        <button type="button" aria-label="Help" className={cn(iconBox, bordered, 'hidden @xl:grid', focusRing)}>
                            <CircleQuestion className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <button type="button" onClick={onShare} className={cn(textButton, bordered, focusRing)}>
                        <SquareArrowUp className="size-4 text-foreground/70" aria-hidden />
                        <span className="hidden @xl:inline">Share</span>
                    </button>
                </div>
            </header>

            {/* ------------------------------ Views and tools ------------------------------ */}
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/70 px-1.5 pt-1 @5xl:h-14 @5xl:flex-nowrap @5xl:pt-[5px] @5xl:pb-0">
                <div role="tablist" aria-label="Views" className="-mb-px flex h-12 min-w-0 flex-1 items-stretch gap-6 overflow-x-auto [scrollbar-width:none] @5xl:h-full">
                    {views.map((v) => (
                        <button
                            key={v.id}
                            type="button"
                            role="tab"
                            aria-selected={view === v.id}
                            onClick={() => setView(v.id)}
                            className={cn(
                                'relative flex shrink-0 cursor-pointer items-center gap-2 text-[14px] leading-5 font-medium text-foreground/60 transition-colors hover:text-foreground',
                                view === v.id && 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-foreground',
                                'outline-none focus-visible:text-foreground focus-visible:underline focus-visible:underline-offset-4',
                            )}>
                            <v.icon className="size-[14px]" aria-hidden />
                            {v.label}
                        </button>
                    ))}
                </div>
                <div className="flex w-full items-center gap-2 pb-2 @5xl:w-auto @5xl:pb-0">
                    <Tip label={columns === 2 ? 'One column' : 'Two columns'}>
                        <button type="button" aria-label="Two columns" aria-pressed={columns === 2} onClick={() => setColumns(columns === 2 ? 1 : 2)} className={cn(iconBox, bordered, 'hidden @6xl:grid aria-pressed:bg-muted', focusRing)}>
                            <Grid2x2 className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <Tip label="Only my tasks">
                        <button type="button" aria-label="Only my tasks" aria-pressed={mine} onClick={() => setMine(!mine)} className={cn(iconBox, bordered, 'aria-pressed:bg-foreground/[0.08] aria-pressed:text-foreground', focusRing)}>
                            <CircleUser className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <Tip label={hideDone ? 'Show completed' : 'Hide completed'}>
                        <button type="button" aria-label="Hide completed" aria-pressed={hideDone} onClick={() => setHideDone(!hideDone)} className={cn(iconBox, bordered, 'aria-pressed:bg-foreground/[0.08] aria-pressed:text-foreground', focusRing)}>
                            <CircleCheck className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <FilterMenu filters={filters} setFilters={setFilters} count={filterCount} people={people} labels={labels} />
                    <SortMenu sort={sort} setSort={setSort} trigger="button" />
                    <button type="button" onClick={addTask} style={{ background: TEAL }} className={cn('ms-auto flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-[8px] px-2.5 text-[14px] leading-5 font-medium text-white shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-[filter] hover:brightness-95 @5xl:ms-0', focusRing)}>
                        <CirclePlus className="size-4" aria-hidden />
                        Add Task
                    </button>
                </div>
            </div>

            {/* ------------------------------ Body ------------------------------ */}
            <ScrollArea fade="from-card" className="min-h-0 flex-1">
                <div className="px-[5px] pt-[18px] pb-6">
                    {custom !== undefined && custom !== null ? (
                        custom
                    ) : view === 'table' ? (
                        <DataTable rows={rows} ctx={ctx} sort={sort} setSort={setSort} projects={projects} pageSize={tablePageSize} />
                    ) : view === 'list' ? (
                        <Panel title="All tasks" mark={<ListMarkIcon />} tasks={rows} defaultGroupBy="status" ctx={ctx} sort={sort} setSort={setSort} />
                    ) : view === 'overview' ? (
                        <div className={cn('grid items-start gap-4', columns === 2 && '@6xl:grid-cols-2')}>
                            {projects.map((project) => (
                                <Panel
                                    key={project.id}
                                    title={project.name}
                                    mark={<ProjectMark tones={project.tones} />}
                                    visibility={project.visibility}
                                    tasks={rows.filter((r) => r.project === project.id)}
                                    defaultGroupBy={defaultGroupBy}
                                    ctx={ctx}
                                    sort={sort}
                                    setSort={setSort}
                                />
                            ))}
                        </div>
                    ) : (
                        <Empty title={`No ${viewLabel} view yet`} body="Pass renderView to draw this view from the same filtered, sorted tasks." />
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

/* ---------------------------------- Shared ---------------------------------- */

type Ctx = {
    peopleById: Map<string, Person>
    labelsById: Map<string, Label>
    pageSize: number
    selected: string | null
    openTask: (task: Row) => void
}

const iconBox = 'grid size-8 shrink-0 cursor-pointer place-items-center rounded-[9px] text-foreground/70'
const textButton = 'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] px-2.5 text-[14px] leading-5 font-medium text-foreground/85'
const ghostIcon = 'grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-foreground/55 transition-colors hover:bg-foreground/[0.05] hover:text-foreground'

function Tip({ label, children }: { label: string; children: ReactElement }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
    )
}

function Badge({ children }: { children: ReactNode }) {
    return <span className="inline-flex h-4 shrink-0 items-center rounded-[5px] bg-foreground/[0.06] px-1.5 text-[11px] leading-none font-medium text-foreground/55 tabular-nums">{children}</span>
}

function ListMarkIcon() {
    return (
        <span aria-hidden className="grid size-[14px] place-items-center rounded-[4px] bg-foreground/[0.08] text-foreground/70">
            <List className="size-[10px]" />
        </span>
    )
}

function Empty({ title, body }: { title: string; body: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border px-6 py-16 text-center">
            <SearchX className="size-5 text-foreground/40" aria-hidden />
            <p className="text-[14px] font-medium">{title}</p>
            <p className="max-w-sm text-[13px] text-foreground/55">{body}</p>
        </div>
    )
}

function SortMenu({ sort, setSort, trigger }: { sort: Sort; setSort: (s: Sort) => void; trigger: 'button' | 'icon' }) {
    return (
        <DropdownMenu>
            {trigger === 'button' ? (
                <DropdownMenuTrigger className={cn(textButton, bordered, 'aria-expanded:bg-muted', focusRing)}>
                    <ArrowUpDown className="size-4 text-foreground/70" aria-hidden />
                    <span className="hidden @xl:inline">Sort</span>
                    <span className="sr-only @xl:hidden">Sort</span>
                </DropdownMenuTrigger>
            ) : (
                <DropdownMenuTrigger aria-label={`Sort by ${SORT_LABELS[sort.key].toLowerCase()}`} className={cn(ghostIcon, 'aria-expanded:bg-foreground/[0.05]', focusRing)}>
                    <ArrowDownWideNarrow className="size-4" aria-hidden />
                </DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sort.key} onValueChange={(key) => setSort({ ...sort, key: key as SortKey })}>
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                        <DropdownMenuRadioItem key={key} value={key}>
                            {SORT_LABELS[key]}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sort.dir} onValueChange={(dir) => setSort({ ...sort, dir: dir as Sort['dir'] })}>
                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function FilterMenu({ filters, setFilters, count, people, labels }: { filters: Filters; setFilters: (f: Filters) => void; count: number; people: Person[]; labels: Label[] }) {
    const groups: { key: keyof Filters; name: string; icon: Icon; options: { id: string; name: string; render: ReactNode }[] }[] = [
        { key: 'status', name: 'Status', icon: CircleCheck, options: sample.STATUSES.map((s) => ({ id: s.id, name: s.name, render: <StatusIcon status={s.id} /> })) },
        { key: 'priority', name: 'Priority', icon: Flag, options: sample.PRIORITIES.map((p) => ({ id: p.id, name: p.name, render: <PriorityIcon priority={p.id} /> })) },
        { key: 'label', name: 'Label', icon: Hash, options: labels.map((l) => ({ id: l.id, name: l.name, render: <Hash className="size-[14px]" style={{ color: tone(l.tone) }} aria-hidden /> })) },
        { key: 'assignee', name: 'Assignee', icon: Users, options: people.map((p) => ({ id: p.id, name: p.name, render: <Orb person={p} size={14} /> })) },
    ]
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={cn(textButton, bordered, 'aria-expanded:bg-muted', focusRing)}>
                <SlidersHorizontal className="size-4 text-foreground/70" aria-hidden />
                <span className="hidden @xl:inline">Filter{count ? ` (${count})` : ''}</span>
                <span className="sr-only @xl:hidden">Filter{count ? `, ${count} active` : ''}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                {groups.map((group) => {
                    const active = filters[group.key] as string[]
                    return (
                        <DropdownMenuSub key={group.key}>
                            <DropdownMenuSubTrigger className="gap-2">
                                <group.icon className="size-4 text-foreground/60" aria-hidden />
                                <span className="flex-1">{group.name}</span>
                                {active.length ? <Badge>{active.length}</Badge> : null}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="max-h-72 w-52 overflow-y-auto">
                                {group.options.map((option) => (
                                    <DropdownMenuCheckboxItem
                                        key={option.id}
                                        checked={active.includes(option.id)}
                                        closeOnSelect={false}
                                        onCheckedChange={() => setFilters({ ...filters, [group.key]: toggleIn(active, option.id) })}
                                        className="gap-2">
                                        {option.render}
                                        {option.name}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )
                })}
                {count ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setFilters(EMPTY_FILTERS)}>Clear filters</DropdownMenuItem>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/* ---------------------------------- Panel ---------------------------------- */

type Group = { key: string; name: string; icon: ReactNode; rows: Row[] }

function groupRows(rows: Row[], by: GroupBy, ctx: Ctx): Group[] {
    if (by === 'none') return [{ key: 'all', name: 'All tasks', icon: <Hash className="size-4 text-foreground/50" aria-hidden />, rows }]
    const map = new Map<string, Row[]>()
    for (const row of rows) {
        const key = by === 'label' ? row.label : by === 'assignee' ? row.assignee : by === 'status' ? row.status : by === 'priority' ? row.priority : (row.parent ?? '')
        map.set(key, [...(map.get(key) ?? []), row])
    }
    // A stable, meaningful order: labels and people as given, statuses and priorities by rank.
    const order =
        by === 'label'
            ? [...ctx.labelsById.keys()]
            : by === 'assignee'
              ? [...ctx.peopleById.keys()]
              : by === 'status'
                ? sample.STATUSES.map((s) => s.id)
                : by === 'priority'
                  ? sample.PRIORITIES.map((p) => p.id)
                  : [...map.keys()].sort((a, b) => (a ? (b ? a.localeCompare(b) : -1) : 1))
    return order
        .filter((key) => map.has(key))
        .map((key) => {
            const rows = map.get(key)!
            if (by === 'label') {
                const label = ctx.labelsById.get(key)
                return { key, name: label?.name ?? key, icon: <Hash className="size-4" style={{ color: label ? tone(label.tone) : undefined }} aria-hidden />, rows }
            }
            if (by === 'assignee') {
                const person = ctx.peopleById.get(key)
                return { key, name: person?.name ?? key, icon: person ? <Orb person={person} size={16} /> : null, rows }
            }
            if (by === 'status') return { key, name: sample.STATUSES.find((s) => s.id === key)!.name, icon: <StatusIcon status={key as Status} />, rows }
            if (by === 'priority') return { key, name: sample.PRIORITIES.find((p) => p.id === key)!.name, icon: <PriorityIcon priority={key as Priority} />, rows }
            return { key: key || 'none', name: key || 'No parent', icon: <ArrowRightLeft className="size-4 text-foreground/50" aria-hidden />, rows }
        })
}

const GROUP_CHIPS: { id: GroupBy; icon: Icon }[] = [
    { id: 'label', icon: Hash },
    { id: 'assignee', icon: Users },
    { id: 'status', icon: StatusRing },
    { id: 'parent', icon: ArrowRightLeft },
    { id: 'priority', icon: Flag },
]

function StatusRing(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 16 16" {...props}>
            <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    )
}

function Panel({
    title,
    mark,
    visibility,
    tasks,
    defaultGroupBy,
    ctx,
    sort,
    setSort,
}: {
    title: string
    mark: ReactNode
    visibility?: 'public' | 'private'
    tasks: Row[]
    defaultGroupBy: GroupBy
    ctx: Ctx
    sort: Sort
    setSort: (s: Sort) => void
}) {
    const [groupBy, setGroupBy] = useState<GroupBy>(defaultGroupBy)
    const [showDone, setShowDone] = useState(true)
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
    const [assignee, setAssignee] = useState<string | null>(null)
    const visible = tasks.filter((t) => (showDone || t.status !== 'done') && (!assignee || t.assignee === assignee))
    const groups = groupRows(visible, groupBy, ctx)
    const toggleGroup = (key: string) =>
        setCollapsed((set) => {
            const next = new Set(set)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })

    return (
        <section aria-label={title} className="overflow-hidden rounded-[14px] border border-border/70 bg-card">
            {/* Header */}
            <div className="flex h-[46px] items-center gap-3 border-b border-border/60 ps-7 pe-3 pt-1">
                {mark}
                <h2 className="truncate text-[14px] leading-5 font-semibold">{title}</h2>
                {visibility === 'public' ? <Globe className="size-[15px] shrink-0 text-foreground/55" aria-label="Public" /> : visibility === 'private' ? <Lock className="size-[15px] shrink-0 text-foreground/55" aria-label="Private" /> : null}
                <Badge>{visible.length}</Badge>
                <div className="ms-auto flex items-center">
                    <SortMenu sort={sort} setSort={setSort} trigger="icon" />
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label={assignee ? `Assignee: ${ctx.peopleById.get(assignee)?.name}` : 'Filter by assignee'} className={cn(ghostIcon, (assignee && 'bg-foreground/[0.06] text-foreground') || 'aria-expanded:bg-foreground/[0.05]', focusRing)}>
                            {assignee && ctx.peopleById.get(assignee) ? <Orb person={ctx.peopleById.get(assignee)!} size={16} /> : <User className="size-4" aria-hidden />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuRadioGroup value={assignee ?? ''} onValueChange={(v) => setAssignee(v || null)}>
                                <DropdownMenuRadioItem value="">Everyone</DropdownMenuRadioItem>
                                {[...ctx.peopleById.values()].map((p) => (
                                    <DropdownMenuRadioItem key={p.id} value={p.id} className="gap-2">
                                        <Orb person={p} size={14} />
                                        {p.name}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label={`${title} options`} className={cn(ghostIcon, 'aria-expanded:bg-foreground/[0.05]', focusRing)}>
                            <MoreHorizontal className="size-4" aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onSelect={() => setCollapsed(new Set())}>Expand all groups</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setCollapsed(new Set(groups.map((g) => g.key)))}>Collapse all groups</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setShowDone(!showDone)}>{showDone ? 'Hide completed' : 'Show completed'}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Group-by chips */}
            <div className="flex h-11 items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/20 ps-[21px] pe-3 [scrollbar-width:none]">
                <Tip label={showDone ? 'Hide completed' : 'Show completed'}>
                    <button type="button" aria-label="Show completed" aria-pressed={showDone} onClick={() => setShowDone(!showDone)} className={cn('grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-foreground/60 transition-colors aria-pressed:bg-foreground/[0.07] aria-pressed:text-foreground/80 hover:bg-foreground/[0.09]', focusRing)}>
                        <Check className="size-3.5" aria-hidden />
                    </button>
                </Tip>
                <div role="radiogroup" aria-label="Group by" className="flex items-center gap-1.5">
                    {GROUP_CHIPS.map((chip) => (
                        <button
                            key={chip.id}
                            type="button"
                            role="radio"
                            aria-checked={groupBy === chip.id}
                            onClick={() => setGroupBy(chip.id)}
                            className={cn(
                                'flex h-6 shrink-0 cursor-pointer items-center gap-[5px] rounded-full px-[9px] text-[12px] leading-4 font-medium transition-colors',
                                groupBy === chip.id ? 'bg-foreground/[0.07] text-foreground' : 'border border-border/80 text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground',
                                focusRing,
                            )}>
                            <chip.icon className="size-3" aria-hidden />
                            {GROUP_LABELS[chip.id]}
                        </button>
                    ))}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger aria-label="More grouping options" className={cn('grid h-6 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-foreground/55 hover:bg-foreground/[0.05]', groupBy === 'none' && 'bg-foreground/[0.07] text-foreground', focusRing)}>
                        <MoreHorizontal className="size-4" aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuRadioGroup value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                            <DropdownMenuRadioItem value="none">No grouping</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Groups */}
            {groups.length ? (
                groups.map((group) => <GroupBlock key={group.key} group={group} collapsed={collapsed.has(group.key)} onToggle={() => toggleGroup(group.key)} ctx={ctx} />)
            ) : (
                <div className="p-4">
                    <Empty title="No tasks match" body="Clear the search or a filter to see tasks here." />
                </div>
            )}
        </section>
    )
}

function GroupBlock({ group, collapsed, onToggle, ctx }: { group: Group; collapsed: boolean; onToggle: () => void; ctx: Ctx }) {
    const [page, setPage] = useState(0)
    const [reversed, setReversed] = useState(false)
    const pages = Math.max(1, Math.ceil(group.rows.length / ctx.pageSize))
    const current = Math.min(page, pages - 1)
    const ordered = reversed ? [...group.rows].reverse() : group.rows
    const shown = ordered.slice(current * ctx.pageSize, (current + 1) * ctx.pageSize)
    const listId = `group-${group.key}`

    return (
        <div className="border-b border-border/60 last:border-b-0">
            <div className="flex h-12 items-center gap-3 ps-7 pe-3">
                {group.icon}
                <h3 className="truncate text-[12.5px] leading-4 font-medium tracking-[0.02em] text-foreground/65 uppercase">{group.name}</h3>
                <Badge>{group.rows.length}</Badge>
                <div className="ms-auto flex items-center">
                    <Tip label={collapsed ? 'Show tasks' : 'Hide tasks'}>
                        <button type="button" aria-label={collapsed ? `Show ${group.name}` : `Hide ${group.name}`} aria-expanded={!collapsed} aria-controls={listId} onClick={onToggle} className={cn(ghostIcon, collapsed && 'bg-foreground/[0.06] text-foreground', focusRing)}>
                            <EyeOff className="size-4" aria-hidden />
                        </button>
                    </Tip>
                    <Tip label={reversed ? 'Restore order' : 'Reverse order'}>
                        <button type="button" aria-label={`Reverse ${group.name} order`} aria-pressed={reversed} onClick={() => setReversed(!reversed)} className={cn(ghostIcon, 'aria-pressed:bg-foreground/[0.06] aria-pressed:text-foreground', focusRing)}>
                            <ArrowDownWideNarrow className={cn('size-4 transition-transform', reversed && 'rotate-180')} aria-hidden />
                        </button>
                    </Tip>
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label={`${group.name} options`} className={cn(ghostIcon, 'aria-expanded:bg-foreground/[0.05]', focusRing)}>
                            <MoreHorizontal className="size-4" aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onSelect={onToggle}>{collapsed ? 'Show tasks' : 'Hide tasks'}</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setPage(0)} disabled={current === 0}>
                                First page
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setPage(pages - 1)} disabled={current === pages - 1}>
                                Last page
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {!collapsed ? (
                <div id={listId} className="px-[15px] pb-3.5">
                    <ul className="flex flex-col gap-2">
                        {shown.map((row) => (
                            <li key={row.id}>
                                <TaskRow row={row} ctx={ctx} />
                            </li>
                        ))}
                    </ul>
                    {pages > 1 ? <Pager page={current} pages={pages} total={group.rows.length} size={ctx.pageSize} onPage={setPage} label={group.name} className="mt-2.5 ps-3" /> : null}
                </div>
            ) : null}
        </div>
    )
}

function TaskRow({ row, ctx }: { row: Row; ctx: Ctx }) {
    const person = ctx.peopleById.get(row.assignee)
    const label = ctx.labelsById.get(row.label)
    const current = ctx.selected === row.id
    return (
        <button
            type="button"
            aria-current={current ? 'true' : undefined}
            onClick={() => ctx.openTask(row)}
            className={cn(
                'flex h-9 w-full min-w-0 cursor-pointer items-center rounded-[11px] border border-border/70 bg-card ps-3 pe-2.5 text-start shadow-[0_1px_1px_rgb(0_0_0/0.02)] transition-colors hover:bg-muted/40',
                current && 'border-ring/40 bg-muted/50',
                focusRing,
            )}>
            <StatusIcon status={row.status} />
            <PriorityIcon priority={row.priority} className="ms-2.5" />
            <span className="ms-[13px] min-w-0 truncate text-[14px] leading-5 font-medium text-foreground/85">{row.title}</span>
            {row.subtasks ? (
                <span className="ms-4 hidden shrink-0 items-center gap-1 text-[11px] text-foreground/35 tabular-nums @xl:flex" aria-label={`${row.subtasks} subtasks`}>
                    <ArrowRightLeft className="size-3" aria-hidden />
                    {row.subtasks}
                </span>
            ) : null}
            <span className="ms-auto flex shrink-0 items-center ps-3">
                {label ? (
                    <span className="me-3 hidden h-5 items-center gap-1 rounded-full border border-border/70 px-2 text-[10.5px] leading-none font-medium tracking-[0.03em] text-foreground/55 uppercase @xl:inline-flex">
                        <Hash className="size-2.5" aria-hidden />
                        {label.name}
                    </span>
                ) : null}
                <span className="w-[52px] text-end text-[13px] leading-5 text-foreground/60 tabular-nums">{shortDate(row.due)}</span>
                {person ? <Orb person={person} className="ms-5" /> : null}
            </span>
        </button>
    )
}

function Pager({ page, pages, total, size, onPage, label, className }: { page: number; pages: number; total: number; size: number; onPage: (p: number) => void; label: string; className?: string }) {
    const from = page * size + 1
    const to = Math.min(total, (page + 1) * size)
    return (
        <nav aria-label={`${label} pages`} className={cn('flex items-center gap-1 text-[12px] text-foreground/55 tabular-nums', className)}>
            <span className="me-auto">
                {from}–{to} of {total}
            </span>
            <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} className={cn(ghostIcon, 'size-6 disabled:pointer-events-none disabled:opacity-35', focusRing)}>
                <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden />
            </button>
            <span aria-live="polite" className="min-w-10 text-center">
                {page + 1} / {pages}
            </span>
            <button type="button" aria-label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} className={cn(ghostIcon, 'size-6 disabled:pointer-events-none disabled:opacity-35', focusRing)}>
                <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />
            </button>
        </nav>
    )
}

/* ---------------------------------- Table view ---------------------------------- */

const COLUMNS: { key: SortKey | null; label: string; className: string }[] = [
    { key: 'title', label: 'Task', className: 'min-w-[260px]' },
    { key: null, label: 'Project', className: 'w-[150px]' },
    { key: 'status', label: 'Status', className: 'w-[130px]' },
    { key: 'priority', label: 'Priority', className: 'w-[120px]' },
    { key: null, label: 'Label', className: 'w-[130px]' },
    { key: 'due', label: 'Due', className: 'w-[90px]' },
    { key: null, label: 'Assignee', className: 'w-[170px]' },
]

function DataTable({ rows, ctx, sort, setSort, projects, pageSize }: { rows: Row[]; ctx: Ctx; sort: Sort; setSort: (s: Sort) => void; projects: Project[]; pageSize: number }) {
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(pageSize)
    const pages = Math.max(1, Math.ceil(rows.length / size))
    const current = Math.min(page, pages - 1)
    const shown = rows.slice(current * size, (current + 1) * size)
    const projectsById = new Map(projects.map((p) => [p.id, p]))

    if (!rows.length) return <Empty title="No tasks match" body="Clear the search or a filter to see tasks here." />
    return (
        <div className="overflow-hidden rounded-[14px] border border-border/70 bg-card">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-start text-[14px] leading-5">
                    <thead>
                        <tr className="h-10 border-b border-border/70 bg-muted/30">
                            {COLUMNS.map((col) => {
                                const active = col.key && sort.key === col.key
                                return (
                                    <th key={col.label} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined} className={cn('px-3 text-start text-[12.5px] font-medium text-foreground/60 first:ps-5', col.className)}>
                                        {col.key ? (
                                            <button
                                                type="button"
                                                onClick={() => setSort({ key: col.key!, dir: active && sort.dir === 'asc' ? 'desc' : 'asc' })}
                                                className={cn('-mx-1.5 inline-flex h-7 cursor-pointer items-center gap-1 rounded-[7px] px-1.5 hover:bg-foreground/[0.05] hover:text-foreground', active && 'text-foreground', focusRing)}>
                                                {col.label}
                                                <ArrowUpDown className={cn('size-3.5', active ? 'opacity-90' : 'opacity-40')} aria-hidden />
                                            </button>
                                        ) : (
                                            col.label
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((row) => {
                            const person = ctx.peopleById.get(row.assignee)
                            const label = ctx.labelsById.get(row.label)
                            const project = projectsById.get(row.project)
                            return (
                                <tr key={row.id} aria-selected={ctx.selected === row.id} onClick={() => ctx.openTask(row)} className="h-11 cursor-pointer border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/40 aria-selected:bg-muted/60">
                                    <td className="ps-5 pe-3">
                                        <button type="button" onClick={(e) => (e.stopPropagation(), ctx.openTask(row))} className={cn('flex min-w-0 cursor-pointer items-center gap-2.5 rounded-[6px] text-start font-medium text-foreground/85', focusRing)}>
                                            <span className="truncate">{row.title}</span>
                                            {row.subtasks ? (
                                                <span className="flex shrink-0 items-center gap-1 text-[11px] font-normal text-foreground/35 tabular-nums">
                                                    <ArrowRightLeft className="size-3" aria-hidden />
                                                    {row.subtasks}
                                                </span>
                                            ) : null}
                                        </button>
                                    </td>
                                    <td className="px-3">
                                        {project ? (
                                            <span className="flex items-center gap-2 text-foreground/70">
                                                <ProjectMark tones={project.tones} className="size-3" />
                                                <span className="truncate">{project.name}</span>
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-3">
                                        <span className="flex items-center gap-2 text-foreground/70">
                                            <StatusIcon status={row.status} />
                                            {sample.STATUSES.find((s) => s.id === row.status)?.name}
                                        </span>
                                    </td>
                                    <td className="px-3">
                                        <span className="flex items-center gap-2 text-foreground/70">
                                            <PriorityIcon priority={row.priority} />
                                            {sample.PRIORITIES.find((p) => p.id === row.priority)?.name}
                                        </span>
                                    </td>
                                    <td className="px-3">
                                        {label ? (
                                            <span className="inline-flex h-5 items-center gap-1 rounded-full border border-border/70 px-2 text-[10.5px] leading-none font-medium tracking-[0.03em] text-foreground/55 uppercase">
                                                <Hash className="size-2.5" style={{ color: tone(label.tone) }} aria-hidden />
                                                {label.name}
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-3 text-foreground/60 tabular-nums">{shortDate(row.due)}</td>
                                    <td className="px-3">
                                        {person ? (
                                            <span className="flex items-center gap-2 text-foreground/70">
                                                <Orb person={person} />
                                                <span className="truncate">{person.name}</span>
                                            </span>
                                        ) : null}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 px-5 py-2.5 text-[12.5px] text-foreground/60">
                <DropdownMenu>
                    <DropdownMenuTrigger className={cn('flex h-7 cursor-pointer items-center gap-1.5 rounded-[7px] px-2 hover:bg-foreground/[0.05]', focusRing)}>
                        Rows per page <span className="font-medium text-foreground tabular-nums">{size}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-32">
                        <DropdownMenuRadioGroup value={String(size)} onValueChange={(v) => (setSize(Number(v)), setPage(0))}>
                            {[10, 20, 50].map((n) => (
                                <DropdownMenuRadioItem key={n} value={String(n)}>
                                    {n}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Pager page={current} pages={pages} total={rows.length} size={size} onPage={setPage} label="Table" className="flex-1 text-[12.5px]" />
            </div>
        </div>
    )
}

