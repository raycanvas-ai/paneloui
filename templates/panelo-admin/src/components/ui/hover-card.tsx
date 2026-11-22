"use client"

import * as React from "react"
import { cn } from "cn"
import * as HoverCardPrimitive from "@ui-sdk/react/hover-card"

// Radix's `asChild` becomes ui-sdk's `render`: the child element receives the part's props.
function asChildProps<C>(asChild: boolean | undefined, children: C) {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children }
}

// Radix's `openDelay` (700ms default) is ui-sdk's `delay`.
function HoverCard({
  openDelay = 700,
  closeDelay = 300,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.HoverCard> & {
  openDelay?: number
}) {
  return (
    <HoverCardPrimitive.HoverCard
      delay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  )
}

function HoverCardTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.HoverCardTrigger> & {
  asChild?: boolean
}) {
  return (
    <HoverCardPrimitive.HoverCardTrigger
      data-slot="hover-card-trigger"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

// Radix defaults: bottom side, no collision padding. ui-sdk renders in the top layer, no portal.
function HoverCardContent({
  className,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  collisionPadding = 0,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.HoverCardContent>) {
  return (
    <HoverCardPrimitive.HoverCardContent
      data-slot="hover-card-content"
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 w-64 origin-(--transform-origin) rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
