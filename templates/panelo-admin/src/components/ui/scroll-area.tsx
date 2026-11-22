"use client"

import * as React from "react"
import { cn } from "cn"
import {
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

function ScrollArea({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ScrollAreaPrimitive>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <ScrollAreaPrimitive
      data-slot="scroll-area"
      className={cn("relative", className)}
      // Radix's root clipped with overflow: hidden, which also clips the viewport's focus ring.
      style={{ overflow: "hidden" }}
      {...props}
    >
      <ScrollAreaViewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {/* Radix's content wrapper, which consumers target as [data-slot=scroll-area-viewport]>div. */}
        <ScrollAreaContent style={{ minWidth: "100%", display: "table" }}>
          {children}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollBar />
      <ScrollAreaCorner />
    </ScrollAreaPrimitive>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaScrollbar>) {
  return (
    <ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        // Radix unmounted hidden scrollbars; ui-sdk keeps them and flags the visible ones.
        "flex touch-none p-px transition-colors select-none not-data-visible:opacity-0 data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
