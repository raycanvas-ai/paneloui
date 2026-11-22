"use client"

import * as React from "react"
import {
  Collapsible as CollapsiblePrimitive,
  CollapsiblePanel as CollapsiblePrimitivePanel,
  CollapsibleTrigger as CollapsiblePrimitiveTrigger,
} from "@ui-sdk/react/collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive>) {
  return <CollapsiblePrimitive {...props} />
}

function CollapsibleTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitiveTrigger> & {
  asChild?: boolean
}) {
  if (asChild && React.isValidElement<Record<string, unknown>>(children)) {
    return <CollapsiblePrimitiveTrigger render={children} {...props} />
  }
  return <CollapsiblePrimitiveTrigger {...props}>{children}</CollapsiblePrimitiveTrigger>
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitivePanel>) {
  return <CollapsiblePrimitivePanel {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
