'use client'

import { Fragment } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Box, Check, Download, Ellipsis, Link as LinkIcon, ListFilter, RefreshCw, Settings2, Share, SquareCheck, Users } from 'lucide-react'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/panelo/ui/breadcrumb'
import { Button } from '@/components/panelo/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/panelo/ui/dropdown-menu'
import { cn } from '@/components/panelo/lib/utils'

export interface BreadcrumbEntry {
    label: string
    href?: string
}

export interface HeaderStat {
    icon: LucideIcon
    value: string
    label: string
}

export interface DashboardHeaderProps {
    breadcrumbs?: BreadcrumbEntry[]
    greeting?: string
    userName?: string
    date?: string
    note?: string
    stats?: HeaderStat[]
}

const defaultBreadcrumbs: BreadcrumbEntry[] = [
    { label: 'Daily Activity', href: '#' },
    { label: 'Home' },
]

const defaultStats: HeaderStat[] = [
    { icon: Box, value: '5', label: 'active projects' },
    { icon: SquareCheck, value: '24', label: 'tasks open' },
    { icon: Users, value: '92%', label: 'team capacity' },
    { icon: Check, value: '12', label: 'shipped this week' },
]

export default function DashboardHeader({
    breadcrumbs = defaultBreadcrumbs,
    greeting = 'Good morning',
    userName = 'Jimmy',
    date = 'Sunday, February 5 2026',
    note = 'Three things need your attention today',
    stats = defaultStats,
}: DashboardHeaderProps) {
    return (
        <header className="w-full bg-background">
            <div className="flex h-13 items-center justify-between gap-4 border-b border-border/50 px-4 sm:px-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1
                            return (
                                <Fragment key={crumb.label}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={crumb.href ?? '#'}>{crumb.label}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                        <Share className="size-3.5" aria-hidden="true" />
                        Share
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" aria-label="More options">
                                <Ellipsis aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <LinkIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                                Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Download className="size-4 text-muted-foreground" aria-hidden="true" />
                                Export view
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Settings2 className="size-4 text-muted-foreground" aria-hidden="true" />
                                Customize header
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {greeting}, {userName} <span aria-hidden="true">👋</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {date} · {note}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-10 gap-2 rounded-lg px-4">
                            <ListFilter className="size-4 text-muted-foreground" aria-hidden="true" />
                            Filter
                        </Button>
                        <Button variant="outline" size="icon" className="size-10 rounded-lg" aria-label="Refresh data">
                            <RefreshCw className="size-4 text-muted-foreground" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 rounded-xl border border-border/60 bg-card text-sm shadow-xs sm:flex sm:w-fit sm:divide-x sm:divide-border/60">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 sm:px-5',
                                index % 2 === 0 && 'max-sm:border-r max-sm:border-border/60',
                                index < stats.length - 2 && 'max-sm:border-b max-sm:border-border/60',
                            )}
                        >
                            <stat.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <span className="font-semibold text-foreground">{stat.value}</span>
                            <span className="truncate text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    )
}
