'use client'

import { Input as BaseInput } from '@base-ui/react/input'

function Input(props: BaseInput.Props) {
    return <BaseInput data-slot="input" {...props} />
}

export { Input }
