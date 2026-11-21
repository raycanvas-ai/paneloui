'use client'

import { useState, type ReactNode } from 'react'
import { Bold, ChevronsUpDown, Italic, Settings, Underline } from 'lucide-react'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { AspectRatio } from '@/components/panelo/ui/aspect-ratio'
import { Badge } from '@/components/panelo/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/panelo/ui/chart'
import { Progress } from '@/components/panelo/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/panelo/ui/radio-group'
import { AnimatedGroup } from '@/components/panelo/motion/animated-group'
import { InfiniteSlider } from '@/components/panelo/motion/infinite-slider'
import { ProgressiveBlur } from '@/components/panelo/motion/progressive-blur'
import { TextEffect } from '@/components/panelo/motion/text-effect'
import { BorderBeam } from '@/components/panelo/magicui/border-beam'
import { Beacon } from '@/components/panelo/logos/beacon'
import { Bolt } from '@/components/panelo/logos/bolt'
import { Bun } from '@/components/panelo/logos/bun'
import { Claude } from '@/components/panelo/logos/claude'
import { NPM } from '@/components/panelo/logos/npm'
import { Pnpm } from '@/components/panelo/logos/pnpm'
import { Spotify } from '@/components/panelo/logos/spotify'
import { Vercel } from '@/components/panelo/logos/vercel'
import { Yarn } from '@/components/panelo/logos/yarn'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/panelo/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/panelo/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/panelo/ui/breadcrumb'
import { Button, buttonVariants } from '@/components/panelo/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/panelo/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/panelo/ui/collapsible'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/panelo/ui/dialog'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/panelo/ui/dropdown-menu'
import { Input } from '@/components/panelo/ui/input'
import { Label } from '@/components/panelo/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/panelo/ui/popover'
import { ScrollArea } from '@/components/panelo/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/panelo/ui/select'
import { Separator } from '@/components/panelo/ui/separator'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/panelo/ui/sheet'
import { Skeleton } from '@/components/panelo/ui/skeleton'
import { Switch } from '@/components/panelo/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/panelo/ui/tabs'
import { Textarea } from '@/components/panelo/ui/textarea'
import { Toggle } from '@/components/panelo/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/panelo/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/panelo/ui/tooltip'

const outline = buttonVariants({ variant: 'outline' })

function CheckboxMenu() {
    const [status, setStatus] = useState(true)
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={outline}>Open menu</DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={status}
                    onCheckedChange={setStatus}>
                    Status bar
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// One live example per Base component, keyed by its catalog slug.
export const BASE_DEMOS: Record<string, () => ReactNode> = {
    accordion: () => (
        <Accordion
            type="single"
            collapsible
            defaultValue="agents"
            className="w-full max-w-md">
            <AccordionItem value="agents">
                <AccordionTrigger>Can agents use these components?</AccordionTrigger>
                <AccordionContent>Yes. Every part is a UI SDK part, so an agent can read its state and act on it.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="style">
                <AccordionTrigger>Can I restyle them?</AccordionTrigger>
                <AccordionContent>They read the theme tokens, so changing theme.css restyles everything.</AccordionContent>
            </AccordionItem>
        </Accordion>
    ),
    avatar: () => (
        <div className="flex items-center gap-3">
            <Avatar className="size-10">
                <AvatarImage
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Jane Cooper"
                />
                <AvatarFallback>JC</AvatarFallback>
            </Avatar>
            <Avatar className="size-10">
                <AvatarFallback>AL</AvatarFallback>
            </Avatar>
        </div>
    ),
    breadcrumb: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Launch plan</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
    button: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Button>Create ticket</Button>
            <Button variant="outline">Filters</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Learn more</Button>
        </div>
    ),
    card: () => (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Total revenue</CardTitle>
                <CardDescription>From last month</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tabular-nums">$152,313</CardContent>
            <CardFooter className="text-sm text-muted-foreground">+16% vs. last month</CardFooter>
        </Card>
    ),
    collapsible: () => (
        <Collapsible className="w-full max-w-sm space-y-2">
            <CollapsibleTrigger className={buttonVariants({ variant: 'outline', className: 'w-full justify-between' })}>
                3 starred repositories
                <ChevronsUpDown aria-hidden />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
                {['ui-sdk', 'panelo', 'next.js'].map((repo) => (
                    <div
                        key={repo}
                        className="rounded-md border px-4 py-2 font-mono text-sm">
                        {repo}
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    ),
    dialog: () => (
        <Dialog>
            <DialogTrigger className={outline}>Edit profile</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>Changes save when you press Save.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-1.5">
                    <Label htmlFor="demo-name">Name</Label>
                    <Input
                        id="demo-name"
                        defaultValue="Jane Cooper"
                    />
                </div>
                <DialogFooter>
                    <DialogClose className={outline}>Cancel</DialogClose>
                    <DialogClose className={buttonVariants()}>Save</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
    'dropdown-menu': () => <CheckboxMenu />,
    input: () => (
        <Input
            aria-label="Email"
            type="email"
            placeholder="you@company.com"
            className="max-w-sm"
        />
    ),
    label: () => (
        <div className="grid w-full max-w-sm gap-1.5">
            <Label htmlFor="demo-email">Work email</Label>
            <Input
                id="demo-email"
                placeholder="you@company.com"
            />
        </div>
    ),
    popover: () => (
        <Popover>
            <PopoverTrigger className={outline}>Dimensions</PopoverTrigger>
            <PopoverContent className="grid gap-2">
                <Label htmlFor="demo-width">Width</Label>
                <Input
                    id="demo-width"
                    defaultValue="100%"
                />
            </PopoverContent>
        </Popover>
    ),
    'scroll-area': () => (
        <ScrollArea className="h-48 w-56 rounded-md border">
            <div className="p-4">
                {Array.from({ length: 30 }, (_, i) => (
                    <div
                        key={i}
                        className="border-b py-2 text-sm last:border-0">
                        v1.{30 - i}.0
                    </div>
                ))}
            </div>
        </ScrollArea>
    ),
    select: () => (
        <Select defaultValue="weekly">
            <SelectTrigger
                aria-label="Report period"
                className="w-44">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
        </Select>
    ),
    separator: () => (
        <div className="w-full max-w-sm">
            <p className="text-sm font-medium">Panelo UI</p>
            <p className="text-sm text-muted-foreground">Agent-ready dashboard blocks.</p>
            <Separator className="my-3" />
            <div className="flex h-5 items-center gap-3 text-sm">
                Blocks
                <Separator orientation="vertical" />
                Templates
                <Separator orientation="vertical" />
                Charts
            </div>
        </div>
    ),
    sheet: () => (
        <Sheet>
            <SheetTrigger className={outline}>Open sheet</SheetTrigger>
            <SheetContent className="w-80 border-l">
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>Swipe or press Escape to close.</SheetDescription>
                </SheetHeader>
                <div className="px-4">
                    <SheetClose className={outline}>Done</SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    ),
    skeleton: () => (
        <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    ),
    switch: () => (
        <label className="flex items-center gap-3 text-sm">
            <Switch defaultChecked />
            Email notifications
        </label>
    ),
    tabs: () => (
        <Tabs
            defaultValue="overview"
            className="w-full max-w-md">
            <TabsList aria-label="Project views">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent
                value="overview"
                className="text-sm text-muted-foreground">
                Six workflows running, two paused.
            </TabsContent>
            <TabsContent
                value="activity"
                className="text-sm text-muted-foreground">
                Churn Alert ran 2 minutes ago.
            </TabsContent>
            <TabsContent
                value="settings"
                className="text-sm text-muted-foreground">
                Notifications are on.
            </TabsContent>
        </Tabs>
    ),
    textarea: () => (
        <Textarea
            aria-label="Message"
            placeholder="Tell the assistant what to change…"
            className="max-w-sm"
        />
    ),
    toggle: () => (
        <Toggle
            aria-label="Bold"
            variant="outline">
            <Bold />
        </Toggle>
    ),
    'toggle-group': () => (
        <ToggleGroup
            type="multiple"
            variant="outline"
            aria-label="Text style"
            defaultValue={['bold']}>
            <ToggleGroupItem
                value="bold"
                aria-label="Bold">
                <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem
                value="italic"
                aria-label="Italic">
                <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem
                value="underline"
                aria-label="Underline">
                <Underline />
            </ToggleGroupItem>
        </ToggleGroup>
    ),
    tooltip: () => (
        <Tooltip>
            <TooltipTrigger
                aria-label="Settings"
                className={buttonVariants({ variant: 'outline', size: 'icon' })}>
                <Settings />
            </TooltipTrigger>
            <TooltipContent>Workspace settings</TooltipContent>
        </Tooltip>
    ),
}

const chartData = [
    { month: 'Jan', revenue: 186 },
    { month: 'Feb', revenue: 305 },
    { month: 'Mar', revenue: 237 },
    { month: 'Apr', revenue: 273 },
    { month: 'May', revenue: 209 },
    { month: 'Jun', revenue: 314 },
]
const chartConfig = { revenue: { label: 'Revenue', color: 'var(--chart-1)' } } satisfies ChartConfig
const LOGOS = [Vercel, Claude, NPM, Pnpm, Yarn, Bun, Bolt, Beacon, Spotify]

// Demos for the rest of the library: static components, charts, motion and brand marks.
export const MORE_DEMOS: Record<string, () => ReactNode> = {
    'aspect-ratio': () => (
        <div className="w-72">
            <AspectRatio
                ratio={16 / 9}
                className="grid place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
                16 : 9
            </AspectRatio>
        </div>
    ),
    badge: () => (
        <div className="flex flex-wrap gap-2">
            <Badge>New</Badge>
            <Badge variant="secondary">Beta</Badge>
            <Badge variant="outline">Agent-ready</Badge>
            <Badge variant="destructive">Paused</Badge>
        </div>
    ),
    chart: () => (
        <ChartContainer
            config={chartConfig}
            className="h-48 w-full max-w-md">
            <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={6}
                />
            </BarChart>
        </ChartContainer>
    ),
    progress: () => (
        <Progress
            value={64}
            aria-label="Upload progress"
            className="w-64"
        />
    ),
    'radio-group': () => (
        <RadioGroup
            defaultValue="monthly"
            aria-label="Billing"
            className="grid gap-2">
            {['Monthly', 'Yearly'].map((plan) => (
                <label
                    key={plan}
                    className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={plan.toLowerCase()} />
                    {plan}
                </label>
            ))}
        </RadioGroup>
    ),
    'text-effect': () => (
        <TextEffect
            preset="fade-in-blur"
            className="text-2xl font-semibold">
            Dashboards agents can operate
        </TextEffect>
    ),
    'animated-group': () => (
        <AnimatedGroup
            preset="blur-slide"
            className="grid grid-cols-3 gap-2">
            {['Plan', 'Build', 'Ship'].map((step) => (
                <div
                    key={step}
                    className="rounded-lg border bg-card px-4 py-3 text-sm font-medium">
                    {step}
                </div>
            ))}
        </AnimatedGroup>
    ),
    'infinite-slider': () => (
        <InfiniteSlider
            gap={32}
            speed={40}
            className="w-72">
            {LOGOS.map((Logo, i) => (
                <Logo
                    key={i}
                    className="h-6 w-auto"
                />
            ))}
        </InfiniteSlider>
    ),
    'progressive-blur': () => (
        <div className="relative h-40 w-64 overflow-hidden rounded-xl border bg-card p-4 text-sm leading-relaxed">
            Every control is a UI SDK part, so an AI assistant can read the page and act on it, and it asks before anything destructive. Undo puts everything back.
            <ProgressiveBlur
                direction="bottom"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            />
        </div>
    ),
    'border-beam': () => (
        <div className="relative w-64 overflow-hidden rounded-xl border bg-card p-5">
            <p className="text-sm font-medium">Agent running</p>
            <p className="text-sm text-muted-foreground">Pausing 2 workflows…</p>
            <BorderBeam
                size={80}
                duration={5}
            />
        </div>
    ),
    logos: () => (
        <div className="grid grid-cols-5 gap-5 text-foreground">
            {LOGOS.map((Logo, i) => (
                <Logo
                    key={i}
                    className="size-7"
                />
            ))}
        </div>
    ),
}
