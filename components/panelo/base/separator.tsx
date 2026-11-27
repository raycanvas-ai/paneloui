'use client'

import { Separator as BaseSeparator } from '@base-ui/react/separator'

// UI SDK's `decorative` hides a purely visual line from assistive technology with `role="none"`; Base UI always says separator.
function Separator({ decorative, ...props }: BaseSeparator.Props & { decorative?: boolean }) {
    return <BaseSeparator data-slot="separator" {...(decorative ? { role: 'none', 'aria-orientation': undefined } : {})} {...props} />
}

export { Separator }
