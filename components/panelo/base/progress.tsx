'use client'

import { Progress as BaseProgress } from '@base-ui/react/progress'

// UI SDK's `value` is optional and defaults to null (indeterminate); Base UI requires it.
function Progress({ value = null, ...props }: Omit<BaseProgress.Root.Props, 'value'> & { value?: number | null }) {
    return <BaseProgress.Root data-slot="progress" value={value} {...props} />
}

function ProgressTrack(props: BaseProgress.Track.Props) {
    return <BaseProgress.Track data-slot="progress-track" {...props} />
}

function ProgressIndicator(props: BaseProgress.Indicator.Props) {
    return <BaseProgress.Indicator data-slot="progress-indicator" {...props} />
}

function ProgressLabel(props: BaseProgress.Label.Props) {
    return <BaseProgress.Label data-slot="progress-label" {...props} />
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack }
