"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  Toggle as TogglePrimitive,
  ToggleGroup as ToggleGroupPrimitive,
} from "@ui-sdk/react/toggle"

import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
    type?: "single" | "multiple"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
  type: "single",
})

type ToggleGroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive>,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "multiple"
  | "orientation"
  | "children"
> &
  VariantProps<typeof toggleVariants> & {
    children?: React.ReactNode
    spacing?: number
    orientation?: "horizontal" | "vertical"
  } & (
    | {
        type: "single"
        value?: string
        defaultValue?: string
        onValueChange?: (value: string) => void
      }
    | {
        type: "multiple"
        value?: string[]
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
      }
  )

function toValues(value: string | string[] | undefined) {
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupProps) {
  const { type, value, defaultValue, onValueChange: _, ...rest } = props

  return (
    <ToggleGroupPrimitive
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      orientation={orientation}
      multiple={type === "multiple"}
      value={toValues(value)}
      defaultValue={toValues(defaultValue)}
      onValueChange={(next) => {
        if (props.type === "multiple") props.onValueChange?.(next)
        else props.onValueChange?.(next[0] ?? "")
      }}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...rest}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation, type }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<typeof TogglePrimitive>, "value"> & {
  value: string
} & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      // Match Radix's item markup: a radio in a single group (no aria-pressed, so
      // aria-pressed:* classes stay off), data-state on/off, and natively disabled.
      render={(renderProps, state) => (
        <button
          {...renderProps}
          data-slot="toggle-group-item"
          data-state={state.pressed ? "on" : "off"}
          disabled={state.disabled || undefined}
          {...(context.type === "single" && {
            role: "radio",
            "aria-checked": state.pressed,
            "aria-pressed": undefined,
          })}
        />
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
