'use client'

import * as React from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { useRender, type ComponentRenderFn, type HTMLProps } from '@base-ui/react/use-render'

// Base UI names some state attributes differently from UI SDK (`data-active` for `data-selected`). This wraps the
// caller's `render` so the element gets UI SDK's attribute too; an element `render` goes through useRender to keep its props and ref.
function withState<S>(tag: 'button' | 'div', render: React.ReactElement | ComponentRenderFn<HTMLProps, S> | undefined, attrs: (state: S) => Record<string, string | undefined>): ComponentRenderFn<HTMLProps, S> {
    return (props, state) => {
        const next = { ...props, ...attrs(state) }
        if (typeof render === 'function') return render(next, state)
        if (render) return <RenderElement render={render} props={next} />
        return React.createElement(tag, next)
    }
}

function RenderElement({ render, props }: { render: React.ReactElement; props: HTMLProps }) {
    return useRender({ render, props: { ...props } })
}

const selected = (on: boolean) => ({ 'data-selected': on ? '' : undefined })

// UI SDK's `onValueChange` never runs on mount; Base UI reports its automatic first selection with reason `initial`.
function Tabs({ onValueChange, ...props }: BaseTabs.Root.Props) {
    return (
        <BaseTabs.Root
            data-slot="tabs"
            {...props}
            onValueChange={onValueChange && ((value, details) => details.reason !== 'initial' && onValueChange(value, details))}
        />
    )
}

// UI SDK selects a tab when arrow keys focus it (`activation="automatic"`); Base UI only moves focus unless `activateOnFocus`.
function TabsList({ activateOnFocus = true, ...props }: BaseTabs.List.Props) {
    return <BaseTabs.List data-slot="tabs-list" activateOnFocus={activateOnFocus} {...props} />
}

function TabsTab({ render, ...props }: BaseTabs.Tab.Props) {
    return <BaseTabs.Tab data-slot="tabs-tab" {...props} render={withState('button', render, (state) => selected(state.active))} />
}

function TabsIndicator(props: BaseTabs.Indicator.Props) {
    return <BaseTabs.Indicator data-slot="tabs-indicator" {...props} />
}

// UI SDK marks the shown panel `data-selected`, dropped while it animates out.
function TabsPanel({ render, ...props }: BaseTabs.Panel.Props) {
    return <BaseTabs.Panel data-slot="tabs-panel" {...props} render={withState('div', render, (state) => selected(!state.hidden && state.transitionStatus !== 'ending'))} />
}

export { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab }
