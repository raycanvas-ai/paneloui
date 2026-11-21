import { Clock, Phone, Plus, Settings, Sparkle } from 'lucide-react'

import { Button } from '@/components/panelo/ui/button'
import { Skeleton } from '@/components/panelo/ui/skeleton'
import { cn } from '@/components/panelo/lib/utils'

import { agents, type Agent } from './data'

function AgentCard({ agent, className }: { agent: Agent; className?: string }) {
    return (
        <div className={cn('flex w-80 max-w-full shrink-0 flex-col rounded-2xl border bg-card', className)}>
            <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-sky-500 to-blue-600">
                        <Sparkle className="size-4 fill-white text-white" aria-hidden />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                        <span className="text-sm text-muted-foreground">{agent.role}</span>
                    </div>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border/50 px-5 py-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    <span className="text-xs">Last active {agent.lastActive}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="size-7 rounded-lg" aria-label={`Call ${agent.name}`}>
                        <Phone className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="size-7 rounded-lg" aria-label={`Configure ${agent.name}`}>
                        <Settings className="size-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AgentCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex w-80 shrink-0 flex-col rounded-2xl border border-border/50 bg-card', className)}>
            <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-16 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-4/5 rounded" />
                </div>
            </div>
            <div className="flex items-center border-t border-border/50 px-5 py-3">
                <Skeleton className="h-3 w-32 rounded" />
            </div>
        </div>
    )
}

export default function AiWorkforceSection() {
    const [sarah, alex] = agents

    return (
        <section className="flex min-h-svh w-full flex-col items-center justify-center gap-8 bg-background px-6 py-12 sm:gap-10 sm:py-20">
            {/* Side cards fade into the page instead of being cut at a hard edge. */}
            <div className="w-full max-w-5xl overflow-hidden sm:[mask-image:linear-gradient(to_right,transparent,black_22%,black_78%,transparent)]">
                <div className="flex items-stretch justify-center gap-6">
                    <div inert aria-hidden className="hidden opacity-40 blur-[1px] sm:block">
                        <AgentCard agent={sarah} className="h-full border-border/50" />
                    </div>
                    <AgentCard agent={alex} className="shadow-lg shadow-black/5" />
                    <div inert aria-hidden className="hidden opacity-60 sm:block">
                        <AgentCardSkeleton className="h-full" />
                    </div>
                </div>
            </div>
            <div className="flex max-w-md flex-col items-center gap-6 text-center">
                <div className="flex flex-col gap-2.5">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">Build your AI Workforce</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Deploy specialized agents that work around the clock — from recruiting to compliance, each one built for a specific role.
                    </p>
                </div>
                <Button className="rounded-lg">
                    <Plus aria-hidden />
                    Add Agent
                </Button>
            </div>
        </section>
    )
}
