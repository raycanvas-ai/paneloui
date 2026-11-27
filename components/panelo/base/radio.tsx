'use client'

import { Radio as BaseRadio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'

function RadioGroup<T extends string = string>(props: BaseRadioGroup.Props<T>) {
    return <BaseRadioGroup data-slot="radio-group" {...props} />
}

// UI SDK's radio is a <button> with no indicator of its own (Base UI's default is a <span>); blocks style it by `data-checked`.
function Radio({ render, nativeButton = !render, ...props }: BaseRadio.Root.Props<string>) {
    return <BaseRadio.Root data-slot="radio" {...props} nativeButton={nativeButton} render={render ?? <button />} />
}

export { Radio, RadioGroup }
