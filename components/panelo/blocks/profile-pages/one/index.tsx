'use client'

import { useId, useState } from 'react'
import { ArrowDown, ArrowUpRight, BadgeCheck, Check, Plus, X } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/panelo/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/panelo/ui/tooltip'
import { cn } from '@/components/panelo/lib/utils'

import { AddToList, HireDialog, MessageDialog, MoreMenu, outlineButton, solidButton, useToast } from './actions'
import { BrandMark, SiteArt, TINT } from './art'
import { type CaseStudy, caseStudies, focusRing, person, type Skill, SKILLS } from './data'
import { AustraliaFlag } from './flag'

/* -------------------------------------------------------------------------- */
/*  Profile page (pro profile-pages/one): cover and avatar, follow, hire and   */
/*  message, an about card that expands, a details card whose skills filter    */
/*  the case studies, and a case-study carousel that opens each project.       */
/* -------------------------------------------------------------------------- */

export default function ProfilePage() {
    const [following, setFollowing] = useState(false)
    const [hiring, setHiring] = useState(false)
    const [messaging, setMessaging] = useState(false)
    const [skill, setSkill] = useState<Skill | null>(null)
    const [notify, toast] = useToast()

    const follow = () => {
        setFollowing((f) => !f)
        notify(following ? `You unfollowed ${person.first}` : `You’re following ${person.first}`)
    }

    return (
        <div className="min-h-svh bg-card text-foreground">
            <Cover />
            <main className="mx-auto max-w-[880px] px-5 pb-20 sm:px-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                    <div className="relative -mt-12 size-24 shrink-0 sm:-mt-9 sm:size-[136px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={person.avatar} alt={person.name} className="size-full rounded-full bg-muted object-cover shadow-[0_6px_20px_-4px_rgb(0_0_0/0.18)] ring-4 ring-card" />
                        {person.verified ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0} aria-label="Verified" className={cn('absolute end-0 bottom-0.5 grid rounded-full bg-card sm:end-1 sm:bottom-2', focusRing)}>
                                        <BadgeCheck className="size-6 fill-[var(--tone-blue-solid)] text-card sm:size-7" strokeWidth={2.2} aria-hidden />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>Verified designer</TooltipContent>
                            </Tooltip>
                        ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="flex items-center gap-2 text-[24px] leading-tight font-semibold tracking-[-0.02em]">
                            {person.name}
                            {person.online ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span tabIndex={0} aria-label="Online now" className={cn('grid size-4 place-items-center rounded-full', focusRing)}>
                                            <span className="size-2 rounded-full bg-[var(--tone-green-solid)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--tone-green-solid)_18%,transparent)]" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Online now</TooltipContent>
                                </Tooltip>
                            ) : null}
                        </h1>
                        <p className="mt-1 text-[14.5px] text-muted-foreground">{person.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <MoreMenu notify={notify} />
                        <button type="button" onClick={() => setHiring(true)} className={cn(outlineButton, 'max-sm:flex-1')}>
                            Hire me
                        </button>
                        <button type="button" aria-pressed={following} onClick={follow} className={cn('group/follow max-sm:flex-1', following ? outlineButton : solidButton)}>
                            {following ? (
                                <>
                                    <Check className="size-4 group-hover/follow:hidden" aria-hidden />
                                    <X className="hidden size-4 group-hover/follow:block" aria-hidden />
                                    <span className="group-hover/follow:hidden">Following</span>
                                    <span className="hidden group-hover/follow:inline">Unfollow</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="size-4" aria-hidden />
                                    Follow
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <div className="mt-10 grid gap-5 md:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)] md:items-start md:gap-7">
                    <About />
                    <Details skill={skill} onSkill={setSkill} onMessage={() => setMessaging(true)} notify={notify} />
                </div>

                <CaseStudies skill={skill} onClearSkill={() => setSkill(null)} onMessage={() => setMessaging(true)} />
            </main>

            <HireDialog open={hiring} onOpenChange={setHiring} />
            <MessageDialog open={messaging} onOpenChange={setMessaging} />
            {toast}
        </div>
    )
}

/** The banner: a print pattern, tiled small from a 2048px source so it stays sharp, with a soft fade where the avatar sits. */
function Cover() {
    return (
        <div aria-hidden className="relative h-[140px] overflow-hidden bg-muted sm:h-[200px]">
            <div className="absolute inset-0 bg-[length:340px] bg-[position:center_38%] sm:bg-[length:420px]" style={{ backgroundImage: `url(${person.banner})` }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,rgb(0_0_0/0.12))]" />
        </div>
    )
}

/* ---------------------------------- About ----------------------------------- */

function About() {
    const [open, setOpen] = useState(false)
    const id = useId()
    const links = person.featured

    return (
        <section aria-labelledby={`${id}-exp`} className="rounded-[12px] bg-muted/60 p-6 pt-7">
            <h2 id={`${id}-exp`} className="text-[16px] font-semibold tracking-[-0.01em]">
                Experience
            </h2>
            <p className="mt-2 text-[14px] leading-[21px] text-foreground/65">{person.experience}</p>

            <div aria-hidden className="my-7 h-px bg-border/70" />

            <h3 className="text-[14px] font-semibold">About me</h3>
            <div className="mt-2 grid gap-3.5 text-[14px] leading-[21px] text-foreground/65">
                {person.about.map((p) => (
                    <p key={p}>{p}</p>
                ))}
                <p>
                    My work has been featured on{' '}
                    {links.map((name, i) => (
                        <span key={name}>
                            <a href={`#${name.toLowerCase().replace(/\s+/g, '-')}`} className={cn('rounded-sm text-foreground/80 underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-foreground', focusRing)}>
                                {name}
                            </a>
                            {i < links.length - 2 ? ', ' : i === links.length - 2 ? ', and ' : '.'}
                        </span>
                    ))}
                </p>
                <div id={`${id}-more`} className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')} inert={!open}>
                    <div className="grid gap-3.5 overflow-hidden">
                        {person.more.map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </div>
                </div>
            </div>
            <button type="button" aria-expanded={open} aria-controls={`${id}-more`} onClick={() => setOpen((o) => !o)} className={cn('-mt-1 flex cursor-pointer items-center gap-1.5 rounded-sm text-[13.5px] font-semibold hover:text-foreground/70', open ? 'mt-1' : '', focusRing)}>
                {open ? 'Read less' : 'Read more'}
                <ArrowDown className={cn('size-3.5 transition-transform duration-300', open && 'rotate-180')} aria-hidden />
            </button>
        </section>
    )
}

/* --------------------------------- Details ---------------------------------- */

function Details({ skill, onSkill, onMessage, notify }: { skill: Skill | null; onSkill: (s: Skill | null) => void; onMessage: () => void; notify: (t: string) => void }) {
    const label = 'text-[12.5px] font-medium text-muted-foreground'
    const value = cn('inline-flex items-center gap-2 rounded-sm text-[14.5px] font-semibold tracking-[-0.01em] hover:underline hover:underline-offset-4', focusRing)
    return (
        <section aria-label="Details" className="grid gap-5 rounded-[12px] bg-muted/60 p-6">
            <div>
                <h3 className={label}>Skills</h3>
                <ul className="mt-2 flex flex-wrap gap-1">
                    {SKILLS.map((s) => (
                        <li key={s}>
                            <button
                                type="button"
                                aria-pressed={skill === s}
                                title={skill === s ? 'Show all case studies' : `Show ${s} case studies`}
                                onClick={() => onSkill(skill === s ? null : s)}
                                className={cn('h-[21px] cursor-pointer rounded-full border-[1.5px] border-foreground/50 px-[7px] text-[11px] font-medium text-foreground/80 transition-colors hover:border-foreground hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background', focusRing)}>
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className={label}>Location</h3>
                <p className="mt-2 flex items-center gap-2 text-[14.5px] font-medium">
                    <AustraliaFlag />
                    {person.location}
                </p>
            </div>
            <div>
                <h3 className={label}>Website</h3>
                <a href={`https://${person.website}`} target="_blank" rel="noreferrer" className={cn(value, 'mt-2')}>
                    {person.website}
                    <ArrowUpRight className="size-4" aria-hidden />
                </a>
            </div>
            <div>
                <h3 className={label}>Email</h3>
                <a href={`mailto:${person.email}`} className={cn(value, 'mt-2 max-w-full')}>
                    <span className="truncate">{person.email}</span>
                    <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                </a>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-3">
                <AddToList notify={notify} />
                <button type="button" onClick={onMessage} className={solidButton}>
                    Message
                </button>
            </div>
        </section>
    )
}

/* ------------------------------- Case studies ------------------------------- */

function CaseStudies({ skill, onClearSkill, onMessage }: { skill: Skill | null; onClearSkill: () => void; onMessage: () => void }) {
    const [all, setAll] = useState(false)
    const [open, setOpen] = useState<CaseStudy | null>(null)
    const list = skill ? caseStudies.filter((c) => c.skills.includes(skill)) : caseStudies

    return (
        <section aria-labelledby="case-studies" className="mt-12">
            <div className="flex items-center justify-between gap-3">
                <h2 id="case-studies" className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.01em]">
                    Case studies
                    {skill ? (
                        <button type="button" onClick={onClearSkill} aria-label={`Clear ${skill} filter`} className={cn('inline-flex h-6 cursor-pointer items-center gap-1 rounded-full bg-foreground px-2.5 text-[12px] font-medium text-background hover:bg-foreground/85', focusRing)}>
                            {skill}
                            <X className="size-3" aria-hidden />
                        </button>
                    ) : null}
                </h2>
                {list.length > 2 ? (
                    <button type="button" aria-expanded={all} onClick={() => setAll((a) => !a)} className={cn('flex shrink-0 cursor-pointer items-center gap-1.5 rounded-sm text-[13.5px] font-semibold hover:text-foreground/70', focusRing)}>
                        {all ? 'View less' : 'View more'}
                        <ArrowUpRight className={cn('size-4 transition-transform', all && 'rotate-180')} aria-hidden />
                    </button>
                ) : null}
            </div>

            {list.length ? (
                <ul tabIndex={all ? undefined : 0} aria-label="Case studies" className={cn('mt-4', all ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : '-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden', 'rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
                    {list.map((c) => (
                        <li key={c.id} className={cn(all ? '' : 'w-[290px] shrink-0 snap-start')}>
                            <Card study={c} onOpen={() => setOpen(c)} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 rounded-[12px] bg-muted/60 p-6 text-[14px] text-muted-foreground">No case studies tagged {skill} yet.</p>
            )}

            <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[520px]">
                    {open ? (
                        <>
                            <div className="relative h-[220px] overflow-hidden" style={{ background: TINT[open.id] }}>
                                <div className="absolute top-7 left-7 h-[260px] w-[560px] overflow-hidden rounded-tl-[8px] shadow-[0_8px_30px_-8px_rgb(0_0_0/0.3)]">
                                    <div className="h-[240px] w-[330px] origin-top-left scale-[1.6]">
                                        <SiteArt id={open.id} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-3 p-6">
                                <p className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
                                    <span className="grid size-5 place-items-center rounded-[5px] text-white" style={{ background: TINT[open.id] }}>
                                        <BrandMark id={open.id} className="size-3" />
                                    </span>
                                    {open.brand} · {open.year} · {open.role}
                                </p>
                                <DialogTitle className="text-[20px] tracking-[-0.02em]">{open.title}</DialogTitle>
                                <DialogDescription className="text-[14px] leading-[21px]">{open.summary}</DialogDescription>
                                <ul className="flex flex-wrap gap-1.5">
                                    {open.skills.map((s) => (
                                        <li key={s} className="rounded-full border-[1.5px] border-foreground/30 px-2 py-0.5 text-[11.5px] font-medium text-foreground/75">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <a href={open.url} target="_blank" rel="noreferrer" className={outlineButton}>
                                        Visit site
                                        <ArrowUpRight className="size-4" aria-hidden />
                                    </a>
                                    <button type="button" onClick={() => (setOpen(null), onMessage())} className={solidButton}>
                                        Ask about this
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </section>
    )
}

function Card({ study, onOpen }: { study: CaseStudy; onOpen: () => void }) {
    const tint = TINT[study.id]
    return (
        <button type="button" onClick={onOpen} aria-label={`${study.brand}: ${study.title}`} className={cn('group relative block aspect-[290/246] w-full cursor-pointer overflow-hidden rounded-[12px] text-start', focusRing)} style={{ background: tint }}>
            <div className="absolute top-[11%] left-[9.5%] h-[240px] w-[330px] overflow-hidden rounded-tl-[6px] shadow-[0_6px_24px_-6px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
                <SiteArt id={study.id} />
            </div>
            {/* Progressive blur: a light blur that deepens toward the bottom, then the card's own tint. */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]">
                <div className="absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent,black_45%)]" />
                <div className="absolute inset-0 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_25%,black_80%)]" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, color-mix(in oklab, ${tint} 75%, transparent) 70%)` }} />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex h-[23%] items-center justify-between px-5 text-white">
                <span className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.01em] [text-shadow:0_1px_2px_rgb(0_0_0/0.12)]">
                    <BrandMark id={study.id} className="size-5" />
                    {study.brand}
                </span>
                <ArrowUpRight className="size-6 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} aria-hidden />
            </div>
        </button>
    )
}
