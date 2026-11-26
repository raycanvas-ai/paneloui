import { cn } from '@/components/panelo/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Thumbnails for the appearance settings: a tiny app window per theme and a */
/*  tiny table per density. They picture a fixed theme, so their colours are  */
/*  literal and never follow the page's own light or dark mode.               */
/* -------------------------------------------------------------------------- */

const LIGHT = { frame: 'bg-zinc-100', bar: 'bg-white', side: 'bg-white', line: 'bg-zinc-200', text: 'text-zinc-900', panel: 'bg-zinc-100' }
const DARK = { frame: 'bg-zinc-800', bar: 'bg-zinc-900', side: 'bg-zinc-900', line: 'bg-zinc-700', text: 'text-zinc-100', panel: 'bg-zinc-800' }

function Window({ tone }: { tone: typeof LIGHT }) {
    return (
        <div className={cn('absolute inset-0 flex flex-col p-2', tone.frame)}>
            <div className="flex gap-[3px] ps-0.5 pb-1.5">
                {['bg-red-400', 'bg-amber-400', 'bg-green-400'].map((c) => (
                    <span key={c} className={cn('size-[4px] rounded-full', c)} />
                ))}
            </div>
            <div className={cn('flex min-h-0 flex-1 overflow-hidden rounded-[5px]', tone.bar)}>
                <div className={cn('flex w-[26%] flex-col gap-[5px] px-2 pt-2', tone.side)}>
                    <span className="mb-1 size-[6px] rounded-full bg-zinc-400" />
                    {Array.from({ length: 6 }, (_, i) => (
                        <span key={i} className={cn('h-[3px] w-[70%] rounded-full', tone.line)} />
                    ))}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-2">
                    <div className="flex items-center justify-between">
                        <span className={cn('text-[5.5px] leading-none font-semibold', tone.text)}>Your dashboard</span>
                        <span className="flex gap-[3px]">
                            <span className={cn('h-[6px] w-4 rounded-[2px]', tone.line)} />
                            <span className={cn('h-[6px] w-3 rounded-[2px]', tone.line)} />
                        </span>
                    </div>
                    <span className={cn('h-[3px] w-[60%] rounded-full', tone.line)} />
                    <div className={cn('flex-1 rounded-[3px]', tone.panel)} />
                </div>
            </div>
        </div>
    )
}

/** An app window in light, dark, or both halves for "system". */
export function ThemeThumbnail({ theme }: { theme: 'system' | 'light' | 'dark' }) {
    if (theme !== 'system') return <Window tone={theme === 'dark' ? DARK : LIGHT} />
    return (
        <>
            <Window tone={LIGHT} />
            <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
                <Window tone={DARK} />
            </div>
        </>
    )
}

const AVATARS = ['bg-amber-300', 'bg-zinc-500', 'bg-rose-300', 'bg-sky-300', 'bg-zinc-700', 'bg-emerald-300', 'bg-violet-300', 'bg-zinc-400']

/** A customer table at default or compact row height. */
export function TableThumbnail({ density }: { density: 'default' | 'compact' }) {
    const rows = density === 'compact' ? 8 : 5
    return (
        <div className="absolute inset-0 bg-zinc-100 p-2 pb-0">
            <div className="flex h-full flex-col overflow-hidden rounded-t-[5px] bg-white px-2 pt-2">
                <div className="flex items-center justify-between pb-1.5">
                    <span className="text-[5.5px] leading-none font-semibold text-zinc-900">Customer</span>
                    <span className="flex gap-[3px]">
                        <span className="h-[6px] w-4 rounded-[2px] bg-zinc-200" />
                        <span className="h-[6px] w-3 rounded-[2px] bg-zinc-200" />
                    </span>
                </div>
                <div className={cn('flex flex-col', density === 'compact' ? 'gap-[4px]' : 'gap-[7px]')}>
                    {Array.from({ length: rows }, (_, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <span className={cn('size-[5px] shrink-0 rounded-full', AVATARS[i])} />
                            <span className="h-[3px] w-[18%] rounded-full bg-zinc-200" />
                            <span className="h-[3px] w-[14%] rounded-full bg-zinc-100" />
                            <span className="h-[3px] w-[14%] rounded-full bg-zinc-100" />
                            <span className="h-[3px] w-[10%] rounded-full bg-zinc-100" />
                            <span className="h-[3px] flex-1 rounded-full bg-zinc-100" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
