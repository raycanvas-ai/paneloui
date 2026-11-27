'use client'

import type * as React from 'react'
import { Input as BaseInput } from '@base-ui/react/input'

type TextareaProps = Omit<React.ComponentProps<'textarea'>, 'className' | 'style' | 'value' | 'defaultValue'> &
    Pick<BaseInput.Props, 'className' | 'style' | 'onValueChange'> & {
        value?: string
        defaultValue?: string
    }

// Base UI has no textarea part. Its Input (a Field control that skips its Enter handling off <input>) renders one,
// so the textarea keeps Field wiring, `data-disabled` and `onValueChange(value, details)`.
function Textarea(props: TextareaProps) {
    // The props differ from Input's only by element type, which `render` swaps.
    return <BaseInput data-slot="textarea" {...(props as unknown as BaseInput.Props)} render={<textarea />} />
}

export { Textarea }
