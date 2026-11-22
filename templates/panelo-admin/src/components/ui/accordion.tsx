"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Accordion as AccordionPrimitive,
  AccordionHeader as AccordionPrimitiveHeader,
  AccordionItem as AccordionPrimitiveItem,
  AccordionPanel as AccordionPrimitivePanel,
  AccordionTrigger as AccordionPrimitiveTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

type AccordionProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive>,
  "value" | "defaultValue" | "onValueChange" | "multiple" | "collapsible"
> &
  (
    | {
        type: "single"
        value?: string
        defaultValue?: string
        onValueChange?: (value: string) => void
        collapsible?: boolean
      }
    | {
        type: "multiple"
        value?: string[]
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
      }
  )

// Radix's single mode takes a string ("" = none) and can't collapse by default.
function Accordion({
  className,
  ...props
}: AccordionProps & { className?: string }) {
  if (props.type === "multiple") {
    const { type: _type, ...rest } = props
    return (
      <AccordionPrimitive
        multiple
        className={cn("flex w-full flex-col", className)}
        {...rest}
      />
    )
  }

  const {
    type: _type,
    value,
    defaultValue,
    onValueChange,
    collapsible = false,
    ...rest
  } = props
  return (
    <AccordionPrimitive
      collapsible={collapsible}
      value={value === undefined ? undefined : value ? [value] : []}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={
        onValueChange && ((next: string[]) => onValueChange(next[0] ?? ""))
      }
      className={cn("flex w-full flex-col", className)}
      {...rest}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: Omit<React.ComponentProps<typeof AccordionPrimitiveItem>, "className"> & {
  className?: string
}) {
  return (
    <AccordionPrimitiveItem
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitiveTrigger>,
  "className" | "children"
> & { className?: string; children?: React.ReactNode }) {
  return (
    <AccordionPrimitiveHeader className="flex">
      <AccordionPrimitiveTrigger
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitiveTrigger>
    </AccordionPrimitiveHeader>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitivePanel>,
  "className" | "children"
> & { className?: string; children?: React.ReactNode }) {
  // Height transition, not the accordion-down/up keyframes, so a panel that is
  // open on mount doesn't animate (Radix suppressed that for its keyframes).
  return (
    <AccordionPrimitivePanel
      className="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitivePanel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
