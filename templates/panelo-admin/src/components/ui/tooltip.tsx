"use client"

import * as React from "react"
import { cn } from "cn"
import * as TooltipPrimitive from "@ui-sdk/react/tooltip"

// Radix's `asChild` becomes ui-sdk's `render`: the child element receives the part's props.
function asChildProps<C>(asChild: boolean | undefined, children: C) {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children }
}

// ui-sdk tooltips group without a provider; the 0ms delay this provided now defaults on Tooltip.
function TooltipProvider({
  children,
}: {
  children?: React.ReactNode
  delayDuration?: number
}) {
  return <>{children}</>
}

function Tooltip({
  delay = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Tooltip>) {
  return <TooltipPrimitive.Tooltip delay={delay} {...props} />
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.TooltipTrigger> & {
  asChild?: boolean
}) {
  return (
    <TooltipPrimitive.TooltipTrigger
      data-slot="tooltip-trigger"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

// Radix added the 10px arrow to the side offset and drew it centred 2px inside the facing edge;
// the arrow below reproduces that from ui-sdk's data-side and --arrow-offset.
// `hidden` is applied as a class, since ui-sdk owns the content's hidden attribute.
function TooltipContent({
  className,
  side = "top",
  align = "center",
  sideOffset = 0,
  collisionPadding = 0,
  arrowPadding = 5,
  hidden,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.TooltipContent>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <TooltipPrimitive.TooltipContent
      data-slot="tooltip-content"
      side={side}
      align={align}
      sideOffset={sideOffset + 10}
      collisionPadding={collisionPadding}
      arrowPadding={arrowPadding}
      className={cn(
        "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        hidden && "hidden",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground [[data-side=bottom]>&]:-top-[3px] [[data-side=bottom]>&]:left-[calc(var(--arrow-offset)-5px)] [[data-side=left]>&]:-right-[3px] [[data-side=left]>&]:top-[calc(var(--arrow-offset)-5px)] [[data-side=right]>&]:-left-[3px] [[data-side=right]>&]:top-[calc(var(--arrow-offset)-5px)] [[data-side=top]>&]:-bottom-[3px] [[data-side=top]>&]:left-[calc(var(--arrow-offset)-5px)]"
      />
    </TooltipPrimitive.TooltipContent>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
