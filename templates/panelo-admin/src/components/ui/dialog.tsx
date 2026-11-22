"use client"

import * as React from "react"
import { cn } from "cn"
import * as DialogPrimitive from "@ui-sdk/react/dialog"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// Radix's `asChild` becomes ui-sdk's `render`: the child element receives the part's props.
function asChildProps<C>(asChild: boolean | undefined, children: C) {
  return asChild && React.isValidElement<Record<string, unknown>>(children)
    ? { render: children }
    : { children }
}

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Dialog>) {
  return <DialogPrimitive.Dialog {...props} />
}

function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.DialogTrigger> & {
  asChild?: boolean
}) {
  return (
    <DialogPrimitive.DialogTrigger
      data-slot="dialog-trigger"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

// ui-sdk renders popups in place in the top layer, so the portal is a pass-through.
function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DialogClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.DialogClose> & {
  asChild?: boolean
}) {
  return (
    <DialogPrimitive.DialogClose
      data-slot="dialog-close"
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.DialogBackdrop>) {
  return (
    <DialogPrimitive.DialogBackdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.DialogContent>, "children"> & {
  children?: React.ReactNode
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.DialogContent
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.DialogClose
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.DialogClose>
        )}
      </DialogPrimitive.DialogContent>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.DialogClose render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.DialogClose>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.DialogTitle>) {
  return (
    <DialogPrimitive.DialogTitle
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.DialogDescription>) {
  return (
    <DialogPrimitive.DialogDescription
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
