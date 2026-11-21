'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type SVGProps } from 'react'
import { Newsreader } from 'next/font/google'
import { Button as BareButton } from '@ui-sdk/react/button'
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react'

import { Input } from '@/components/panelo/ui/input'
import { cn } from '@/components/panelo/lib/utils'

import { paint } from './pointillism'

/* -------------------------------------------------------------------------- */
/*  Painted login (login-pages/three): a paper card over a blurred painting,   */
/*  a window onto the same painting on the left, and an editorial serif.       */
/*  The painting is generated (./pointillism), so there is no image to ship.   */
/* -------------------------------------------------------------------------- */

const serif = Newsreader({ subsets: ['latin'], weight: ['400'], display: 'swap' })

const BRAND = 'folia'
const TAGLINE = ['Open Knowledge for a', 'Thoughtful AI Future.']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Warm paper and its input well, derived from the theme so dark mode follows. */
const paper = {
    '--paper': 'color-mix(in oklch, color-mix(in oklch, var(--card) 96%, var(--tone-yellow-solid)) 98.5%, var(--foreground))',
    '--paper-well': 'color-mix(in oklch, var(--paper) 96.8%, var(--foreground))',
} as CSSProperties

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(--paper)'

export default function PaintedLoginPage() {
    return (
        <div style={paper} className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-background p-4 text-foreground sm:p-8">
            <Painting className="absolute inset-0 -z-10 size-full scale-110 object-cover blur-[3px]" width={960} height={600} dot={3.2} />

            <div className="grid w-full max-w-[480px] rounded-[24px] bg-(--paper) p-2.5 shadow-2xl lg:min-h-[625px] lg:max-w-[1000px] lg:grid-cols-[445px_minmax(0,1fr)]">
                <div className="relative hidden overflow-hidden rounded-[14px] lg:block">
                    <Painting fill animate className="absolute inset-0 size-full" dot={2} />
                </div>
                <LoginForm />
            </div>
        </div>
    )
}

/* -------------------------------- Painting -------------------------------- */

/**
 * The generated painting. `fill` sizes the canvas to its box (crisp at any DPR, repainted
 * on resize); otherwise it paints once at width × height and CSS stretches it, which is
 * all a blurred backdrop needs.
 */
function Painting({ className, fill, animate, dot, width, height }: { className?: string; fill?: boolean; animate?: boolean; dot: number; width?: number; height?: number }) {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = ref.current
        if (!canvas) return
        const moving = !!animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (!fill) {
            canvas.width = width ?? 960
            canvas.height = height ?? 600
            return paint(canvas, { dot })
        }
        let cancel = () => {}
        let first = true
        const observer = new ResizeObserver(([entry]) => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const w = Math.round(entry.contentRect.width * dpr)
            const h = Math.round(entry.contentRect.height * dpr)
            if (!w || !h || (w === canvas.width && h === canvas.height)) return
            cancel()
            canvas.width = w
            canvas.height = h
            // Animate the first paint only; a resize just repaints.
            cancel = paint(canvas, { dot: dot * dpr, animate: moving && first })
            first = false
        })
        observer.observe(canvas)
        return () => {
            observer.disconnect()
            cancel()
        }
    }, [fill, animate, dot, width, height])

    // A green ground shows until the first frame lands, so the card never flashes empty.
    return <canvas ref={ref} aria-hidden className={cn('bg-[#4f6b3e]', className)} />
}

/* ---------------------------------- Form ---------------------------------- */

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [tried, setTried] = useState(false)
    const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle')
    const errorId = useId()
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const emailBad = !EMAIL.test(email.trim())
    const passwordBad = !password
    const ready = !emailBad && !passwordBad
    const error = tried && !ready ? (emailBad ? 'Enter a valid email address.' : 'Enter your password.') : ''

    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (state !== 'idle') return
        setTried(true)
        if (!ready) return void (emailBad ? emailRef : passwordRef).current?.focus()
        setState('pending')
        window.setTimeout(() => setState('done'), 900)
    }

    const well =
        'h-10 rounded-[10px] border-transparent bg-(--paper-well) px-[17px] text-base shadow-none placeholder:text-muted-foreground/75 md:text-[14px] dark:bg-(--paper-well) aria-invalid:ring-0'

    return (
        <div className="flex flex-col px-5 pb-6 pt-6 sm:px-8 lg:pe-[34px] lg:ps-[58px] lg:pb-[30px] lg:pt-[42px]">
            <a href="#back" className={cn('-ms-0.5 flex w-fit items-center gap-1.5 rounded-sm text-[16px] font-medium leading-5 text-foreground/85 transition-colors hover:text-foreground', focusRing)}>
                <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
                Back
            </a>

            <p className="mt-10 text-[23px] lg:mt-[59px] font-medium leading-7 tracking-[-0.01em]">Login to</p>
            <h1 className={cn(serif.className, 'mt-[21px] text-[42px] leading-[46px] font-normal tracking-[-0.015em] text-balance lg:text-[57px] lg:leading-[58.5px]')}>
                Where Knowledge Comes Alive
            </h1>

            {state === 'done' ? (
                <div role="status" className="mt-[40px] flex items-center gap-3 rounded-[10px] bg-(--paper-well) px-[17px] py-3.5 text-[14px]">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground text-background">
                        <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
                    </span>
                    <span>
                        Signed in as <span className="font-medium">{email.trim()}</span>
                    </span>
                </div>
            ) : (
                <form noValidate onSubmit={submit} aria-describedby={error ? errorId : undefined} className="mt-[40px] flex flex-col gap-[17px]">
                    <Input
                        ref={emailRef}
                        type="email"
                        autoComplete="email"
                        aria-label="Email"
                        placeholder="Enter email"
                        value={email}
                        aria-invalid={tried && emailBad ? true : undefined}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        className={well}
                    />
                    <div className="relative">
                        <Input
                            ref={passwordRef}
                            type="password"
                            autoComplete="current-password"
                            aria-label="Password"
                            placeholder="Enter password"
                            value={password}
                            aria-invalid={tried && passwordBad ? true : undefined}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            className={cn(well, 'pe-12')}
                        />
                        {/* The form has no button at rest; one slides in once both fields have something in them. */}
                        <BareButton
                            type="submit"
                            aria-label="Log in"
                            tabIndex={ready || state === 'pending' ? 0 : -1}
                            className={cn(
                                'absolute end-1 top-1 grid size-8 cursor-pointer place-items-center rounded-[8px] bg-foreground text-background transition-[opacity,translate] duration-200 ease-out',
                                focusRing,
                                ready || state === 'pending' ? 'opacity-100' : 'pointer-events-none translate-x-1 opacity-0'
                            )}>
                            {state === 'pending' ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
                        </BareButton>
                    </div>
                    {error ? (
                        <p id={errorId} role="alert" className="-mt-[5px] ps-[18px] text-[13px] text-destructive">
                            {error}
                        </p>
                    ) : null}
                </form>
            )}

            <p className="mt-[25px] ps-[18px] text-[13px] leading-[18px] text-muted-foreground/85">
                Don&apos;t have an account?{' '}
                <a href="#signup" className={cn('ms-1 rounded-sm font-medium text-primary hover:underline', focusRing)}>
                    Sign up
                </a>
            </p>

            <div className="mt-auto flex items-center gap-3 pt-14 lg:pt-0">
                <div className="flex items-center gap-2" aria-label={BRAND}>
                    <FoliaMark className="h-[34px] w-auto" />
                    <span className="text-[46px] leading-none font-normal tracking-[-0.035em]" aria-hidden>
                        {BRAND}
                    </span>
                </div>
                <p className={cn(serif.className, 'ms-2 text-[13px] leading-[15px] text-foreground/90')}>
                    {TAGLINE[0]}
                    <br />
                    {TAGLINE[1]}
                </p>
            </div>
        </div>
    )
}

/** The demo brand mark: a leaning leaf and a seed. Rides `currentColor`. */
function FoliaMark(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 48 34" fill="currentColor" aria-hidden {...props}>
            <path d="M3 33 C3 18 10 5 24 1 C24 16 18 28 3 33 Z" />
            <circle cx="33" cy="20" r="13" />
        </svg>
    )
}
