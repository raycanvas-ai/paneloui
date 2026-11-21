'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ArrowUp, Check, CircleCheck, Ellipsis, Flag, Link2, Plus, Share2, VolumeX } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/panelo/ui/avatar'
import { Checkbox } from '@/components/panelo/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/panelo/ui/dialog'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/panelo/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/panelo/ui/select'
import { Textarea } from '@/components/panelo/ui/textarea'
import { cn } from '@/components/panelo/lib/utils'

import { focusRing, LISTS, person } from './data'

/* The profile's actions: more menu, hire request, message thread and saved lists. */

export const outlineButton = cn('inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border border-border bg-background px-4 text-[13.5px] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-muted aria-expanded:bg-muted', focusRing)
export const solidButton = cn('inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] bg-foreground px-4 text-[13.5px] font-medium text-background shadow-[0_1px_2px_rgb(0_0_0/0.1)] transition-colors hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-50', focusRing)

/** A short confirmation at the bottom of the screen. */
export function useToast() {
    const [text, setText] = useState<string | null>(null)
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
    const show = (message: string) => {
        clearTimeout(timer.current)
        setText(message)
        timer.current = setTimeout(() => setText(null), 2400)
    }
    useEffect(() => () => clearTimeout(timer.current), [])
    const node = (
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
            {text ? (
                <p className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background shadow-lg">
                    <CircleCheck className="size-4" aria-hidden />
                    {text}
                </p>
            ) : null}
        </div>
    )
    return [show, node] as const
}

/* --------------------------------- More menu -------------------------------- */

export function MoreMenu({ notify }: { notify: (text: string) => void }) {
    const [muted, setMuted] = useState(false)
    const link = () => (typeof window === 'undefined' ? '' : `${window.location.origin}/@mina`)
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link())
            notify('Profile link copied')
        } catch {
            notify('Couldn’t reach the clipboard')
        }
    }
    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: person.name, url: link() })
            } catch {
                /* closing the share sheet is not an error */
            }
        } else copy()
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger aria-label="More options" className={cn(outlineButton, 'w-9 px-0')}>
                <Ellipsis className="size-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={copy}>
                    <Link2 aria-hidden />
                    Copy profile link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={share}>
                    <Share2 aria-hidden />
                    Share profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={muted} onCheckedChange={() => (setMuted((m) => !m), notify(muted ? `Updates from ${person.first} back on` : `Updates from ${person.first} muted`))}>
                    <VolumeX aria-hidden />
                    Mute updates
                </DropdownMenuCheckboxItem>
                <DropdownMenuItem onClick={() => notify('Thanks, we’ll review this profile')} className="text-destructive">
                    <Flag aria-hidden />
                    Report profile
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/* --------------------------------- Hire me ---------------------------------- */

const PROJECTS = ['Product design', 'UX audit', 'Webflow build', 'Brand strategy']
const BUDGETS = ['Under $5k', '$5k – $15k', '$15k – $40k', '$40k +']
const TIMELINES = ['As soon as possible', 'Within a month', 'In 1–3 months', 'Just exploring']

export function HireDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const id = useId()
    const [project, setProject] = useState(PROJECTS[0])
    const [budget, setBudget] = useState(BUDGETS[1])
    const [timeline, setTimeline] = useState(TIMELINES[1])
    const [brief, setBrief] = useState('')
    const [tried, setTried] = useState(false)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        if (open) (setSent(false), setTried(false))
    }, [open])

    const pick = (label: string, value: string, set: (v: string) => void, options: string[]) => (
        <div className="grid gap-1.5">
            <span className="text-[12.5px] font-medium text-muted-foreground">{label}</span>
            <Select value={value} onValueChange={(v) => v && set(String(v))}>
                <SelectTrigger aria-label={label} className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (
                        <SelectItem key={o} value={o}>
                            {o}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                {sent ? (
                    <div className="grid justify-items-center gap-3 py-4 text-center">
                        <span className="grid size-11 place-items-center rounded-full bg-[color-mix(in_oklab,var(--tone-green-solid)_14%,transparent)] text-[var(--tone-green-solid)]">
                            <Check className="size-5" strokeWidth={2.5} aria-hidden />
                        </span>
                        <DialogTitle>Request sent to {person.first}</DialogTitle>
                        <DialogDescription>
                            {person.first} {person.replies.charAt(0).toLowerCase() + person.replies.slice(1)}. The reply lands in your inbox.
                        </DialogDescription>
                        <button type="button" onClick={() => onOpenChange(false)} className={cn(solidButton, 'mt-2 w-full')}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form
                        className="grid gap-4"
                        onSubmit={(e) => {
                            e.preventDefault()
                            setTried(true)
                            if (brief.trim().length >= 10) setSent(true)
                        }}>
                        <DialogHeader>
                            <DialogTitle>Hire {person.first}</DialogTitle>
                            <DialogDescription>Share the basics and {person.first} will reply with availability and a quote.</DialogDescription>
                        </DialogHeader>
                        {pick('Project type', project, setProject, PROJECTS)}
                        <div className="grid grid-cols-2 gap-3">
                            {pick('Budget', budget, setBudget, BUDGETS)}
                            {pick('Start', timeline, setTimeline, TIMELINES)}
                        </div>
                        <div className="grid gap-1.5">
                            <label htmlFor={`${id}-brief`} className="text-[12.5px] font-medium text-muted-foreground">
                                Project details
                            </label>
                            <Textarea id={`${id}-brief`} rows={4} value={brief} onChange={(e) => setBrief(e.currentTarget.value)} placeholder={`What are you building, and where could ${person.first} help?`} aria-invalid={tried && brief.trim().length < 10 ? true : undefined} aria-describedby={`${id}-hint`} />
                            <p id={`${id}-hint`} className={cn('text-[12px]', tried && brief.trim().length < 10 ? 'text-destructive' : 'text-muted-foreground')}>
                                {tried && brief.trim().length < 10 ? `Add a sentence or two so ${person.first} can quote.` : 'A sentence or two is plenty.'}
                            </p>
                        </div>
                        <DialogFooter>
                            <button type="button" onClick={() => onOpenChange(false)} className={outlineButton}>
                                Cancel
                            </button>
                            <button type="submit" className={solidButton}>
                                Send request
                            </button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

/* --------------------------------- Message ---------------------------------- */

type Sent = { id: number; text: string; at: string }

export function MessageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [draft, setDraft] = useState('')
    const [thread, setThread] = useState<Sent[]>([])
    const end = useRef<HTMLLIElement>(null)
    useEffect(() => {
        // Braced: scrollIntoView returns a Promise in newer browsers, and an effect may only return a cleanup.
        end.current?.scrollIntoView({ block: 'nearest' })
    }, [thread])

    const send = () => {
        const text = draft.trim()
        if (!text) return
        setThread((t) => [...t, { id: Date.now(), text, at: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }])
        setDraft('')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-0 sm:max-w-[440px]">
                <DialogHeader className="flex-row items-center gap-3 border-b border-border/70 p-4 text-start">
                    <Avatar className="size-9">
                        <AvatarImage src={person.avatar} alt="" />
                        <AvatarFallback>{person.first[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <DialogTitle className="text-[15px]">{person.name}</DialogTitle>
                        <DialogDescription className="text-[12.5px]">{person.replies}</DialogDescription>
                    </div>
                </DialogHeader>
                <ul className="flex max-h-[280px] min-h-[160px] flex-col gap-2 overflow-y-auto p-4">
                    {thread.length ? (
                        thread.map((m) => (
                            <li key={m.id} className="flex flex-col items-end gap-0.5">
                                <p className="max-w-[80%] rounded-[14px] rounded-br-[4px] bg-foreground px-3 py-2 text-[13.5px] whitespace-pre-wrap text-background">{m.text}</p>
                                <span className="text-[11px] text-muted-foreground">Sent {m.at}</span>
                            </li>
                        ))
                    ) : (
                        <li className="m-auto max-w-[260px] text-center text-[13px] text-muted-foreground">Say hello, or ask {person.first} about a project. Messages stay in your inbox.</li>
                    )}
                    <li ref={end} aria-hidden />
                </ul>
                <form
                    className="flex items-end gap-2 border-t border-border/70 p-3"
                    onSubmit={(e) => {
                        e.preventDefault()
                        send()
                    }}>
                    <Textarea
                        autoFocus
                        rows={1}
                        value={draft}
                        onChange={(e) => setDraft(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) (e.preventDefault(), send())
                        }}
                        placeholder={`Message ${person.first}…`}
                        aria-label={`Message ${person.first}`}
                        className="max-h-32 min-h-9 resize-none"
                    />
                    <button type="submit" aria-label="Send" disabled={!draft.trim()} className={cn(solidButton, 'size-9 shrink-0 px-0')}>
                        <ArrowUp className="size-4" aria-hidden />
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

/* ------------------------------- Add to list -------------------------------- */

export function AddToList({ notify }: { notify: (text: string) => void }) {
    const [lists, setLists] = useState(LISTS)
    const [saved, setSaved] = useState<Set<string>>(new Set())
    const [name, setName] = useState('')

    const toggle = (list: string, on: boolean) =>
        setSaved((prev) => {
            const next = new Set(prev)
            if (on) next.add(list)
            else next.delete(list)
            return next
        })
    const create = () => {
        const n = name.trim()
        if (!n) return
        if (!lists.includes(n)) setLists((l) => [...l, n])
        toggle(n, true)
        setName('')
        notify(`Added to “${n}”`)
    }

    let label: ReactNode = 'Add to list'
    if (saved.size === 1) label = <><Check className="size-4" aria-hidden />In {[...saved][0]}</>
    else if (saved.size > 1) label = <><Check className="size-4" aria-hidden />In {saved.size} lists</>

    return (
        <Popover>
            <PopoverTrigger className={cn(outlineButton, 'min-w-0 px-3')}>
                <span className="flex min-w-0 items-center gap-1.5 truncate">{label}</span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1.5">
                <p className="px-2 pt-1.5 pb-1 text-[12px] font-medium text-muted-foreground">Save {person.first} to</p>
                <ul>
                    {lists.map((list) => (
                        <li key={list}>
                            <label className="flex h-8 cursor-pointer items-center gap-2.5 rounded-[7px] px-2 text-[13.5px] hover:bg-muted">
                                <Checkbox checked={saved.has(list)} onCheckedChange={(checked) => toggle(list, checked === true)} />
                                <span className="truncate">{list}</span>
                            </label>
                        </li>
                    ))}
                </ul>
                <form
                    className="mt-1 flex items-center gap-1.5 border-t border-border/70 px-1 pt-1.5"
                    onSubmit={(e) => {
                        e.preventDefault()
                        create()
                    }}>
                    <Plus className="ms-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="New list, then Enter" aria-label="New list name" className="h-8 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-[13.5px]" />
                </form>
            </PopoverContent>
        </Popover>
    )
}
