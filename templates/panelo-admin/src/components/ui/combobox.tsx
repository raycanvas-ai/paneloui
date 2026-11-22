"use client"

import * as React from "react"
import * as ComboboxPrimitive from "@ui-sdk/react/combobox"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"

import { popupContainer } from "@/lib/popup-container"

// Base UI's Collection read the root's `items`; ui-sdk doesn't expose them, so the wrapper shares them.
const ComboboxItemsContext = React.createContext<readonly unknown[]>([])

function Combobox<T = string, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.ComboboxProps<T, Multiple>
) {
  const items = (props.items ?? []) as readonly unknown[]
  return (
    <ComboboxItemsContext.Provider value={items}>
      <ComboboxPrimitive.Combobox<T, Multiple> {...props} />
    </ComboboxItemsContext.Provider>
  )
}

function ComboboxValue({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.ComboboxValue>) {
  return <ComboboxPrimitive.ComboboxValue {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.ComboboxTrigger>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <ComboboxPrimitive.ComboboxTrigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.ComboboxTrigger>
  )
}

function ComboboxClear({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ComboboxClear>) {
  return (
    <ComboboxPrimitive.ComboboxClear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.ComboboxClear>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.ComboboxInput>, "children"> & {
  children?: React.ReactNode
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      {/* Base UI left InputGroupInput's slot alone, and the group's focus ring keys off it. */}
      <ComboboxPrimitive.ComboboxInput
        render={(inputProps) => (
          <InputGroupInput {...inputProps} data-slot="input-group-control" disabled={disabled} />
        )}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <ComboboxTrigger
            render={
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                data-slot="input-group-button"
                className="group-has-data-[slot=combobox-clear]/input-group:hidden data-open:bg-transparent"
                disabled={disabled}
              />
            }
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  style,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.ComboboxContent>, "anchor" | "style"> & {
  anchor?: React.ComponentProps<typeof ComboboxPrimitive.ComboboxContent>["anchor"] | React.RefObject<HTMLElement | null>
  style?: React.CSSProperties
}) {
  // ui-sdk anchors take an element or a rect source, not a ref; and its --available-height doesn't inherit,
  // so the list reads a copy.
  const resolvedAnchor =
    anchor && typeof anchor === "object" && "current" in anchor
      ? { getBoundingClientRect: () => anchor.current?.getBoundingClientRect() ?? new DOMRect() }
      : anchor
  return (
    <ComboboxPrimitive.ComboboxContent
      data-slot="combobox-content"
      data-chips={!!anchor}
      container={popupContainer()}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={0}
      align={align}
      alignOffset={alignOffset}
      anchor={resolvedAnchor}
      style={{ "--combobox-available-height": "var(--available-height)", ...style } as React.CSSProperties}
      className={cn("group/combobox-content max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ComboboxList>) {
  return (
    <ComboboxPrimitive.ComboboxList
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--combobox-available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 group-has-data-empty/combobox-content:p-0",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem<T = string>({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.ComboboxItem<T>>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <ComboboxPrimitive.ComboboxItem<T>
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ComboboxItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ComboboxItemIndicator>
    </ComboboxPrimitive.ComboboxItem>
  )
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ComboboxGroup>) {
  return (
    <ComboboxPrimitive.ComboboxGroup
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.ComboboxGroupLabel>) {
  return (
    <ComboboxPrimitive.ComboboxGroupLabel
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxCollection({
  children,
}: {
  children: (item: unknown, index: number) => React.ReactNode
}) {
  const items = React.useContext(ComboboxItemsContext)
  return <>{items.map((item, index) => children(item, index))}</>
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.ComboboxEmpty>) {
  return (
    <ComboboxPrimitive.ComboboxEmpty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground data-empty:flex",
        className
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.ComboboxSeparator>) {
  return (
    <ComboboxPrimitive.ComboboxSeparator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.ComboboxChips>) {
  return (
    <ComboboxPrimitive.ComboboxChips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChip<T = string>({
  className,
  children,
  showRemove = true,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxPrimitive.ComboboxChip<T>>, "children"> & {
  children?: React.ReactNode
  showRemove?: boolean
}) {
  return (
    <ComboboxPrimitive.ComboboxChip<T>
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ComboboxChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ComboboxChipRemove>
      )}
    </ComboboxPrimitive.ComboboxChip>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.ComboboxInput>) {
  return (
    <ComboboxPrimitive.ComboboxInput
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
