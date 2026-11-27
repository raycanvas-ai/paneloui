'use client'

import { Switch as BaseSwitch } from '@base-ui/react/switch'

// UI SDK's switch is a <button> (Base UI's default is a <span>), so `:disabled` styles and `htmlFor` keep working.
function Switch({ render, nativeButton = !render, ...props }: BaseSwitch.Root.Props) {
    return <BaseSwitch.Root data-slot="switch" {...props} nativeButton={nativeButton} render={render ?? <button />} />
}

function SwitchThumb(props: BaseSwitch.Thumb.Props) {
    return <BaseSwitch.Thumb data-slot="switch-thumb" {...props} />
}

export { Switch, SwitchThumb }
