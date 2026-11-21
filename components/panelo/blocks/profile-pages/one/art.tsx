import { RiDropboxFill } from '@remixicon/react'
import type { ReactNode } from 'react'

import { Linear } from '@/components/panelo/logos/linear'
import { Vercel } from '@/components/panelo/logos/vercel'
import { cn } from '@/components/panelo/lib/utils'

import type { CaseStudy } from './data'

/* -------------------------------------------------------------------------- */
/*  Case study artwork: each card shows the client's site in miniature, drawn  */
/*  in HTML so it stays sharp at any size and needs no screenshots. Brand      */
/*  colours here are the clients' own, so they stay literal in dark mode too.  */
/* -------------------------------------------------------------------------- */

export function FramerMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
        </svg>
    )
}

export function SquareMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path fill="currentColor" fillRule="evenodd" d="M6 1h12a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5Zm.5 3.6A1.9 1.9 0 0 0 4.6 6.5v11a1.9 1.9 0 0 0 1.9 1.9h11a1.9 1.9 0 0 0 1.9-1.9v-11a1.9 1.9 0 0 0-1.9-1.9h-11Z" />
            <rect x="8.4" y="8.4" width="7.2" height="7.2" rx="1" fill="currentColor" />
        </svg>
    )
}

/** The white brand lockup on each card's footer. */
export function BrandMark({ id, className }: { id: CaseStudy['id']; className?: string }) {
    if (id === 'dropbox') return <RiDropboxFill className={className} aria-hidden />
    if (id === 'framer') return <FramerMark className={className} />
    if (id === 'square') return <SquareMark className={className} />
    if (id === 'linear') return <Linear className={cn(className, 'brightness-0 invert')} aria-hidden />
    return <Vercel className={className} aria-hidden />
}

/** Each card's backdrop, sampled from the client's own palette. */
export const TINT: Record<CaseStudy['id'], string> = {
    dropbox: 'oklch(0.8 0.055 258)',
    framer: 'oklch(0.77 0.095 312)',
    square: 'oklch(0.77 0 0)',
    linear: 'oklch(0.45 0.05 278)',
    vercel: 'oklch(0.7 0.02 250)',
}

const bar = (w: string, className = 'bg-black/10', key?: number) => <span key={key} className={cn('block h-[2px] rounded-full', className)} style={{ width: w }} />

function Nav({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('flex h-[14px] shrink-0 items-center gap-1.5 px-2', className)}>{children}</div>
}

function Dropbox() {
    return (
        <div className="flex size-full flex-col bg-white">
            <Nav className="border-b border-black/5">
                <RiDropboxFill className="size-[7px] text-[#0061FE]" aria-hidden />
                <span className="text-[5px] font-semibold text-[#1E1919]">Dropbox</span>
                <span className="ms-2 flex gap-1.5">{[14, 12, 16].map((w, i) => bar(`${w}px`, undefined, i))}</span>
                <span className="ms-auto flex gap-1.5">{[10, 12, 10].map((w, i) => bar(`${w}px`, undefined, i))}</span>
            </Nav>
            <div className="flex h-[132px]">
                <div className="flex w-[118px] shrink-0 flex-col bg-[#F7F5F2]">
                    <p className="px-2 pt-2 text-[10.5px] leading-[11px] font-semibold tracking-[-0.02em] text-[#1E1919]">Keep life organised and work moving – all in one place</p>
                    <span className="mx-2 mt-2.5 flex h-[11px] items-center rounded-[1px] bg-[#0061FE] px-1">{bar('34px', 'bg-white/80')}</span>
                    <div className="mt-auto flex flex-col gap-[3px] bg-[#EDE8E1] px-2 py-2">
                        {['90%', '84%', '92%', '60%'].map((w, i) => (
                            <span key={i}>{bar(w)}</span>
                        ))}
                    </div>
                </div>
                <div className="relative w-[112px] shrink-0 bg-[#C8461F]">
                    <div className="absolute top-[18px] left-[14px] grid w-[64px] grid-cols-3 gap-[5px] rounded-[2px] bg-white p-1.5 shadow-sm">
                        {['#B4C8F0', '#F5C26B', '#9AD0B1', '#B4C8F0', '#E9A68E', '#B4C8F0', '#C9B6EE', '#B4C8F0', '#F5C26B', '#9AD0B1', '#B4C8F0', '#E9A68E'].map((c, i) => (
                            <span key={i} className="h-[7px] rounded-[1px]" style={{ background: c }} />
                        ))}
                    </div>
                </div>
                <div className="w-[110px] shrink-0 overflow-hidden bg-[#6E4A2E]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/avatars/jaydon-aminoff.webp" alt="" className="size-full object-cover object-[50%_30%]" />
                </div>
            </div>
            <p className="pt-3 text-center text-[8px] font-medium text-[#1E1919]">Do more with your files</p>
        </div>
    )
}

function Framer() {
    return (
        <div className="flex size-full flex-col">
            <div className="flex h-[5px] shrink-0 items-center justify-center bg-black">{bar('40px', 'bg-white/30 h-px')}</div>
            <div className="flex h-[150px] flex-col" style={{ background: 'linear-gradient(120deg, #3D1DE8 0%, #5B2DF2 35%, #7E45F5 70%, #B07CF7 100%)' }}>
                <Nav>
                    <FramerMark className="size-[6px] text-white" />
                    <span className="ms-1 flex gap-2">{[10, 12, 14, 10, 9].map((w, i) => bar(`${w}px`, 'bg-white/45', i))}</span>
                </Nav>
                <p className="px-[14px] pt-[16px] text-[12px] leading-[13.5px] font-bold tracking-[-0.025em] text-white">
                    Design stunning
                    <br />
                    interactive products
                    <br />
                    <span className="text-white/55">with your team.</span>
                </p>
                <span className="ms-[14px] mt-3 flex h-[11px] w-[44px] items-center justify-center rounded-[3px] bg-white">{bar('26px', 'bg-black/25')}</span>
                <span className="ms-[14px] mt-auto mb-2 flex gap-2">{[16, 10, 22].map((w, i) => bar(`${w}px`, 'bg-white/35', i))}</span>
            </div>
            <div className="flex h-[16px] items-center gap-1.5 bg-white px-[14px]">
                <span className="h-[7px] w-[40px] rounded-[1px] border border-black/10" />
                <span className="ms-auto flex gap-[3px]">
                    {Array.from({ length: 7 }, (_, i) => (
                        <span key={i} className="size-[3px] rounded-full bg-black/20" />
                    ))}
                </span>
            </div>
        </div>
    )
}

function Square() {
    return (
        <div className="flex size-full flex-col bg-white">
            <Nav>
                <SquareMark className="size-[7px] text-black" />
                <span className="text-[5px] font-semibold">Square</span>
                <span className="ms-auto flex gap-1.5">{[14, 12, 10].map((w, i) => bar(`${w}px`, undefined, i))}</span>
            </Nav>
            <p className="ps-[56px] pt-[16px] text-[11.5px] leading-[13px] font-semibold tracking-[-0.02em] text-black">
                The future of business
                <br />
                is yours to shape.
            </p>
            <span className="ms-[56px] mt-2.5 flex gap-1.5">
                <span className="h-[9px] w-[28px] rounded-[2px] bg-[#006AFF]" />
                <span className="h-[9px] w-[30px] rounded-[2px] border border-black/15" />
            </span>
            <div className="mt-6 flex items-start gap-3 ps-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/carousel/kitchen.webp" alt="" className="h-[86px] w-[116px] rounded-[3px] object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/carousel/seafood.webp" alt="" className="mt-8 h-[60px] w-[90px] rounded-[3px] object-cover" />
            </div>
        </div>
    )
}

function LinearSite() {
    return (
        <div className="flex size-full flex-col bg-[#0E0F11]">
            <Nav>
                <Linear className="size-[7px]" aria-hidden />
                <span className="text-[5px] font-semibold text-white/90">Linear</span>
                <span className="ms-auto flex gap-1.5">{[12, 10, 14].map((w, i) => bar(`${w}px`, 'bg-white/20', i))}</span>
            </Nav>
            <p className="bg-clip-text px-[14px] pt-[14px] text-[13px] leading-[14px] font-semibold tracking-[-0.03em] text-transparent" style={{ backgroundImage: 'linear-gradient(180deg, #fff 30%, #8A8F98)' }}>
                Plan and build
                <br />
                products, quietly.
            </p>
            <div className="mt-4 ms-[14px] flex flex-1 flex-col gap-[5px] rounded-tl-[4px] border-t border-s border-white/10 bg-[#16171A] p-2">
                {['#E2A93B', '#5E6AD2', '#4CB782', '#8A8F98', '#5E6AD2', '#E2A93B'].map((c, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                        <span className="size-[5px] rounded-full border" style={{ borderColor: c }} />
                        {bar(`${[70, 54, 88, 62, 76, 48][i]}px`, 'bg-white/20')}
                        <span className="ms-auto">{bar('14px', 'bg-white/10')}</span>
                    </span>
                ))}
            </div>
        </div>
    )
}

function VercelSite() {
    return (
        <div className="relative flex size-full flex-col bg-black" style={{ backgroundImage: 'linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
            <Nav>
                <Vercel className="size-[6px] text-white" aria-hidden />
                <span className="ms-auto flex gap-1.5">{[12, 10, 14].map((w, i) => bar(`${w}px`, 'bg-white/25', i))}</span>
            </Nav>
            <Vercel className="mx-auto mt-5 size-[26px] text-white" aria-hidden />
            <p className="mt-3 text-center text-[11px] leading-[12px] font-semibold tracking-[-0.03em] text-white">Ship the web, faster.</p>
            <span className="mt-3 flex justify-center gap-1.5">
                <span className="h-[10px] w-[34px] rounded-full bg-white" />
                <span className="h-[10px] w-[34px] rounded-full border border-white/30" />
            </span>
        </div>
    )
}

export function SiteArt({ id }: { id: CaseStudy['id'] }) {
    if (id === 'dropbox') return <Dropbox />
    if (id === 'framer') return <Framer />
    if (id === 'square') return <Square />
    if (id === 'linear') return <LinearSite />
    return <VercelSite />
}
