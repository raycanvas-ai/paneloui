"use client"

import * as React from "react"
import { cn } from "cn"
import { Label as LabelPrimitive } from "@ui-sdk/react/label"

function Label({
  className,
  "data-slot": slot = "label",
  ...props
}: React.ComponentProps<typeof LabelPrimitive> & { "data-slot"?: string }) {
  return (
    <LabelPrimitive
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      // ui-sdk sets its own data-slot; wrappers like FieldLabel pass theirs through the element.
      render={<label data-slot={slot} />}
      {...props}
    />
  )
}

export { Label }
