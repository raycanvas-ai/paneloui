'use client'

import * as React from 'react'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { useRender, type ComponentRenderFn, type HTMLProps } from '@base-ui/react/use-render'

// UI SDK's scrollbar reports when it should show as `data-visible`, which Base UI lacks. This wraps the caller's
// `render` so the element gets that attribute; an element `render` goes through useRender to keep its props and ref.
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

/** When each scrollbar gets `data-visible`: on hover or scroll, while scrolling, whenever its axis overflows, or always. */
type ScrollAreaType = 'hover' | 'scroll' | 'auto' | 'always'

const TypeContext = React.createContext<ScrollAreaType>('hover')
// Whether a horizontal scrollbar is rendered: only then does the content size to fit its widest child, as in UI SDK.
// Base UI always sets `min-width: fit-content`, which stops truncated rows (a sidebar's long names) from truncating.
const WideContext = React.createContext<{ wide: boolean; setWide: (wide: boolean) => void }>({ wide: false, setWide: () => {} })

function ScrollArea({ type = 'hover', ...props }: BaseScrollArea.Root.Props & { type?: ScrollAreaType }) {
    const [wide, setWide] = React.useState(false)
    const value = React.useMemo(() => ({ wide, setWide }), [wide])
    return (
        <TypeContext.Provider value={type}>
            <WideContext.Provider value={value}>
                <BaseScrollArea.Root data-slot="scroll-area" {...props} />
            </WideContext.Provider>
        </TypeContext.Provider>
    )
}

function ScrollAreaViewport(props: BaseScrollArea.Viewport.Props) {
    return <BaseScrollArea.Viewport data-slot="scroll-area-viewport" {...props} />
}

function ScrollAreaContent({ style, ...props }: BaseScrollArea.Content.Props) {
    const { wide } = React.useContext(WideContext)
    return <BaseScrollArea.Content data-slot="scroll-area-content" style={wide ? style : (state) => ({ minWidth: 0, ...(typeof style === 'function' ? style(state) : style) })} {...props} />
}

// Base UI only mounts a scrollbar while its axis overflows, so `auto` is always visible once rendered; `always` keeps it mounted.
function ScrollAreaScrollbar({ render, keepMounted, ...props }: BaseScrollArea.Scrollbar.Props) {
    const type = React.useContext(TypeContext)
    const { setWide } = React.useContext(WideContext)
    const horizontal = props.orientation === 'horizontal'
    React.useEffect(() => {
        if (!horizontal) return
        setWide(true)
        return () => setWide(false)
    }, [horizontal, setWide])
    return (
        <BaseScrollArea.Scrollbar
            data-slot="scroll-area-scrollbar"
            keepMounted={keepMounted ?? type === 'always'}
            {...props}
            render={withState('div', render, (state) => {
                const visible = type === 'hover' ? state.hovering || state.scrolling : type === 'scroll' ? state.scrolling : true
                return { 'data-visible': visible ? '' : undefined }
            })}
        />
    )
}

function ScrollAreaThumb(props: BaseScrollArea.Thumb.Props) {
    return <BaseScrollArea.Thumb data-slot="scroll-area-thumb" {...props} />
}

export { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport }
