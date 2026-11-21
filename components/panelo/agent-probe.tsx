'use client'

import { useEffect } from 'react'

// `?agent` exposes the page's ui-sdk agent bridge as `window.paneloAgent`, for the agent tests in
// `e2e/`. Loaded on demand, so previews without the flag don't ship the bridge.
export function AgentProbe() {
    useEffect(() => {
        if (!new URLSearchParams(window.location.search).has('agent')) return
        import('@/components/panelo/lib/agent').then(({ getAgent }) => Object.assign(window, { paneloAgent: getAgent() }))
    }, [])

    return null
}
