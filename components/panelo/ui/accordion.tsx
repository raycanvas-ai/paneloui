'use client'

import * as React from 'react'
import { Accordion as AccordionPrimitive, AccordionHeader, AccordionItem as AccordionItemPrimitive, AccordionPanel, AccordionTrigger as AccordionTriggerPrimitive } from '@ui-sdk/react/accordion'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/components/panelo/lib/utils'
import { type WithNodeChildren } from '@/components/panelo/lib/slot'

type AccordionProps = Omit<React.ComponentProps<typeof AccordionPrimitive>, 'value' | 'defaultValue' | 'onValueChange'> & {
    type?: 'single' | 'multiple'
    collapsible?: boolean
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (value: any) => void
}

const list = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : v ? [v] : [])

// shadcn's `type="single"` takes and reports one string; ui-sdk always uses an array of open items.
function Accordion({ type = 'single', collapsible = type === 'multiple', value, defaultValue, onValueChange, ...props }: AccordionProps) {
    return (
        <AccordionPrimitive
            multiple={type === 'multiple'}
            collapsible={collapsible}
            value={list(value)}
            defaultValue={list(defaultValue)}
            onValueChange={onValueChange && ((next: string[]) => onValueChange(type === 'multiple' ? next : (next[0] ?? '')))}
            {...props}
        />
    )
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionItemPrimitive>) {
    return (
        <AccordionItemPrimitive
            className={cn('border-b last:border-b-0', className)}
            {...props}
        />
    )
}

function AccordionTrigger({ className, children, ...props }: WithNodeChildren<React.ComponentProps<typeof AccordionTriggerPrimitive>>) {
    return (
        <AccordionHeader className="flex">
            <AccordionTriggerPrimitive
                className={cn('focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-lg border border-transparent py-4 text-left text-sm font-medium outline-none transition-all hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 data-open:[&>svg]:rotate-180', className)}
                {...props}>
                {children}
                <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
            </AccordionTriggerPrimitive>
        </AccordionHeader>
    )
}

function AccordionContent({ className, children, ...props }: WithNodeChildren<React.ComponentProps<typeof AccordionPanel>>) {
    return (
        <AccordionPanel
            className="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0"
            {...props}>
            <div className={cn('pb-4 pt-0', className)}>{children}</div>
        </AccordionPanel>
    )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
