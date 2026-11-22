"use client"

import * as React from "react"
import { cn } from "cn"
import * as SheetPrimitive from "@ui-sdk/react/dialog"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// Radix's `asChild` becomes ui-sdk's `render`: the child element receives the part's props.
function asChildProps<C>(asChild: boolean | undefined, children: C) {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children }
}

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Dialog>) {
  return <SheetPrimitive.Dialog {...props} />
}

function SheetTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.DialogTrigger> & {
  asChild?: boolean
}) {
  return (
    <SheetPrimitive.DialogTrigger
      data-slot="sheet-trigger"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

function SheetClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.DialogClose> & {
  asChild?: boolean
}) {
  return (
    <SheetPrimitive.DialogClose
      data-slot="sheet-close"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

// ui-sdk renders popups in place in the top layer, so the portal is a pass-through.
function SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.DialogBackdrop>) {
  return (
    <SheetPrimitive.DialogBackdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof SheetPrimitive.DialogContent>, "children"> & {
  children?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.DialogContent
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.DialogClose
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.DialogClose>
        )}
      </SheetPrimitive.DialogContent>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.DialogTitle>) {
  return (
    <SheetPrimitive.DialogTitle
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.DialogDescription>) {
  return (
    <SheetPrimitive.DialogDescription
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
