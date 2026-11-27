'use client'

import * as React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { useRender, type ComponentRenderFn, type HTMLProps } from '@base-ui/react/use-render'

// Base UI names some state attributes differently from UI SDK (the trigger's `data-panel-open` for `data-open`). This wraps
// the caller's `render` so the element gets UI SDK's attribute too; an element `render` goes through useRender to keep its props and ref.
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

function Collapsible(props: BaseCollapsible.Root.Props) {
    return <BaseCollapsible.Root data-slot="collapsible" {...props} />
}

// The root and panel already carry `data-open` / `data-closed`; the trigger only gets them here.
function CollapsibleTrigger({ render, ...props }: BaseCollapsible.Trigger.Props) {
    return <BaseCollapsible.Trigger data-slot="collapsible-trigger" {...props} render={withState('button', render, (state) => (state.open ? { 'data-open': '' } : { 'data-closed': '' }))} />
}

function CollapsiblePanel(props: BaseCollapsible.Panel.Props) {
    return <BaseCollapsible.Panel data-slot="collapsible-panel" {...props} />
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger }
