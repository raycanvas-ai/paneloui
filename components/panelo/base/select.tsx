'use client'

import * as React from 'react'

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
import { Select as BaseSelect } from '@base-ui/react/select'

// UI SDK names logical sides `start`/`end`; Base UI calls them `inline-start`/`inline-end`.
type Side = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'
const logical = (side?: Side) => (side === 'start' || side === 'end' ? (`inline-${side}` as const) : side)

type Learned = { value: unknown; label: string; icon?: React.ReactNode }
type Node = React.ReactElement<{ value?: unknown; label?: unknown; children?: React.ReactNode; 'aria-hidden'?: unknown }>

// UI SDK's trigger shows the selected item's label before the list has ever opened by reading the items'
// text off the root's children; Base UI shows the raw value unless the root gets `items`. Learn them the
// same way: any component element with a `value` is an item, labelled by its `label` or its text.
function learn(node: React.ReactNode, found: Learned[] = []): Learned[] {
    if (Array.isArray(node)) node.forEach((child) => learn(child, found))
    else if (React.isValidElement(node)) {
        const { value, label, children } = (node as Node).props
        if (value === undefined || typeof node.type === 'string') learn(children, found)
        else found.push({ value, label: typeof label === 'string' ? label : textOf(children).replace(/\s+/g, ' ').trim(), icon: iconOf(children) })
    }
    return found
}

function textOf(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(textOf).join('')
    if (!React.isValidElement(node) || node.type === SelectItemIndicator || node.type === SelectItemIcon) return ''
    const { children, 'aria-hidden': hidden } = (node as Node).props
    return hidden ? '' : textOf(children)
}

function iconOf(node: React.ReactNode): React.ReactNode {
    if (Array.isArray(node)) return node.map(iconOf).find((icon) => icon != null)
    if (!React.isValidElement(node)) return undefined
    return node.type === SelectItemIcon ? (node as Node).props.children : iconOf((node as Node).props.children)
}

const ValueIcon = React.createContext<React.ReactNode>(null)

function Select<Value, Multiple extends boolean | undefined = false>({ children, items, value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, onOpenChangeComplete, ...props }: BaseSelect.Root.Props<Value, Multiple>) {
    const presence = usePresence(open, defaultOpen, onOpenChange, onOpenChangeComplete)
    const learned = learn(children)
    // Mirrors the value so SelectValueIcon can show the selected item's icon.
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
    const current = value !== undefined ? value : uncontrolled
    const icon = Array.isArray(current) ? null : learned.find((item) => Object.is(item.value, current))?.icon
    return (
        <Present.Provider value={presence.present}>
        <ValueIcon.Provider value={icon}>
            <BaseSelect.Root
                open={open}
                defaultOpen={defaultOpen}
                onOpenChange={presence.onOpenChange}
                onOpenChangeComplete={presence.onOpenChangeComplete}
                items={items ?? learned}
                value={value}
                defaultValue={defaultValue}
                onValueChange={(next, details) => {
                    onValueChange?.(next, details)
                    if (!details.isCanceled) setUncontrolled(next)
                }}
                {...props}>
                {children}
            </BaseSelect.Root>
        </ValueIcon.Provider>
        </Present.Provider>
    )
}

function SelectTrigger({ children = <SelectValue />, ...props }: BaseSelect.Trigger.Props) {
    return (
        <BaseSelect.Trigger
            data-slot="select-trigger"
            {...props}>
            {children}
        </BaseSelect.Trigger>
    )
}

function SelectValue(props: BaseSelect.Value.Props) {
    return (
        <BaseSelect.Value
            data-slot="select-value"
            {...props}
        />
    )
}

type SelectContentProps = BaseSelect.Popup.Props &
    Pick<BaseSelect.Positioner.Props, 'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding' | 'arrowPadding' | 'anchor' | 'alignItemWithTrigger'> &
    Pick<BaseSelect.Portal.Props, 'container'> & { side?: Side }

// UI SDK's content is one element; here it's Portal > Positioner > Popup, with className/style on the Popup,
// which is the listbox while there's no List. Defaults follow UI SDK: below, aligned to the start, 4px
// off, and not over the trigger unless asked.
function SelectContent({ side, align = 'start', sideOffset = 4, alignOffset, collisionPadding, arrowPadding, anchor, alignItemWithTrigger = false, container, ...props }: SelectContentProps) {
    const inPlace = useInPlace()
    return (
        <>
        {inPlace.anchor}
        <BaseSelect.Portal container={container ?? inPlace.container}>
            <BaseSelect.Positioner
                side={logical(side)}
                align={align}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                collisionPadding={collisionPadding}
                arrowPadding={arrowPadding}
                anchor={anchor}
                alignItemWithTrigger={alignItemWithTrigger}
                style={{ zIndex: 50 }}>
                <BaseSelect.Popup
                    data-slot="select-content"
                    {...props}
                />
            </BaseSelect.Positioner>
        </BaseSelect.Portal>
        </>
    )
}

function SelectItem(props: BaseSelect.Item.Props) {
    return (
        <BaseSelect.Item
            data-slot="select-item"
            {...props}
        />
    )
}

function SelectItemIndicator(props: BaseSelect.ItemIndicator.Props) {
    return (
        <BaseSelect.ItemIndicator
            data-slot="select-item-indicator"
            {...props}
        />
    )
}

// Base UI has no item icons: a plain span, which SelectValueIcon copies into the trigger.
function SelectItemIcon({ mirror, ...props }: React.ComponentProps<'span'> & { mirror?: boolean }) {
    return (
        <span
            data-slot="select-item-icon"
            data-mirror={mirror ? '' : undefined}
            aria-hidden
            {...props}
        />
    )
}

function SelectValueIcon(props: Omit<React.ComponentProps<'span'>, 'children'>) {
    const icon = React.useContext(ValueIcon)
    if (icon == null) return null
    return (
        <span
            data-slot="select-value-icon"
            aria-hidden
            {...props}>
            {icon}
        </span>
    )
}

function SelectGroup(props: BaseSelect.Group.Props) {
    return (
        <BaseSelect.Group
            data-slot="select-group"
            {...props}
        />
    )
}

function SelectGroupLabel(props: BaseSelect.GroupLabel.Props) {
    return (
        <BaseSelect.GroupLabel
            data-slot="select-group-label"
            {...props}
        />
    )
}

function SelectSeparator(props: BaseSelect.Separator.Props) {
    return (
        <BaseSelect.Separator
            data-slot="select-separator"
            {...props}
        />
    )
}

export { Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectItemIcon, SelectItemIndicator, SelectSeparator, SelectTrigger, SelectValue, SelectValueIcon }
