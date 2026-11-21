'use client'

import { useState } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Menu } from 'lucide-react'
import { PanelToggleIcon } from '@/components/panelo/icons/panel-toggle'

import { WorkspaceMobileSidebar, WorkspaceSidebar } from './workspace-sidebar'

export default function WorkspaceSidebarDemo() {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex h-svh min-h-[640px] w-full bg-muted/40 text-foreground">
            <WorkspaceSidebar />
            <WorkspaceMobileSidebar open={open} onClose={() => setOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile top bar — the rail collapses into a drawer below `lg`. */}
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background px-4 lg:hidden">
                    <BareButton
                        onClick={() => setOpen(true)}
                        aria-label="Open navigation"
                        className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <PanelToggleIcon className="size-5" aria-hidden />
                    </BareButton>
                    <span className="text-sm font-semibold tracking-tight">BuildBetter</span>
                </header>

                <main className="grid flex-1 place-items-center p-8">
                    <div className="max-w-sm text-center">
                        <p className="text-sm font-medium text-foreground">Workspace sidebar</p>
                        <p className="mt-1 text-sm text-muted-foreground">Resize below <code className="rounded bg-muted px-1 py-0.5 text-xs">lg</code> to collapse the rail into a drawer, or open the workspace switcher to change workspaces.</p>
                    </div>
                </main>
            </div>
        </div>
    )
}
