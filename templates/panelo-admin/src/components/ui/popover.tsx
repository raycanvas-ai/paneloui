"use client"

import * as React from "react"
import { cn } from "cn"
import * as PopoverPrimitive from "@ui-sdk/react/popover"

// Radix's `asChild` becomes ui-sdk's `render`: the child element receives the part's props.
function asChildProps<C>(asChild: boolean | undefined, children: C) {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children }
}

function Popover({
  modal = false,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popover>) {
  return <PopoverPrimitive.Popover modal={modal} {...props} />
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.PopoverTrigger> & {
  asChild?: boolean
}) {
  return (
    <PopoverPrimitive.PopoverTrigger
      data-slot="popover-trigger"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

// Radix defaults: bottom side, no collision padding. ui-sdk renders in the top layer, no portal.
function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  collisionPadding = 0,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.PopoverContent>) {
  return (
    <PopoverPrimitive.PopoverContent
      data-slot="popover-content"
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

// ui-sdk positions against the trigger or PopoverContent's `anchor` prop; this stays for API compatibility.
function PopoverAnchor({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-anchor" {...props} />
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
