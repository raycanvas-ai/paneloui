'use client'

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { ArrowLeft, Check, Eye, EyeOff, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/panelo/ui/button'
import { Input } from '@/components/panelo/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/panelo/ui/toggle-group'
import { cn } from '@/components/panelo/lib/utils'

import { AcmeMark, GitHubIcon, GoogleIcon } from './brand-icons'

/* -------------------------------------------------------------------------- */
/*  Sign-up flow (login-pages/two): an art panel that tracks three steps —     */
/*  account, workspace, profile — beside the form for the current one.         */
/*  Swap BRAND, STEPS and the option lists; the art rides theme tokens.        */
/* -------------------------------------------------------------------------- */

const BRAND = 'Acmeflow'
const DOMAIN = 'acmeflow.app'
const STEPS = ['Sign up your account', 'Set up your workspace', 'Set up your profile'] as const
const TEAM_SIZES = ['Just me', '2–10', '11–50', '51+']
const ROLES = ['Founder', 'Engineer', 'Designer', 'Product', 'Other']
/** How long the demo "saves" each step, so the pending state is visible. */
const SAVE_MS = 650

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const field = 'h-11 rounded-lg border-transparent bg-muted px-3.5 text-[14px] shadow-none placeholder:text-muted-foreground/70 dark:bg-muted'
const primary = 'h-11 w-full rounded-lg bg-foreground text-[14px] font-semibold text-background hover:bg-foreground/90'

const slugify = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 32)

type Account = { first: string; last: string; email: string; password: string }
type Workspace = { name: string; slug: string; size: string }

export default function SignUpPage() {
    // 0–2 are the steps; 3 is the finished state.
    const [step, setStep] = useState(0)
    const [pending, setPending] = useState(false)
    const [account, setAccount] = useState<Account>({ first: '', last: '', email: '', password: '' })
    const [workspace, setWorkspace] = useState<Workspace>({ name: '', slug: '', size: TEAM_SIZES[1] })
    const [role, setRole] = useState(ROLES[0])
    const heading = useRef<HTMLHeadingElement>(null)

    const go = (next: number) => {
        setStep(next)
        // Move focus to the new step's heading so keyboard and screen-reader users land on it.
        requestAnimationFrame(() => heading.current?.focus())
    }
    const save = (next: number) => {
        setPending(true)
        window.setTimeout(() => {
            setPending(false)
            go(next)
        }, SAVE_MS)
    }

    return (
        <div className="flex h-svh min-h-[680px] w-full bg-background text-foreground">
            <ArtPanel step={step} onStep={go} />

            <main className="flex flex-1 flex-col overflow-y-auto px-6 py-10 sm:px-10">
                <div className="m-auto w-full max-w-[420px]">
                    {step < 3 ? <MobileProgress step={step} /> : null}
                    {step === 0 ? (
                        <AccountStep headingRef={heading} account={account} onChange={setAccount} pending={pending} onDone={() => save(1)} />
                    ) : step === 1 ? (
                        <WorkspaceStep headingRef={heading} workspace={workspace} onChange={setWorkspace} pending={pending} onBack={() => go(0)} onDone={() => save(2)} />
                    ) : step === 2 ? (
                        <ProfileStep headingRef={heading} account={account} role={role} onRole={setRole} pending={pending} onBack={() => go(1)} onDone={() => save(3)} />
                    ) : (
                        <DoneStep
                            headingRef={heading}
                            name={account.first}
                            url={`${workspace.slug || 'workspace'}.${DOMAIN}`}
                            onRestart={() => {
                                setAccount({ first: '', last: '', email: '', password: '' })
                                setWorkspace({ name: '', slug: '', size: TEAM_SIZES[1] })
                                setRole(ROLES[0])
                                go(0)
                            }}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

/* -------------------------------- Art panel -------------------------------- */

/** A violet bloom from the top edge, fading through the tone into the ground. */
const GLOW =
    'radial-gradient(150% 105% at 50% -8%, color-mix(in oklch, var(--tone-violet-solid) 45%, var(--foreground)) 0%, var(--tone-violet-solid) 26%, color-mix(in oklch, var(--tone-violet-solid) 62%, var(--background)) 52%, color-mix(in oklch, var(--tone-violet-solid) 22%, var(--background)) 76%, var(--background) 96%)'
/** Hairline light streaks through the lower half of the bloom. */
const STREAKS = 'repeating-linear-gradient(to right, color-mix(in oklch, var(--tone-violet-solid) 45%, transparent) 0 1px, transparent 1px 8px)'
const STREAK_MASK = 'linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.55) 35%, rgb(0 0 0 / 0.55) 60%, transparent 95%)'

function ArtPanel({ step, onStep }: { step: number; onStep: (step: number) => void }) {
    return (
        // `dark` scopes the dark tokens to the panel, so the art reads the same in either theme.
        <section aria-label={`${BRAND} sign-up progress`} className="dark relative hidden w-[56%] max-w-[920px] shrink-0 p-3 lg:block">
            <div className="relative isolate flex h-full flex-col items-center justify-center overflow-hidden rounded-[20px] bg-background px-10 text-center text-foreground">
                <div aria-hidden className="absolute inset-0 -z-10" style={{ background: GLOW }} />
                <div
                    aria-hidden
                    className="absolute inset-x-0 top-[22%] bottom-0 -z-10"
                    style={{ backgroundImage: STREAKS, maskImage: STREAK_MASK, WebkitMaskImage: STREAK_MASK }}
                />

                <div className="flex items-center gap-2 text-[20px] font-medium tracking-tight">
                    <AcmeMark className="size-6" />
                    {BRAND}
                </div>
                <h2 className="mt-4 text-[34px] font-medium leading-tight tracking-[-0.02em] text-balance">Get Started with Us</h2>
                <p className="mt-2.5 max-w-[300px] text-[15px] leading-relaxed text-balance text-foreground/75">Complete these easy steps to register your account.</p>

                <ol className="mt-10 flex w-full max-w-[300px] flex-col gap-2.5">
                    {STEPS.map((label, index) => {
                        const state = index < step ? 'done' : index === step ? 'current' : 'upcoming'
                        return (
                            <li key={label}>
                                <BareButton
                                    // Finished steps can be revisited; the current one is where you are; later ones wait.
                                    disabled={state !== 'done'}
                                    aria-current={state === 'current' ? 'step' : undefined}
                                    onClick={() => onStep(index)}
                                    className={cn(
                                        'flex h-12 w-full items-center gap-3 rounded-[10px] px-4 text-start text-[14px] transition-colors duration-150',
                                        focusRing,
                                        state === 'current' && 'bg-foreground font-medium text-background',
                                        state === 'done' && 'cursor-pointer bg-foreground/12 text-foreground hover:bg-foreground/18',
                                        state === 'upcoming' && 'bg-foreground/8 text-foreground/65'
                                    )}>
                                    <span
                                        className={cn(
                                            'grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums',
                                            state === 'current' ? 'bg-background text-foreground' : 'bg-foreground/15'
                                        )}>
                                        {state === 'done' ? <Check className="size-3" strokeWidth={3} aria-hidden /> : index + 1}
                                    </span>
                                    {label}
                                    <span className="sr-only">{state === 'done' ? ', done' : state === 'upcoming' ? ', not started' : ''}</span>
                                </BareButton>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </section>
    )
}

/** Below lg the art panel is gone, so the steps collapse into a bar above the form. */
function MobileProgress({ step }: { step: number }) {
    return (
        <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-[13px] font-medium">
                <AcmeMark className="size-5" />
                {BRAND}
                <span className="ms-auto text-muted-foreground tabular-nums">
                    Step {step + 1} of {STEPS.length}
                </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden>
                {STEPS.map((label, index) => (
                    <span key={label} className={cn('h-1 rounded-full transition-colors', index <= step ? 'bg-foreground' : 'bg-muted')} />
                ))}
            </div>
        </div>
    )
}

/* ---------------------------------- Steps ---------------------------------- */

type StepProps = { headingRef: React.Ref<HTMLHeadingElement>; pending: boolean; onDone: () => void }

function StepHeader({ headingRef, title, body, center }: { headingRef: React.Ref<HTMLHeadingElement>; title: string; body: string; center?: boolean }) {
    return (
        <header className={cn('mb-8', center && 'text-center')}>
            <h1 ref={headingRef} tabIndex={-1} className="text-[24px] font-medium tracking-[-0.01em] outline-none">
                {title}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">{body}</p>
        </header>
    )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** After the errors render, put focus on the first field that has one. */
const focusFirstInvalid = (form: HTMLFormElement) => requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())

function AccountStep({ headingRef, account, onChange, pending, onDone }: StepProps & { account: Account; onChange: (next: Account) => void }) {
    const [showPassword, setShowPassword] = useState(false)
    // Errors appear after the first submit, then clear as each field is fixed.
    const [tried, setTried] = useState(false)
    const errors = {
        first: account.first.trim() ? '' : 'Enter your first name.',
        email: EMAIL.test(account.email.trim()) ? '' : 'Enter a valid email address.',
        password: account.password.length >= 8 ? '' : 'Must be at least 8 characters.',
    }
    const set = (key: keyof Account) => (value: string) => onChange({ ...account, [key]: value })

    const submit = (event: FormEvent) => {
        event.preventDefault()
        setTried(true)
        if (!errors.first && !errors.email && !errors.password) onDone()
        else focusFirstInvalid(event.currentTarget as HTMLFormElement)
    }

    return (
        <>
            <StepHeader headingRef={headingRef} title="Sign Up Account" body="Enter your personal data to create your account." center />

            <div className="grid grid-cols-2 gap-3">
                <SocialButton icon={<GoogleIcon className="size-4" />}>Google</SocialButton>
                <SocialButton icon={<GitHubIcon className="size-4" />}>GitHub</SocialButton>
            </div>
            <div className="my-6 flex items-center gap-3 text-[13px] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                Or
                <span className="h-px flex-1 bg-border" />
            </div>

            <form noValidate onSubmit={submit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-3">
                    <Field label="First Name" error={tried ? errors.first : ''}>
                        {(props) => <Input {...props} autoComplete="given-name" placeholder="eg. John" value={account.first} onChange={(e) => set('first')(e.currentTarget.value)} className={field} />}
                    </Field>
                    <Field label="Last Name">
                        {(props) => <Input {...props} autoComplete="family-name" placeholder="eg. Francisco" value={account.last} onChange={(e) => set('last')(e.currentTarget.value)} className={field} />}
                    </Field>
                </div>
                <Field label="Email" error={tried ? errors.email : ''}>
                    {(props) => <Input {...props} type="email" autoComplete="email" placeholder="eg. johnfrans@gmail.com" value={account.email} onChange={(e) => set('email')(e.currentTarget.value)} className={field} />}
                </Field>
                <Field label="Password" hint="Must be at least 8 characters." error={tried ? errors.password : ''}>
                    {(props) => (
                        <div className="relative">
                            <Input
                                {...props}
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Enter your password"
                                value={account.password}
                                onChange={(e) => set('password')(e.currentTarget.value)}
                                className={cn(field, 'pe-11')}
                            />
                            <BareButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword((v) => !v)}
                                className={cn('absolute end-1.5 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground', focusRing)}>
                                {showPassword ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                            </BareButton>
                        </div>
                    )}
                </Field>

                <Button type="submit" disabled={pending} className={cn(primary, 'mt-1')}>
                    {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                    {pending ? 'Creating account…' : 'Sign Up'}
                </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted-foreground">
                Already have an account?{' '}
                <a href="#login" className={cn('rounded-sm font-semibold text-foreground hover:underline', focusRing)}>
                    Log in
                </a>
            </p>
        </>
    )
}

function WorkspaceStep({ headingRef, workspace, onChange, pending, onBack, onDone }: StepProps & { workspace: Workspace; onChange: (next: Workspace) => void; onBack: () => void }) {
    const [tried, setTried] = useState(false)
    // The URL follows the name until someone edits it by hand.
    const [slugTouched, setSlugTouched] = useState(false)
    const errors = {
        name: workspace.name.trim() ? '' : 'Name your workspace.',
        slug: workspace.slug.length >= 3 ? '' : 'Use at least 3 letters or numbers.',
    }

    const submit = (event: FormEvent) => {
        event.preventDefault()
        setTried(true)
        if (!errors.name && !errors.slug) onDone()
        else focusFirstInvalid(event.currentTarget as HTMLFormElement)
    }

    return (
        <>
            <StepHeader headingRef={headingRef} title="Set up your workspace" body="Name it after your team or company. You can change it later." />
            <form noValidate onSubmit={submit} className="flex flex-col gap-5">
                <Field label="Workspace name" error={tried ? errors.name : ''}>
                    {(props) => (
                        <Input
                            {...props}
                            autoComplete="organization"
                            placeholder="eg. Northwind"
                            value={workspace.name}
                            onChange={(e) => {
                                const name = e.currentTarget.value
                                onChange({ ...workspace, name, slug: slugTouched ? workspace.slug : slugify(name) })
                            }}
                            className={field}
                        />
                    )}
                </Field>
                <Field label="Workspace URL" error={tried ? errors.slug : ''}>
                    {(props) => (
                        <div dir="ltr" className="flex h-11 overflow-hidden rounded-lg bg-muted focus-within:ring-3 focus-within:ring-ring/50">
                            <Input
                                {...props}
                                placeholder="northwind"
                                value={workspace.slug}
                                onChange={(e) => {
                                    setSlugTouched(true)
                                    onChange({ ...workspace, slug: slugify(e.currentTarget.value) })
                                }}
                                className={cn(field, 'min-w-0 flex-1 rounded-none pe-1 focus-visible:ring-0')}
                            />
                            <span className="flex items-center pe-3.5 text-[14px] text-muted-foreground">.{DOMAIN}</span>
                        </div>
                    )}
                </Field>
                <Choice label="Team size" options={TEAM_SIZES} value={workspace.size} onChange={(size) => onChange({ ...workspace, size })} columns="grid-cols-4" />

                <StepActions pending={pending} onBack={onBack} label="Continue" pendingLabel="Saving…" />
            </form>
        </>
    )
}

function ProfileStep({ headingRef, account, role, onRole, pending, onBack, onDone }: StepProps & { account: Account; role: string; onRole: (role: string) => void; onBack: () => void }) {
    const name = [account.first, account.last].filter(Boolean).join(' ') || 'Your name'
    const initials = ((account.first[0] ?? '') + (account.last[0] ?? '')).toUpperCase() || 'YN'

    return (
        <>
            <StepHeader headingRef={headingRef} title="Set up your profile" body="This is how teammates will see you around the workspace." />
            <form
                noValidate
                onSubmit={(event) => {
                    event.preventDefault()
                    onDone()
                }}
                className="flex flex-col gap-6">
                <div className="flex items-center gap-3.5 rounded-xl bg-muted p-3.5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-foreground text-[15px] font-semibold text-background">{initials}</span>
                    <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium">{name}</p>
                        <p className="truncate text-[13px] text-muted-foreground">{account.email || 'you@company.com'}</p>
                    </div>
                    <span className="ms-auto shrink-0 rounded-full bg-background px-2.5 py-1 text-[12px] font-medium">{role}</span>
                </div>
                <Choice label="What do you do?" options={ROLES} value={role} onChange={onRole} columns="grid-cols-3 sm:grid-cols-5" />
                <StepActions pending={pending} onBack={onBack} label="Finish" pendingLabel="Finishing…" />
            </form>
        </>
    )
}

function DoneStep({ headingRef, name, url, onRestart }: { headingRef: React.Ref<HTMLHeadingElement>; name: string; url: string; onRestart: () => void }) {
    return (
        <div className="text-center">
            <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-foreground text-background">
                <Check className="size-6" strokeWidth={2.5} aria-hidden />
            </span>
            <StepHeader headingRef={headingRef} title={`Welcome to ${BRAND}${name ? `, ${name}` : ''}`} body="Your account, workspace and profile are ready." center />
            <p dir="ltr" className="-mt-4 mb-8 text-[14px] font-medium">
                {url}
            </p>
            <Button className={primary}>Go to your workspace</Button>
            <Button variant="ghost" onClick={onRestart} className="mt-2 h-10 w-full rounded-lg text-[13px] text-muted-foreground">
                Start over
            </Button>
        </div>
    )
}

/* --------------------------------- Pieces ---------------------------------- */

type ControlProps = { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }

/** Label, control, then the hint — which turns into the error once there is one. */
function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (props: ControlProps) => ReactNode }) {
    const id = useId()
    const note = error || hint
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[13px] font-medium">
                {label}
            </label>
            {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': note ? `${id}-note` : undefined })}
            {note ? (
                <p id={`${id}-note`} className={cn('text-[12.5px]', error ? 'text-destructive' : 'text-muted-foreground')}>
                    {note}
                </p>
            ) : null}
        </div>
    )
}

function Choice({ label, options, value, onChange, columns }: { label: string; options: string[]; value: string; onChange: (value: string) => void; columns: string }) {
    const id = useId()
    return (
        <div className="flex flex-col gap-2">
            <span id={id} className="text-[13px] font-medium">
                {label}
            </span>
            <ToggleGroup aria-labelledby={id} type="single" value={value} onValueChange={(next: string) => next && onChange(next)} className={cn('grid w-full gap-2', columns)}>
                {options.map((option) => (
                    <ToggleGroupItem
                        key={option}
                        value={option}
                        className="h-10 cursor-pointer rounded-lg bg-muted px-2 text-[13px] font-normal text-muted-foreground first:rounded-lg last:rounded-lg hover:bg-muted hover:text-foreground data-pressed:bg-foreground data-pressed:font-medium data-pressed:text-background">
                        {option}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}

function StepActions({ pending, onBack, label, pendingLabel }: { pending: boolean; onBack: () => void; label: string; pendingLabel: string }) {
    return (
        <div className="mt-2 flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} disabled={pending} className="h-11 rounded-lg px-4 text-[14px]">
                <ArrowLeft aria-hidden />
                Back
            </Button>
            <Button type="submit" disabled={pending} className={cn(primary, 'flex-1')}>
                {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                {pending ? pendingLabel : label}
            </Button>
        </div>
    )
}

function SocialButton({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <BareButton className={cn('flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border text-[14px] font-medium transition-colors hover:bg-muted', focusRing)}>
            {icon}
            {children}
        </BareButton>
    )
}
