'use client'

import * as React from 'react'
import { Drawer as Base } from '@base-ui/react/drawer'

import { cn } from '@/components/panelo/lib/utils'

type Side = 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end'
type Edge = 'top' | 'right' | 'bottom' | 'left'
type Container = Base.Portal.Props['container']

const Ctx = React.createContext<{ present: boolean; container?: Container; edge: Edge }>({ present: false, edge: 'bottom' })

// Base UI's root runs controlled so the backdrop and content know when it's mounted (open, or animating out).
function usePresence<D extends { isCanceled: boolean }>(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (open: boolean, details: D) => void, onOpenChangeComplete?: (open: boolean) => void) {
    const [own, setOwn] = React.useState(defaultOpen ?? false)
    const current = open ?? own
    const [present, setPresent] = React.useState(current)
    if (current && !present) setPresent(true)
    return {
        open: current,
        present,
        onOpenChange(next: boolean, details: D) {
            onOpenChange?.(next, details)
            if (!details.isCanceled) setOwn(next)
        },
        onOpenChangeComplete(next: boolean) {
            if (!next) setPresent(false)
            onOpenChangeComplete?.(next)
        },
    }
}

// UI SDK lifts its popups into the top layer without moving them, so they keep inheriting the page's CSS
// (theme and block variables, [data-panelo]'s font and radius). Base UI has to portal: portaling into this
// span, rendered in place only while the drawer is mounted, keeps that inheritance, and its z-index lifts
// the drawer above the page.
const layer: React.CSSProperties = { position: 'fixed', zIndex: 50 }

function InPlace({ when, children }: { when: boolean; children: (container: HTMLElement | null | undefined) => React.ReactNode }) {
    const [host, setHost] = React.useState<HTMLElement | null>(null)
    // Inside a positioned Base UI popup (it has `data-align`), nest as Base UI does, into that popup's portal
    // (`undefined`): in place it would sit under the positioner's transform, and an `overflow-hidden` popup
    // would clip it. Inside a dialog or drawer, which have no transform at rest, it stays in place.
    const nested = !!host?.parentElement?.closest('[data-base-ui-portal] [data-align]')
    return (
        <>
            {when && <span ref={setHost} style={layer} />}
            {children(!when ? null : nested ? undefined : host)}
        </>
    )
}

// asChild hands a non-button element to `render`; Base UI then adds button semantics.
const isButton = (render: unknown) => !(React.isValidElement(render) && typeof render.type === 'string' && render.type !== 'button')

// Our classes first, so the block's own classes win the merge; `className` may be a function of state.
function withBase<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
    return typeof className === 'function' ? (state: S) => cn(base, className(state)) : cn(base, className)
}

// UI SDK's drawer positions and slides itself, so the blocks give its content no position or motion; these do.
// A swipe moves it by Base UI's own inline transform, and its release speed sets the exit's length. At rest it
// has no transform, which would otherwise pin `fixed` popups inside it to the sheet.
const motion = 'transition-[translate,transform,opacity] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] motion-reduce:transition-none'
const viewport: Record<Edge, string> = {
    top: 'flex-col justify-start',
    bottom: 'flex-col justify-end',
    left: 'flex-row justify-start',
    right: 'flex-row justify-end',
}
const slide: Record<Edge, string> = {
    top: 'data-starting-style:-translate-y-full data-ending-style:-translate-y-full',
    bottom: 'data-starting-style:translate-y-full data-ending-style:translate-y-full',
    left: 'data-starting-style:-translate-x-full data-ending-style:-translate-x-full',
    right: 'data-starting-style:translate-x-full data-ending-style:translate-x-full',
}
const swipeDirection = { top: 'up', bottom: 'down', left: 'left', right: 'right' } as const

type DrawerProps = Base.Root.Props & {
    // The edge it comes from. ponytail: `start`/`end` resolve left-to-right only; read the direction if an RTL block needs it.
    side?: Side
    container?: Container
    // Agent-only (keeps agent approval prompts usable over the modal); Base UI has no equivalent.
    persistentElements?: (string | Element)[] | (() => Element[])
}

function Drawer({ side = 'bottom', container, persistentElements: _persistentElements, open, defaultOpen, onOpenChange, onOpenChangeComplete, ...props }: DrawerProps) {
    const edge: Edge = side === 'start' ? 'left' : side === 'end' ? 'right' : side
    const state = usePresence(open, defaultOpen, onOpenChange, onOpenChangeComplete)
    return (
        <Ctx.Provider value={{ present: state.present, container, edge }}>
            <Base.Root
                swipeDirection={swipeDirection[edge]}
                {...props}
                open={state.open}
                onOpenChange={state.onOpenChange}
                onOpenChangeComplete={state.onOpenChangeComplete}
            />
        </Ctx.Provider>
    )
}

function DrawerTrigger({ nativeButton, render, ...props }: Base.Trigger.Props) {
    return (
        <Base.Trigger
            data-slot="drawer-trigger"
            nativeButton={nativeButton ?? isButton(render)}
            render={render}
            {...props}
        />
    )
}

// UI SDK's backdrop fades with the drawer; Base UI keeps its backdrop in the page, hidden, while closed.
function DrawerBackdrop({ className, ...props }: Base.Backdrop.Props) {
    const { present } = React.useContext(Ctx)
    if (!present) return null
    return (
        <span style={layer}>
            <Base.Backdrop
                data-slot="drawer-backdrop"
                className={withBase(cn(motion, 'opacity-[calc(1-var(--drawer-swipe-progress))] data-starting-style:opacity-0 data-ending-style:opacity-0'), className)}
                {...props}
            />
        </span>
    )
}

type DrawerContentProps = Base.Popup.Props & { container?: Container; keepMounted?: boolean }

// UI SDK renders the content inside a full-screen viewport that lays it against its edge; so does this.
function DrawerContent({ container, keepMounted, className, ...props }: DrawerContentProps) {
    const ctx = React.useContext(Ctx)
    const target = container ?? ctx.container
    return (
        <InPlace when={!target && (ctx.present || !!keepMounted)}>
            {(host) => (
                <Base.Portal
                    container={target ?? host}
                    keepMounted={keepMounted}>
                    <Base.Viewport
                        data-slot="drawer-viewport"
                        data-side={ctx.edge}
                        className={cn('pointer-events-none fixed inset-0 z-50 flex', viewport[ctx.edge])}>
                        <Base.Popup
                            data-slot="drawer-content"
                            data-side={ctx.edge}
                            className={withBase(cn('pointer-events-auto overscroll-contain', motion, slide[ctx.edge]), className)}
                            {...props}
                        />
                    </Base.Viewport>
                </Base.Portal>
            )}
        </InPlace>
    )
}

function DrawerTitle(props: Base.Title.Props) {
    return (
        <Base.Title
            data-slot="drawer-title"
            {...props}
        />
    )
}

function DrawerDescription(props: Base.Description.Props) {
    return (
        <Base.Description
            data-slot="drawer-description"
            {...props}
        />
    )
}

function DrawerClose({ nativeButton, render, ...props }: Base.Close.Props) {
    return (
        <Base.Close
            data-slot="drawer-close"
            nativeButton={nativeButton ?? isButton(render)}
            render={render}
            {...props}
        />
    )
}

export { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger }
export type { DrawerProps, DrawerContentProps }
