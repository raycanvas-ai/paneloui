'use client'

import { useState } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Eye, EyeOff, LogIn, Mail, Lock, Check } from 'lucide-react'

import { Button } from '@/components/panelo/ui/button'
import { Input } from '@/components/panelo/ui/input'
import { cn } from '@/components/panelo/lib/utils'

import {
    AndroidIcon,
    AppleIcon,
    ChromeIcon,
    EdgeIcon,
    GoogleIcon,
    LinkedInIcon,
    MessengerIcon,
    MicrosoftIcon,
    OutlookIcon,
    PixelMark,
    YahooIcon,
} from './brand-icons'

/* Orbit satellites — left/top are percentages within the square orbit field. */
const SATELLITES = [
    { id: 'edge', Icon: EdgeIcon, left: 50, top: 5, size: 12.5 },
    { id: 'outlook', Icon: OutlookIcon, left: 43, top: 25, size: 11.5 },
    { id: 'android', Icon: AndroidIcon, left: 9, top: 33, size: 11.5 },
    { id: 'messenger', Icon: MessengerIcon, left: 87, top: 37, size: 12.5 },
    { id: 'chrome', Icon: ChromeIcon, left: 18, top: 70, size: 12.5 },
    { id: 'apple', Icon: AppleIcon, left: 92, top: 64, size: 11.5 },
    { id: 'yahoo', Icon: YahooIcon, left: 47, top: 80, size: 11 },
    { id: 'linkedin', Icon: LinkedInIcon, left: 64, top: 95, size: 11.5 },
] as const

/* Softly-tinted cells scattered through the decorative grid (px on a 34px grid),
 * spread around the icon — above, beside and below — not just the top band. */
const GRID_CELLS = [
    { x: 102, y: 0 },
    { x: 340, y: 0 },
    { x: 204, y: 34 },
    { x: 408, y: 34 },
    { x: 68, y: 68 },
    { x: 374, y: 102 },
    { x: 136, y: 102 },
    { x: 272, y: 68 },
]

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [remember, setRemember] = useState(false)

    return (
        <div className="flex h-svh min-h-[660px] w-full overflow-hidden bg-background text-foreground">
            {/* ───────────────────────────── Left · form ───────────────────────────── */}
            <section className="relative flex flex-1 flex-col px-6 sm:px-10">
                {/* Brand lockup */}
                <div className="absolute left-8 top-7 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary shadow-sm shadow-primary/30">
                        <PixelMark className="size-3.5" />
                    </span>
                    <span className="text-[14px] font-medium tracking-tight text-foreground/55">Pixelcode</span>
                </div>

                <div className="m-auto w-full max-w-[448px] py-12">
                    {/* Decorative grid + icon */}
                    <div className="relative mb-1 flex h-40 items-center justify-center">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-x-8 inset-y-0 [--g:var(--color-border)]"
                            style={{
                                maskImage: 'radial-gradient(circle at 50% 47%, #000 14%, transparent 66%)',
                                WebkitMaskImage: 'radial-gradient(circle at 50% 47%, #000 14%, transparent 66%)',
                            }}>
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, var(--g) 1px, transparent 1px), linear-gradient(to bottom, var(--g) 1px, transparent 1px)',
                                    backgroundSize: '34px 34px',
                                }}
                            />
                            {GRID_CELLS.map((c) => (
                                <span
                                    key={`${c.x}-${c.y}`}
                                    className="absolute size-[34px] bg-primary/10"
                                    style={{ left: c.x, top: c.y }}
                                />
                            ))}
                        </div>
                        <span className="relative flex size-[52px] items-center justify-center rounded-[14px] bg-primary shadow-lg shadow-primary/30 ring-1 ring-inset ring-primary-foreground/20">
                            <LogIn className="size-5 text-primary-foreground" aria-hidden />
                        </span>
                    </div>

                    <h1 className="text-center text-[24px] font-bold leading-tight tracking-tight">Login to your account!</h1>
                    <p className="mt-2 text-center text-[14px] leading-snug text-muted-foreground">
                        Enter your registered email address and password to login!
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="login-email" className="block text-[13px] font-medium">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/70" aria-hidden />
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="eg. pixelcot@gmail.com"
                                    className="h-[52px] rounded-xl pl-11 text-[15px] shadow-none placeholder:text-muted-foreground/70"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="login-password" className="block text-[13px] font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/70" aria-hidden />
                                <Input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    defaultValue="placeholder123"
                                    className="h-[52px] rounded-xl px-11 text-[15px] tracking-[0.2em] text-muted-foreground shadow-none"
                                />
                                <BareButton
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                                    {showPassword ? <Eye className="size-[18px]" /> : <EyeOff className="size-[18px]" />}
                                </BareButton>
                            </div>
                        </div>

                        {/* Remember / forgot */}
                        <div className="flex items-center justify-between pt-0.5">
                            <BareButton
                                role="checkbox"
                                aria-checked={remember}
                                onClick={() => setRemember((v) => !v)}
                                className="group flex items-center gap-2 text-[14px] text-muted-foreground focus-visible:outline-none">
                                <span
                                    className={cn(
                                        'flex size-[18px] items-center justify-center rounded-[5px] border transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background',
                                        remember ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background'
                                    )}>
                                    {remember && <Check className="size-3" strokeWidth={3} />}
                                </span>
                                Remember me
                            </BareButton>
                            <a href="#" className="text-[14px] font-semibold text-primary hover:text-primary/80">
                                Forgot Password ?
                            </a>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="h-[52px] w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/80">
                            Login
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 pt-1 text-[13px] text-muted-foreground">
                            <span className="h-px flex-1 bg-border" />
                            <span>Or login with</span>
                            <span className="h-px flex-1 bg-border" />
                        </div>

                        {/* Social */}
                        <div className="grid grid-cols-3 gap-3.5">
                            <SocialButton label="Login with Google">
                                <GoogleIcon className="size-[22px]" />
                            </SocialButton>
                            <SocialButton label="Login with Apple">
                                <AppleIcon className="size-[22px] text-foreground" />
                            </SocialButton>
                            <SocialButton label="Login with Microsoft">
                                <MicrosoftIcon className="size-[20px]" />
                            </SocialButton>
                        </div>
                    </form>
                </div>
            </section>

            {/* ──────────────────────────── Right · showcase ───────────────────────── */}
            <section className="relative hidden w-[46%] shrink-0 p-3.5 lg:block">
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/5 via-primary/5 to-primary/15 px-10 py-12">
                    {/* center glow */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-[52%] size-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/60 blur-[90px] dark:bg-primary/10"
                    />

                    <h2 className="relative text-center text-[27px] font-bold tracking-tight text-foreground">
                        Write Better <span className="text-primary">Everywhere</span>
                    </h2>

                    {/* Orbit */}
                    <div className="relative flex flex-1 items-center justify-center">
                        <div className="relative aspect-square w-full max-w-[440px]">
                            {/* rings */}
                            {[100, 72, 44].map((s) => (
                                <span
                                    key={s}
                                    aria-hidden
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
                                    style={{ width: `${s}%`, height: `${s}%` }}
                                />
                            ))}

                            {/* hub */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <span aria-hidden className="absolute left-1/2 top-1/2 size-[185%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/40 dark:bg-foreground/5" />
                                <span aria-hidden className="absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/55 dark:bg-foreground/5" />
                                <span className="relative flex size-[86px] items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 ring-1 ring-inset ring-primary-foreground/25">
                                    <PixelMark className="size-9" />
                                </span>
                            </div>

                            {/* satellites */}
                            {SATELLITES.map(({ id, Icon, left, top, size }) => (
                                <span
                                    key={id}
                                    className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-md shadow-foreground/10 ring-1 ring-foreground/5"
                                    style={{ left: `${left}%`, top: `${top}%`, width: `${size}%`, height: `${size}%` }}>
                                    <Icon className="size-[56%]" aria-hidden />
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="relative mx-auto max-w-[430px] text-center text-[14px] italic leading-relaxed text-foreground/80">
                        Compatible with <span className="font-semibold">Gmail, Outlook Web, LinkedIn and most web editors</span> for a smooth writing experience anywhere online.
                    </p>

                    {/* carousel dots */}
                    <div className="relative mt-7 flex items-center justify-center gap-1.5">
                        <span className="h-1.5 w-5 rounded-full bg-primary" />
                        <span className="size-1.5 rounded-full bg-primary/30" />
                        <span className="size-1.5 rounded-full bg-primary/30" />
                    </div>
                </div>
            </section>
        </div>
    )
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <BareButton
            aria-label={label}
            className="flex h-[58px] items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            {children}
        </BareButton>
    )
}
