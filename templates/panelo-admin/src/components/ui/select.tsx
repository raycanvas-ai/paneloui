"use client"

import * as React from "react"
import { cn } from "cn"
import * as SelectPrimitive from "@ui-sdk/react/select"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

import { popupContainer } from "@/lib/popup-container"

function Select({
  value,
  defaultValue,
  onValueChange,
  ...props
}: Omit<SelectPrimitive.SelectProps, "value" | "defaultValue" | "onValueChange" | "multiple"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  // Radix showed the placeholder for "" and never reported an empty value.
  return (
    <SelectPrimitive.Select
      value={value === undefined ? undefined : value || null}
      defaultValue={defaultValue === undefined ? undefined : defaultValue || null}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next)
      }}
      {...props}
    />
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.SelectGroup>) {
  return (
    <SelectPrimitive.SelectGroup
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.SelectValue>) {
  return <SelectPrimitive.SelectValue data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.SelectTrigger>, "children"> & {
  children?: React.ReactNode
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.SelectTrigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon aria-hidden="true" className="pointer-events-none size-4 text-muted-foreground" />
    </SelectPrimitive.SelectTrigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  sideOffset = 0,
  style,
  ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.SelectContent>, "children" | "style"> & {
  children?: React.ReactNode
  style?: React.CSSProperties
  position?: "item-aligned" | "popper"
}) {
  // ui-sdk clamps to --available-height before deciding to flip, so a short list near the bottom shrank instead of
  // flipping. The 40vh floor lets it overflow, which makes ui-sdk flip it like Radix did.
  // Radix's content was a flex column around a scrolling viewport, sized from the trigger. ui-sdk's anchor
  // variables don't inherit, so the old names are re-declared here for the viewport to read.
  const vars = {
    display: "flex",
    flexDirection: "column",
    "--radix-select-trigger-width": "var(--anchor-width)",
    "--radix-select-trigger-height": "var(--anchor-height)",
    ...style,
  } as React.CSSProperties
  return (
    <SelectPrimitive.SelectContent
      data-slot="select-content"
      data-align-trigger={position === "item-aligned"}
      container={popupContainer()}
      className={cn("z-50 max-h-[max(var(--available-height),40vh)] min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position ==="popper"&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className )}
      alignItemWithTrigger={position === "item-aligned"}
      // ui-sdk measures the selected item before a lazily mounted list exists, so the first open misaligns.
      keepMounted={position === "item-aligned"}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={0}
      style={vars}
      {...props}
    >
      <SelectScrollUpButton />
      <div
        data-position={position}
        className={cn(
          "no-scrollbar data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
          position === "popper" && ""
        )}
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden auto",
          ...(position === "item-aligned" && { minWidth: "var(--radix-select-trigger-width)" }),
        }}
      >
        {children}
      </div>
      <SelectScrollDownButton />
    </SelectPrimitive.SelectContent>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.SelectGroupLabel>) {
  return (
    <SelectPrimitive.SelectGroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join(" ").trim()
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return nodeText(node.props.children)
  return ""
}

function SelectItem({
  className,
  children,
  label,
  ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.SelectItem<string>>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <SelectPrimitive.SelectItem
      data-slot="select-item"
      label={label ?? (typeof children === "string" ? undefined : nodeText(children) || undefined)}
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.SelectItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.SelectItemIndicator>
      </span>
      {/* SelectItemText only renders plain text (it falls back to the value), so rich children get Radix's plain span and a text label. */}
      {typeof children === "string" || typeof children === "number" ? (
        <SelectPrimitive.SelectItemText>{children}</SelectPrimitive.SelectItemText>
      ) : (
        <span>{children}</span>
      )}
    </SelectPrimitive.SelectItem>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.SelectSeparator>) {
  return (
    <SelectPrimitive.SelectSeparator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

// ui-sdk scrolls the list natively and has no scroll buttons. Radix only showed these while the list overflowed,
// which none of the app's selects do, so they render nothing and stay exported for compatibility.
function SelectScrollUpButton(_props: React.ComponentProps<"div">) {
  return null
}

function SelectScrollDownButton(_props: React.ComponentProps<"div">) {
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
