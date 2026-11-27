'use client'

import type * as React from 'react'

// Base UI has no standalone label (only Field.Label); a native <label> covers `htmlFor` and wrapped controls.
function Label(props: React.ComponentProps<'label'>) {
    return <label data-slot="label" {...props} />
}

export { Label }
