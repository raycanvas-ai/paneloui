'use client'

import * as React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'

type ChangeSource = 'mouse' | 'touch' | 'pen' | 'keyboard' | 'virtual' | 'programmatic' | 'agent'

/** What `onClick` receives after the event: how the button was pressed. */
type ButtonActionDetails = { source: ChangeSource }

type ButtonProps = Omit<BaseButton.Props, 'onClick' | 'type'> & {
    type?: 'button' | 'submit' | 'reset'
    /** Return a Promise to keep the button pending until it settles: `aria-busy`, `aria-disabled`, `data-pending`, presses ignored. */
    onClick?: (event: React.MouseEvent<HTMLElement>, details: ButtonActionDetails) => unknown
}

// ponytail: keyboard and programmatic clicks both have `detail` 0, so both report 'keyboard'; track keydown if a usage needs them apart.
function sourceOf(event: React.MouseEvent): ChangeSource {
    const pointer = (event.nativeEvent as PointerEvent).pointerType
    return pointer === 'touch' || pointer === 'pen' ? pointer : event.detail === 0 ? 'keyboard' : 'mouse'
}

// UI SDK renders links through `render` too; Base UI must be told when the element isn't a native <button>.
const isNativeButton = (render: BaseButton.Props['render']) => !React.isValidElement(render) || render.type === 'button'

function Button({ onClick, render, nativeButton = isNativeButton(render), ...props }: ButtonProps) {
    const [pending, setPending] = React.useState(false)
    return (
        <BaseButton
            data-slot="button"
            {...props}
            {...(pending && { 'aria-busy': true, 'aria-disabled': true, 'data-pending': '' })}
            render={render}
            nativeButton={nativeButton}
            onClick={(event) => {
                // Pending ignores presses (and keeps a submit button from sending its form twice) but keeps focus.
                if (pending) return event.preventDefault()
                const result = onClick?.(event, { source: sourceOf(event) })
                if (result instanceof Promise) {
                    setPending(true)
                    // `finally` leaves a rejection unhandled on purpose, so a failed action still reaches the console.
                    result.finally(() => setPending(false))
                }
            }}
        />
    )
}

export { Button, type ButtonActionDetails }
