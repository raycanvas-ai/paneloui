"use client"

import * as React from "react"
import { cn } from "cn"
import * as DrawerPrimitive from "@ui-sdk/react/drawer"

// Radix's `asChild` becomes ui-sdk's `render`: the child element receives the part's props.
function asChildProps<C>(asChild: boolean | undefined, children: C) {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children }
}

// vaul's `direction` maps to ui-sdk's `side`, which the content reports as `data-side`.
function Drawer({
  direction = "bottom",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Drawer> & {
  direction?: "top" | "right" | "bottom" | "left"
}) {
  return <DrawerPrimitive.Drawer side={direction} {...props} />
}

function DrawerTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.DrawerTrigger> & {
  asChild?: boolean
}) {
  return (
    <DrawerPrimitive.DrawerTrigger
      data-slot="drawer-trigger"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

// ui-sdk renders popups in place in the top layer, so the portal is a pass-through.
function DrawerPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DrawerClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.DrawerClose> & {
  asChild?: boolean
}) {
  return (
    <DrawerPrimitive.DrawerClose
      data-slot="drawer-close"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.DrawerBackdrop>) {
  return (
    <DrawerPrimitive.DrawerBackdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DrawerPrimitive.DrawerContent>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.DrawerContent
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:mt-24 data-[side=bottom]:max-h-[80vh] data-[side=bottom]:rounded-t-xl data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:w-3/4 data-[side=left]:rounded-r-xl data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:w-3/4 data-[side=right]:rounded-l-xl data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:mb-24 data-[side=top]:max-h-[80vh] data-[side=top]:rounded-b-xl data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-full bg-muted group-data-[side=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.DrawerContent>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[side=bottom]/drawer-content:text-center group-data-[side=top]/drawer-content:text-center md:gap-0.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.DrawerTitle>) {
  return (
    <DrawerPrimitive.DrawerTitle
      data-slot="drawer-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.DrawerDescription>) {
  return (
    <DrawerPrimitive.DrawerDescription
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
