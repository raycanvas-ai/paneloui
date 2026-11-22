"use client"

import * as React from "react"
import { cn } from "cn"
import { Separator as SeparatorPrimitive } from "@ui-sdk/react/separator"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  "data-slot": slot = "separator",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive> & {
  "data-slot"?: string
}) {
  return (
    <SeparatorPrimitive
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      // ui-sdk sets its own data-slot; wrappers like SidebarSeparator pass theirs through the element.
      render={<div data-slot={slot} />}
      {...props}
    />
  )
}

export { Separator }
