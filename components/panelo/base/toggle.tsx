'use client'

import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'

function Toggle(props: BaseToggle.Props) {
    return <BaseToggle data-slot="toggle" {...props} />
}

// UI SDK ships the group in the toggle module; Base UI keeps it in its own.
function ToggleGroup<T extends string = string>(props: BaseToggleGroup.Props<T>) {
    return <BaseToggleGroup data-slot="toggle-group" {...props} />
}

export { Toggle, ToggleGroup }
