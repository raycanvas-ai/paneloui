"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Progress as ProgressPrimitive,
  ProgressIndicator,
} from "@ui-sdk/react/progress"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive>) {
  return (
    <ProgressPrimitive
      value={value}
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressIndicator
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive>
  )
}

export { Progress }
