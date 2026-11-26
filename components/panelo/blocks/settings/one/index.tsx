'use client'

import { useId, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import { Radio, RadioGroup } from '@ui-sdk/react/radio'
import { Switch as SwitchPrimitive, SwitchThumb } from '@ui-sdk/react/switch'
import { CheckIcon, EllipsisVerticalIcon, ImagePlusIcon } from 'lucide-react'

import { cn } from '@/components/panelo/lib/utils'
import { Button } from '@/components/panelo/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { Input } from '@/components/panelo/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/panelo/ui/select'

import { TableThumbnail, ThemeThumbnail } from './thumbnails'

/* -------------------------------------------------------------------------- */
/*  settings/one: an appearance settings page with no app shell, to drop into */
/*  any settings route. The brand colour is live: it tints the switch, the    */
/*  selected cards and Save, with text picked for contrast. Cancel returns to */
/*  the last save.                                                            */
/* -------------------------------------------------------------------------- */

export type Theme = 'system' | 'light' | 'dark'
export type Density = 'default' | 'compact'

export type AppearanceSettingsValue = {
    /** An image URL, or null for no logo. */
    logo: string | null
    /** Six-digit hex, with the #. */
    brandColor: string
    theme: Theme
    transparentSidebar: boolean
    sidebarFeature: string
    density: Density
}

export const BRAND_COLORS = ['#18181B', '#7C3AED', '#4F46E5', '#2563EB', '#38A3F1', '#0E9AB0', '#16A34A']

export const SIDEBAR_FEATURES = [
    { value: 'recent', label: 'Recent changes', dot: 'bg-emerald-500' },
    { value: 'favorites', label: 'Favorites', dot: 'bg-amber-500' },
    { value: 'drafts', label: 'Drafts', dot: 'bg-sky-500' },
    { value: 'none', label: 'Nothing', dot: 'bg-muted-foreground/40' },
]

const LOGO = 'panelo:default-logo'

export const DEFAULT_APPEARANCE: AppearanceSettingsValue = {
    logo: LOGO,
    brandColor: '#2C68F6',
    theme: 'system',
    transparentSidebar: true,
    sidebarFeature: 'recent',
    density: 'default',
}

const THEMES: { value: Theme; label: string }[] = [
    { value: 'system', label: 'System preference' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
]

const DENSITIES: { value: Density; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'compact', label: 'Compact' },
]

const HEX = /^[0-9a-f]{6}$/i

/** White or near-black, whichever reads better on the colour (WCAG relative luminance). */
function ink(hex: string) {
    const n = parseInt(hex.slice(1), 16)
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    // Equal contrast against white and black sits at luminance ~0.18.
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.18 ? '#0A0A0A' : '#FFFFFF'
}

/** The sample company mark: twelve spokes that taper toward the centre, so their inner ends never touch. */
function BurstLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" aria-hidden className={className}>
            {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d="M22.4 17 L20.6 4.6 A3.4 3.4 0 0 1 27.4 4.6 L25.6 17 A1.6 1.6 0 0 1 22.4 17 Z" fill="currentColor" transform={`rotate(${i * 30} 24 24)`} />
            ))}
        </svg>
    )
}

/**
 * The switch, sized here rather than squeezed from the stock one: a 40x24 track with a 20px thumb
 * inset 2px on every side. Pressing stretches the thumb toward its travel, the slide overshoots
 * slightly, and --dir flips the travel in RTL.
 */
function BrandSwitch({ className, ...props }: Omit<ComponentProps<typeof SwitchPrimitive>, 'children'>) {
    return (
        <SwitchPrimitive
            className={cn(
                'group/switch inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-foreground/15 p-0.5 inset-shadow-[0_1px_2px_rgb(0_0_0/0.08)] outline-none transition-colors duration-200 ease-out [&:dir(rtl)]:[--dir:-1] hover:bg-foreground/20 focus-visible:ring-3 focus-visible:ring-(--brand)/35 data-checked:bg-(--brand) data-checked:hover:bg-(--brand)/90 data-disabled:cursor-not-allowed data-disabled:opacity-50 motion-reduce:transition-none',
                className
            )}
            {...props}>
            <SwitchThumb className="block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.18),0_0_0_0.5px_rgb(0_0_0/0.06)] transition-[translate,width] duration-250 ease-[cubic-bezier(0.34,1.36,0.64,1)] group-active/switch:w-6 data-checked:translate-x-[calc(var(--dir,1)*16px)] group-active/switch:data-checked:translate-x-[calc(var(--dir,1)*12px)] motion-reduce:transition-none" />
        </SwitchPrimitive>
    )
}

function Row({ label, description, children, id }: { label: string; description: string; children: ReactNode; id?: string }) {
    return (
        <div className="grid gap-4 border-b border-border/70 py-5 first:py-7 last:border-b-0 md:grid-cols-[317px_1fr] md:gap-0">
            <div className="flex flex-col gap-0.5">
                <h3 id={id} className="text-sm leading-5 font-semibold text-foreground">
                    {label}
                </h3>
                <p className="text-[13.5px] leading-5 text-muted-foreground">{description}</p>
            </div>
            <div className="min-w-0">{children}</div>
        </div>
    )
}

/** A picture card in a radio group: brand ring and a check badge when chosen. */
function CardRadio({ value, label, children }: { value: string; label: string; children: ReactNode }) {
    return (
        <Radio value={value} aria-label={label} className="group/card flex w-[196px] cursor-pointer flex-col items-start gap-2.5 rounded-xl text-start outline-none">
            <span className="relative block h-[124px] w-full overflow-hidden rounded-xl ring-1 ring-border transition-shadow group-hover/card:ring-foreground/20 group-focus-visible/card:ring-3 group-focus-visible/card:ring-(--brand)/40 group-data-checked/card:ring-2 group-data-checked/card:ring-(--brand) group-data-checked/card:ring-offset-2 group-data-checked/card:ring-offset-background">
                {children}
                <span className="absolute start-2 bottom-2 hidden size-[18px] items-center justify-center rounded-full bg-(--brand) text-(--brand-ink) ring-2 ring-white group-data-checked/card:flex">
                    <CheckIcon className="size-3" strokeWidth={3} />
                </span>
            </span>
            <span className="text-sm leading-5 font-medium text-foreground">{label}</span>
        </Radio>
    )
}

export type AppearanceSettingsProps = {
    defaultValue?: AppearanceSettingsValue
    /** Called with the new settings when Save is pressed. */
    onSave?: (value: AppearanceSettingsValue) => void
    className?: string
}

export function AppearanceSettings({ defaultValue = DEFAULT_APPEARANCE, onSave, className }: AppearanceSettingsProps) {
    const [saved, setSaved] = useState(defaultValue)
    const [value, setValue] = useState(defaultValue)
    const [hex, setHex] = useState(defaultValue.brandColor.slice(1))
    const [justSaved, setJustSaved] = useState(false)
    const file = useRef<HTMLInputElement>(null)
    const ids = useId()
    const set = <K extends keyof AppearanceSettingsValue>(key: K, next: AppearanceSettingsValue[K]) => setValue((v) => ({ ...v, [key]: next }))
    const feature = SIDEBAR_FEATURES.find((f) => f.value === value.sidebarFeature)

    const pickColor = (color: string) => {
        set('brandColor', color)
        setHex(color.slice(1))
    }
    // A picked logo is a blob URL: free it once nothing can show it again (Cancel can still restore the saved one).
    const setLogo = (next: string | null) => {
        if (value.logo?.startsWith('blob:') && value.logo !== saved.logo) URL.revokeObjectURL(value.logo)
        set('logo', next)
    }
    const reset = (to: AppearanceSettingsValue) => {
        setValue(to)
        setHex(to.brandColor.slice(1))
    }

    return (
        <section
            aria-labelledby={`${ids}-title`}
            style={{ '--brand': value.brandColor, '--brand-ink': ink(value.brandColor) } as CSSProperties}
            className={cn('flex min-h-full w-full flex-col bg-background px-6 font-sans text-foreground sm:px-10', className)}>
            <header className="flex h-[82px] shrink-0 items-center justify-between border-b border-border/70">
                <h2 id={`${ids}-title`} className="text-[22px] leading-7 font-semibold tracking-[-0.01em]">
                    Appearance
                </h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options" className="-me-2 size-8 text-muted-foreground">
                            <EllipsisVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => reset(DEFAULT_APPEARANCE)}>Reset to defaults</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => reset(saved)}>Discard changes</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="flex flex-col">
                <Row label="Company logo" description="Update your company logo.">
                    <div className="flex items-center gap-6">
                        <div className="flex size-[78px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
                            {value.logo === LOGO ? (
                                <BurstLogo className="size-11 text-foreground" />
                            ) : value.logo ? (
                                <img src={value.logo} alt="Company logo" className="size-full object-cover" />
                            ) : (
                                <ImagePlusIcon aria-hidden className="size-6 text-muted-foreground" />
                            )}
                        </div>
                        <Button variant="outline" className="h-10 rounded-lg px-3.5 shadow-xs" onClick={() => file.current?.click()}>
                            {value.logo ? 'Replace logo' : 'Upload logo'}
                        </Button>
                        <input
                            ref={file}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(event) => {
                                const picked = event.target.files?.[0]
                                if (picked) setLogo(URL.createObjectURL(picked))
                                event.target.value = ''
                            }}
                        />
                        {value.logo && (
                            <Button variant="destructive" className="ms-auto h-10 rounded-lg px-3.5" onClick={() => setLogo(null)}>
                                Remove
                            </Button>
                        )}
                    </div>
                </Row>

                <Row label="Brand color" description="Select or customize your brand color." id={`${ids}-brand`}>
                    <div className="flex flex-col gap-4">
                        <RadioGroup aria-labelledby={`${ids}-brand`} value={BRAND_COLORS.includes(value.brandColor) ? value.brandColor : ''} onValueChange={(next) => next && pickColor(next)} className="flex flex-wrap gap-[9px]">
                            {BRAND_COLORS.map((color) => (
                                <Radio
                                    key={color}
                                    value={color}
                                    aria-label={color}
                                    style={{ backgroundColor: color }}
                                    className="size-7 cursor-pointer rounded-full inset-ring-1 inset-ring-foreground/15 outline-none ring-offset-2 ring-offset-background transition-transform hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring data-checked:ring-2 data-checked:ring-(--brand)"
                                />
                            ))}
                        </RadioGroup>
                        <div className="flex items-center gap-3">
                            <label htmlFor={`${ids}-hex`} className="text-sm text-muted-foreground">
                                Custom color:
                            </label>
                            <div className="relative w-[100px]">
                                <span aria-hidden className="pointer-events-none absolute inset-y-0 start-2.5 flex items-center text-sm text-muted-foreground">
                                    #
                                </span>
                                <Input
                                    id={`${ids}-hex`}
                                    value={hex}
                                    maxLength={6}
                                    spellCheck={false}
                                    aria-invalid={!HEX.test(hex) || undefined}
                                    onChange={(event) => {
                                        const next = event.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase()
                                        setHex(next)
                                        if (HEX.test(next)) set('brandColor', `#${next}`)
                                    }}
                                    className="h-[34px] rounded-lg ps-6 font-medium tabular-nums uppercase shadow-xs"
                                />
                            </div>
                            <span aria-hidden className="size-[38px] rounded-full bg-(--brand) ring-2 ring-(--brand) ring-offset-[3px] ring-offset-background" />
                        </div>
                    </div>
                </Row>

                <Row label="Interface theme" description="Select or customize your UI theme." id={`${ids}-theme`}>
                    <RadioGroup aria-labelledby={`${ids}-theme`} value={value.theme} onValueChange={(next) => next && set('theme', next as Theme)} className="flex flex-wrap gap-4">
                        {THEMES.map((t) => (
                            <CardRadio key={t.value} value={t.value} label={t.label}>
                                <ThemeThumbnail theme={t.value} />
                            </CardRadio>
                        ))}
                    </RadioGroup>
                </Row>

                <Row label="Transparent sidebar" description="Make the desktop sidebar transparent.">
                    <BrandSwitch aria-label="Transparent sidebar" checked={value.transparentSidebar} onCheckedChange={(checked: boolean) => set('transparentSidebar', checked)} />
                </Row>

                <Row label="Sidebar feature" description="What shows in the desktop sidebar.">
                    <Select value={value.sidebarFeature} onValueChange={(next) => next && set('sidebarFeature', String(next))}>
                        <SelectTrigger aria-label="Sidebar feature" className="h-11 w-full max-w-[310px] rounded-lg px-3.5 text-[15px] shadow-xs">
                            <SelectValue>
                                <span className="flex items-center gap-2.5">
                                    <span className={cn('size-1.5 rounded-full', feature?.dot)} />
                                    {feature?.label}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {SIDEBAR_FEATURES.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    <span className={cn('size-1.5 rounded-full', f.dot)} />
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Row>

                <Row label="Tables view" description="How are tables displayed in the app." id={`${ids}-tables`}>
                    <RadioGroup aria-labelledby={`${ids}-tables`} value={value.density} onValueChange={(next) => next && set('density', next as Density)} className="flex flex-wrap gap-4">
                        {DENSITIES.map((d) => (
                            <CardRadio key={d.value} value={d.value} label={d.label}>
                                <TableThumbnail density={d.value} />
                            </CardRadio>
                        ))}
                    </RadioGroup>
                </Row>
            </div>

            <footer className="mt-auto flex justify-end gap-3 border-t border-border/70 py-5">
                <Button variant="outline" className="h-10 rounded-lg px-3.5 shadow-xs" onClick={() => reset(saved)}>
                    Cancel
                </Button>
                <Button
                    className="h-10 rounded-lg bg-(--brand) px-3.5 text-(--brand-ink) hover:bg-(--brand)/90"
                    onClick={() => {
                        setSaved(value)
                        onSave?.(value)
                        setJustSaved(true)
                        window.setTimeout(() => setJustSaved(false), 1600)
                    }}>
                    {/* Both labels share one grid cell, so the button keeps the wider one's width and never jumps. */}
                    <span className="grid *:col-start-1 *:row-start-1">
                        <span className={cn('transition-[opacity,translate] duration-200 motion-reduce:transition-none', justSaved && '-translate-y-1 opacity-0')}>Save changes</span>
                        <span aria-hidden className={cn('flex items-center justify-center gap-1.5 transition-[opacity,translate] duration-200 motion-reduce:transition-none', !justSaved && 'translate-y-1 opacity-0')}>
                            <CheckIcon strokeWidth={2.5} />
                            Saved
                        </span>
                    </span>
                </Button>
                <span role="status" className="sr-only">
                    {justSaved ? 'Changes saved' : ''}
                </span>
            </footer>
        </section>
    )
}

export default function AppearanceSettingsPage() {
    return (
        <div className="flex min-h-svh bg-background">
            <AppearanceSettings className="mx-auto max-w-[1117px]" />
        </div>
    )
}
