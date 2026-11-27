'use client'

import * as React from 'react'
import { PreviewCard as Base } from '@base-ui/react/preview-card'

type Side = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'
type Container = Base.Portal.Props['container']

const Ctx = React.createContext<{ present: boolean; container?: Container; delay?: number; closeDelay?: number }>({ present: false })

// Base UI's root runs controlled so the content knows when it's mounted (open, or animating out).
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
// span, rendered in place only while the card is mounted, keeps that inheritance, and its z-index lifts
// the card above the page.
function InPlace({ when, children }: { when: boolean; children: (container: HTMLElement | null | undefined) => React.ReactNode }) {
    const [host, setHost] = React.useState<HTMLElement | null>(null)
    // Inside a positioned Base UI popup (it has `data-align`), nest as Base UI does, into that popup's portal
    // (`undefined`): in place it would sit under the positioner's transform, and an `overflow-hidden` popup
    // would clip it. Inside a dialog or drawer, which have no transform at rest, it stays in place.
    const nested = !!host?.parentElement?.closest('[data-base-ui-portal] [data-align]')
    return (
        <>
            {when && <span ref={setHost} style={{ position: 'fixed', zIndex: 50 }} />}
            {children(!when ? null : nested ? undefined : host)}
        </>
    )
}

type HoverCardProps = Base.Root.Props & {
    container?: Container
    // UI SDK sets the delays on the root; Base UI reads them from the trigger.
    delay?: number
    closeDelay?: number
}

// Base UI's PreviewCard is UI SDK's HoverCard: a link whose hover or focus opens a card.
function HoverCard({ container, delay, closeDelay, open, defaultOpen, onOpenChange, onOpenChangeComplete, ...props }: HoverCardProps) {
    const state = usePresence(open, defaultOpen, onOpenChange, onOpenChangeComplete)
    return (
        <Ctx.Provider value={{ present: state.present, container, delay, closeDelay }}>
            <Base.Root
                {...props}
                open={state.open}
                onOpenChange={state.onOpenChange}
                onOpenChangeComplete={state.onOpenChangeComplete}
            />
        </Ctx.Provider>
    )
}

function HoverCardTrigger(props: Base.Trigger.Props) {
    const { delay, closeDelay } = React.useContext(Ctx)
    return (
        <Base.Trigger
            data-slot="hover-card-trigger"
            delay={delay}
            closeDelay={closeDelay}
            {...props}
        />
    )
}

type HoverCardContentProps = Base.Popup.Props &
    Pick<Base.Positioner.Props, 'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding' | 'arrowPadding' | 'anchor'> & {
        side?: Side
        container?: Container
        keepMounted?: boolean
    }

// UI SDK's defaults: below, centered, 4px off the trigger, 8px from the viewport edges.
function HoverCardContent({ side = 'bottom', align = 'center', sideOffset = 4, alignOffset, collisionPadding = 8, arrowPadding, anchor, container, keepMounted, ...props }: HoverCardContentProps) {
    const ctx = React.useContext(Ctx)
    const target = container ?? ctx.container
    return (
        <InPlace when={!target && (ctx.present || !!keepMounted)}>
            {(host) => (
                <Base.Portal
                    container={target ?? host}
                    keepMounted={keepMounted}>
                    <Base.Positioner
                        side={side === 'start' ? 'inline-start' : side === 'end' ? 'inline-end' : side}
                        align={align}
                        sideOffset={sideOffset}
                        alignOffset={alignOffset}
                        collisionPadding={collisionPadding}
                        arrowPadding={arrowPadding}
                        anchor={anchor}
                        // Fixed, so an `overflow` ancestor between the content and the page (a folding list) doesn't clip it.
                        positionMethod="fixed"
                        style={{ zIndex: 50 }}>
                        <Base.Popup
                            data-slot="hover-card-content"
                            {...props}
                        />
                    </Base.Positioner>
                </Base.Portal>
            )}
        </InPlace>
    )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
export type { HoverCardProps, HoverCardContentProps }
