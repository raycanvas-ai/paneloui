'use client'

import * as React from 'react'
import { Dialog as Base } from '@base-ui/react/dialog'

type Container = Base.Portal.Props['container']

const Ctx = React.createContext<{ present: boolean; container?: Container }>({ present: false })

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
// span, rendered in place only while the dialog is mounted, keeps that inheritance, and its z-index lifts
// the dialog above the page.
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

type DialogProps = Base.Root.Props & {
    container?: Container
    // Agent-only (keeps agent approval prompts usable over the modal); Base UI has no equivalent.
    persistentElements?: (string | Element)[] | (() => Element[])
}

function Dialog({ container, persistentElements: _persistentElements, open, defaultOpen, onOpenChange, onOpenChangeComplete, ...props }: DialogProps) {
    const state = usePresence(open, defaultOpen, onOpenChange, onOpenChangeComplete)
    return (
        <Ctx.Provider value={{ present: state.present, container }}>
            <Base.Root
                {...props}
                open={state.open}
                onOpenChange={state.onOpenChange}
                onOpenChangeComplete={state.onOpenChangeComplete}
            />
        </Ctx.Provider>
    )
}

function DialogTrigger({ nativeButton, render, ...props }: Base.Trigger.Props) {
    return (
        <Base.Trigger
            data-slot="dialog-trigger"
            nativeButton={nativeButton ?? isButton(render)}
            render={render}
            {...props}
        />
    )
}

// Base UI keeps its backdrop in the page, hidden, while closed; UI SDK's is there only while the dialog is.
function DialogBackdrop(props: Base.Backdrop.Props) {
    const { present } = React.useContext(Ctx)
    if (!present) return null
    return (
        <span style={layer}>
            <Base.Backdrop
                data-slot="dialog-backdrop"
                {...props}
            />
        </span>
    )
}

type DialogContentProps = Base.Popup.Props & { container?: Container; keepMounted?: boolean }

function DialogContent({ container, keepMounted, ...props }: DialogContentProps) {
    const ctx = React.useContext(Ctx)
    const target = container ?? ctx.container
    return (
        <InPlace when={!target && (ctx.present || !!keepMounted)}>
            {(host) => (
                <Base.Portal
                    container={target ?? host}
                    keepMounted={keepMounted}>
                    <Base.Popup
                        data-slot="dialog-content"
                        {...props}
                    />
                </Base.Portal>
            )}
        </InPlace>
    )
}

function DialogTitle(props: Base.Title.Props) {
    return (
        <Base.Title
            data-slot="dialog-title"
            {...props}
        />
    )
}

function DialogDescription(props: Base.Description.Props) {
    return (
        <Base.Description
            data-slot="dialog-description"
            {...props}
        />
    )
}

function DialogClose({ nativeButton, render, ...props }: Base.Close.Props) {
    return (
        <Base.Close
            data-slot="dialog-close"
            nativeButton={nativeButton ?? isButton(render)}
            render={render}
            {...props}
        />
    )
}

export { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger }
export type { DialogProps, DialogContentProps }
