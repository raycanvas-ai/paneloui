'use client'

import * as React from 'react'
import { Radio, RadioGroup as RadioGroupPrimitive, RadioIndicator } from '@ui-sdk/react/radio'

import { cn } from '@/components/panelo/lib/utils'

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive>) {
    return <RadioGroupPrimitive className={cn('grid gap-3', className)} {...props} />
}

function RadioGroupItem({ className, ...props }: Omit<React.ComponentProps<typeof Radio>, 'children'>) {
    return (
        <Radio
            className={cn('border-input grid aspect-square size-4 shrink-0 cursor-pointer place-items-center rounded-full border transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 data-checked:border-primary data-checked:bg-primary dark:data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50', className)}
            {...props}>
            <RadioIndicator className="bg-primary-foreground size-2 rounded-full" />
        </Radio>
    )
}

export { RadioGroup, RadioGroupItem }
