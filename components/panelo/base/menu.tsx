'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { mergeProps } from '@base-ui/react/merge-props'

// Popups render where they're declared, like UI SDK's (it lifts them into the top layer without moving them), so they
// keep inheriting the block's CSS: [data-panelo]'s font and radius, dark mode and looks on a preview wrapper, block
// variables. Base UI must portal, so it portals into this empty fixed span in place; its z-index lifts the popup over
// the page. Inside another positioned popup it nests as Base UI does (`undefined`), so that popup's transform and
// overflow can't clip it. Same approach as the popover, dialog and tooltip adapters.
// Mounted while open or animating out, so the in-place anchor below exists only then. An always-mounted fixed
// element inside a masked ancestor (a sidebar's scroll fade) makes Chromium paint that ancestor black.
const Present = React.createContext(false)
function usePresence<D extends { isCanceled: boolean }>(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (open: boolean, details: D) => void, onOpenChangeComplete?: (open: boolean) => void) {
    const [own, setOwn] = React.useState(defaultOpen ?? false)
    const current = open ?? own
    const [present, setPresent] = React.useState(current)
    if (current && !present) setPresent(true)
    return {
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

function useInPlace() {
    const present = React.useContext(Present)
    const [host, setHost] = React.useState<HTMLElement | null>(null)
    const nested = !!host?.parentElement?.closest('[data-base-ui-portal] [data-align]')
    return { anchor: present ? <span ref={setHost} style={{ position: 'fixed', zIndex: 50 }} /> : null, container: !present ? null : nested ? undefined : host }
}
import type { HTMLProps } from '@base-ui/react/types'

// UI SDK names logical sides `start`/`end`; Base UI calls them `inline-start`/`inline-end`.
type Side = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'
const logical = (side?: Side) => (side === 'start' || side === 'end' ? (`inline-${side}` as const) : side)

type Render<S> = React.ReactElement | ((props: HTMLProps, state: S) => React.ReactElement) | undefined

// UI SDK marks a trigger `data-open` / `data-closed`; Base UI only sets `data-popup-open`. Blocks style
// `data-open:`, so add both, keeping the caller's own `render` (asChild) working.
function withOpenState<S extends { open: boolean }>(render: Render<S>, tag: 'button' | 'div') {
    return (props: HTMLProps, state: S) => {
        const next = { ...props, 'data-open': state.open ? '' : undefined, 'data-closed': state.open ? undefined : '' }
        if (typeof render === 'function') return render(next, state)
        if (render) {
            const element = render as React.ReactElement<HTMLProps>
            return React.cloneElement(element, { ...mergeProps<'div'>(next, element.props), ref: props.ref })
        }
        return React.createElement(tag, next)
    }
}

function Menu({ open, defaultOpen, onOpenChange, onOpenChangeComplete, ...props }: BaseMenu.Root.Props) {
    const state = usePresence(open, defaultOpen, onOpenChange, onOpenChangeComplete)
    return (
        <Present.Provider value={state.present}>
            <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={state.onOpenChange} onOpenChangeComplete={state.onOpenChangeComplete} {...props} />
        </Present.Provider>
    )
}

function MenuSub({ open, defaultOpen, onOpenChange, onOpenChangeComplete, ...props }: BaseMenu.SubmenuRoot.Props) {
    const state = usePresence(open, defaultOpen, onOpenChange, onOpenChangeComplete)
    return (
        <Present.Provider value={state.present}>
            <BaseMenu.SubmenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={state.onOpenChange} onOpenChangeComplete={state.onOpenChangeComplete} {...props} />
        </Present.Provider>
    )
}

function MenuTrigger({ render, ...props }: BaseMenu.Trigger.Props) {
    return (
        <BaseMenu.Trigger
            data-slot="menu-trigger"
            render={withOpenState(render, 'button')}
            {...props}
        />
    )
}

// UI SDK's sub trigger is the submenu's `trigger` part, so it shares the `menu-trigger` slot.
function MenuSubTrigger({ render, ...props }: BaseMenu.SubmenuTrigger.Props) {
    return (
        <BaseMenu.SubmenuTrigger
            data-slot="menu-trigger"
            render={withOpenState(render, 'div')}
            {...props}
        />
    )
}

type MenuContentProps = BaseMenu.Popup.Props &
    Pick<BaseMenu.Positioner.Props, 'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding' | 'arrowPadding' | 'anchor'> &
    Pick<BaseMenu.Portal.Props, 'keepMounted' | 'container'> & { side?: Side }

// UI SDK's content is one element; here it's Portal > Positioner > Popup, with className/style on the Popup.
// Defaults follow UI SDK: aligned to the start, 4px off the trigger; submenus touch theirs with the
// first item level with it.
function content(nested: boolean) {
    return function Content({ side, align = 'start', sideOffset = nested ? 0 : 4, alignOffset, collisionPadding, arrowPadding, anchor, keepMounted, container, ...props }: MenuContentProps) {
        const positioner = React.useRef<HTMLDivElement>(null)
        const inPlace = useInPlace()
        return (
            <>
            {inPlace.anchor}
            <BaseMenu.Portal
                keepMounted={keepMounted}
                container={container ?? inPlace.container}>
                <BaseMenu.Positioner
                    ref={positioner}
                    side={logical(side)}
                    align={align}
                    sideOffset={sideOffset}
                    // The popup isn't the positioner's first child: Base UI puts focus guards around it.
                    alignOffset={alignOffset ?? (nested ? () => -firstItemOffset(positioner.current?.querySelector('[role=menu]')) : 0)}
                    collisionPadding={collisionPadding}
                    arrowPadding={arrowPadding}
                    anchor={anchor}
                    style={{ zIndex: 50 }}>
                    <BaseMenu.Popup
                        data-slot="menu-content"
                        data-nested={nested ? '' : undefined}
                        {...props}
                    />
                </BaseMenu.Positioner>
            </BaseMenu.Portal>
            </>
        )
    }
}

function firstItemOffset(popup: Element | null | undefined) {
    if (!popup) return 0
    const style = getComputedStyle(popup)
    return (parseFloat(style.paddingTop) || 0) + (parseFloat(style.borderTopWidth) || 0)
}

const MenuContent = content(false)
const MenuSubContent = content(true)

type MenuItemProps = Omit<BaseMenu.Item.Props, 'onSelect' | 'closeOnClick'> & {
    closeOnSelect?: boolean
    destructive?: boolean
    // Runs on pointer or keyboard selection; `event.preventDefault()` keeps the menu open.
    onSelect?: (event: Event) => unknown
}

function MenuItem({ closeOnSelect, destructive, onSelect, onClick, ...props }: MenuItemProps) {
    return (
        <BaseMenu.Item
            data-slot="menu-item"
            data-destructive={destructive ? '' : undefined}
            closeOnClick={closeOnSelect}
            onClick={(event) => {
                onClick?.(event)
                if (!onSelect) return
                onSelect(event.nativeEvent)
                if (event.nativeEvent.defaultPrevented) event.preventBaseUIHandler()
            }}
            {...props}
        />
    )
}

// UI SDK has one indicator for both item kinds; Base UI has one per kind, so items say which.
const IndicatorKind = React.createContext<'checkbox' | 'radio'>('checkbox')

// `value` only names the item in UI SDK's menu-level `onCheckedChange`, which no block uses.
type MenuCheckboxItemProps = Omit<BaseMenu.CheckboxItem.Props, 'closeOnClick'> & { value?: string; closeOnSelect?: boolean }

function MenuCheckboxItem({ value: _value, closeOnSelect, ...props }: MenuCheckboxItemProps) {
    return (
        <BaseMenu.CheckboxItem
            data-slot="menu-checkbox-item"
            closeOnClick={closeOnSelect}
            {...props}
        />
    )
}

function MenuRadioGroup(props: BaseMenu.RadioGroup.Props) {
    return (
        <BaseMenu.RadioGroup
            data-slot="menu-radio-group"
            {...props}
        />
    )
}

function MenuRadioItem({ closeOnSelect, children, ...props }: Omit<BaseMenu.RadioItem.Props, 'closeOnClick'> & { closeOnSelect?: boolean }) {
    return (
        <BaseMenu.RadioItem
            data-slot="menu-radio-item"
            closeOnClick={closeOnSelect}
            {...props}>
            <IndicatorKind.Provider value="radio">{children}</IndicatorKind.Provider>
        </BaseMenu.RadioItem>
    )
}

function MenuItemIndicator(props: BaseMenu.CheckboxItemIndicator.Props) {
    const Indicator = React.useContext(IndicatorKind) === 'radio' ? BaseMenu.RadioItemIndicator : BaseMenu.CheckboxItemIndicator
    return (
        <Indicator
            data-slot="menu-item-indicator"
            {...props}
        />
    )
}

function MenuGroup(props: BaseMenu.Group.Props) {
    return (
        <BaseMenu.Group
            data-slot="menu-group"
            {...props}
        />
    )
}

function MenuSeparator(props: BaseMenu.Separator.Props) {
    return (
        <BaseMenu.Separator
            data-slot="menu-separator"
            {...props}
        />
    )
}

export { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuItem, MenuItemIndicator, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger }
