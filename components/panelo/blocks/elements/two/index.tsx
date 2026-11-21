'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, Command, CornerDownLeft, LoaderCircle, Search } from 'lucide-react'

import { Button } from '@/components/panelo/ui/button'
import { cn } from '@/components/panelo/lib/utils'

import { agentsOnline, commandGroups, type CommandItem } from './data'

type RunState = { item: CommandItem; done: boolean } | null

function CommandPalette({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
    const listId = useId()
    const [query, setQuery] = useState('')
    const [activeId, setActiveId] = useState(commandGroups[0].items[0].id)
    const [run, setRun] = useState<RunState>(null)

    const q = query.trim().toLowerCase()
    const groups = commandGroups
        .map((group) => ({ ...group, items: group.items.filter((item) => !q || `${item.label} ${item.sublabel}`.toLowerCase().includes(q)) }))
        .filter((group) => group.items.length > 0)
    const visible = groups.flatMap((group) => group.items)
    const active = visible.find((item) => item.id === activeId) ?? visible[0]

    // A run reads "Running" briefly, then settles on "Done".
    useEffect(() => {
        if (!run || run.done) return
        const timer = setTimeout(() => setRun({ item: run.item, done: true }), 1200)
        return () => clearTimeout(timer)
    }, [run])

    function move(delta: number) {
        if (!visible.length) return
        const at = Math.max(0, visible.indexOf(active))
        setActiveId(visible[(at + delta + visible.length) % visible.length].id)
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            move(event.key === 'ArrowDown' ? 1 : -1)
        } else if (event.key === 'Enter' && active) {
            event.preventDefault()
            setRun({ item: active, done: false })
        } else if (event.key === 'Escape') {
            setQuery('')
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10">
            {/* Search */}
            <div className="flex h-14 items-center gap-3 border-b border-border/60 px-4">
                <Search
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                />
                <input
                    ref={inputRef}
                    role="combobox"
                    aria-label="Search agents and actions"
                    aria-expanded
                    aria-controls={listId}
                    aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
                    aria-autocomplete="list"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask an agent or run a task…"
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <kbd className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-xs font-medium text-muted-foreground">esc</kbd>
            </div>

            {/* Results */}
            <div
                id={listId}
                role="listbox"
                aria-label="Agents and actions"
                className="flex h-[312px] flex-col gap-0.5 overflow-y-auto p-2">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        role="group"
                        aria-labelledby={`${listId}-${group.id}`}
                        className="flex flex-col gap-0.5">
                        <p
                            id={`${listId}-${group.id}`}
                            className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                            {group.label}
                        </p>
                        {group.items.map((item) => {
                            const selected = item.id === active?.id
                            const Icon = item.icon
                            return (
                                <div
                                    key={item.id}
                                    id={`${listId}-${item.id}`}
                                    role="option"
                                    aria-selected={selected}
                                    onMouseMove={() => setActiveId(item.id)}
                                    onClick={() => {
                                        setRun({ item, done: false })
                                        inputRef.current?.focus()
                                    }}
                                    className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2', selected && 'bg-muted')}>
                                    <span
                                        className={cn(
                                            'grid size-8 shrink-0 place-items-center rounded-lg ring-1 transition-colors duration-150',
                                            selected ? 'bg-tone-blue-bg text-tone-blue-fg ring-tone-blue-border' : 'bg-background text-muted-foreground ring-border'
                                        )}>
                                        <Icon
                                            className="size-4"
                                            strokeWidth={1.75}
                                            aria-hidden
                                        />
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
                                        <span className="truncate text-xs text-muted-foreground">{item.sublabel}</span>
                                    </span>
                                    {selected && (
                                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                                            Run
                                            <kbd className="grid size-5 place-items-center rounded border border-border bg-background">
                                                <CornerDownLeft
                                                    className="size-3"
                                                    aria-hidden
                                                />
                                            </kbd>
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
                {visible.length === 0 && <p className="m-auto text-sm text-muted-foreground">No agents or actions match “{query.trim()}”</p>}
            </div>

            {/* Status */}
            <div
                aria-live="polite"
                className="flex h-10 items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-4 text-xs text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                    {run ? (
                        run.done ? (
                            <Check
                                className="size-3.5 shrink-0 text-tone-blue-fg"
                                aria-hidden
                            />
                        ) : (
                            <LoaderCircle
                                className="size-3.5 shrink-0 animate-spin"
                                aria-hidden
                            />
                        )
                    ) : null}
                    <span className="truncate">{run ? `${run.done ? 'Handed to' : 'Sending to'} ${run.item.agent}: ${run.item.label}` : 'Workforce ready'}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                    <span
                        className="size-1.5 rounded-full bg-tone-green-solid"
                        aria-hidden
                    />
                    {agentsOnline} agents online
                </span>
            </div>
        </div>
    )
}

export default function CommandWorkforceSection() {
    const inputRef = useRef<HTMLInputElement>(null)

    // ⌘K / Ctrl+K jumps straight into the palette from anywhere on the page.
    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                inputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    return (
        <section
            aria-labelledby="elements-two-heading"
            className="flex min-h-svh w-full flex-col items-center justify-center gap-10 bg-background px-6 py-20">
            <div className="w-full max-w-xl">
                <CommandPalette inputRef={inputRef} />
            </div>

            <div className="flex max-w-md flex-col items-center gap-6 text-center">
                <div className="flex flex-col gap-2.5">
                    <h2
                        id="elements-two-heading"
                        className="text-3xl font-semibold tracking-tight text-balance text-foreground">
                        Command your workforce
                    </h2>
                    <p className="text-sm leading-relaxed text-pretty text-muted-foreground">Summon any agent or run a task from anywhere. One keystroke opens your whole workforce.</p>
                </div>
                <Button
                    className="rounded-lg"
                    onClick={() => inputRef.current?.focus()}>
                    <Command aria-hidden />
                    Open command menu
                    <kbd className="ml-1 rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 py-0.5 font-sans text-xs font-medium text-primary-foreground/80">⌘K</kbd>
                </Button>
            </div>
        </section>
    )
}
