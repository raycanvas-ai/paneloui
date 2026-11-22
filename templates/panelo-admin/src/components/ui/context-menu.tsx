"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  type MenuProps,
  type MenuSubProps,
} from "@ui-sdk/react/menu"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

import { asChildProps, popupContainer, type WithNodeChildren } from "@/lib/popup-container"

function ContextMenu({ ...props }: MenuProps) {
  return <Menu {...props} />
}

function ContextMenuTrigger({
  className,
  asChild,
  children,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuContextTrigger>> & { asChild?: boolean }) {
  return (
    <MenuContextTrigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
      {...(asChild ? asChildProps(asChild, children) : { render: <span />, children })}
    />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof MenuGroup>) {
  return (
    <MenuGroup data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function ContextMenuSub({ ...props }: MenuSubProps) {
  return <MenuSub {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof MenuRadioGroup<string>>) {
  return (
    <MenuRadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  side = "right",
  align = "start",
  sideOffset = 2,
  ...props
}: React.ComponentProps<typeof MenuContent>) {
  return (
    <MenuContent
      data-slot="context-menu-content"
      container={popupContainer()}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={0}
      className={cn("z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  asChild,
  children,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuItem>> & {
  inset?: boolean
  variant?: "default" | "destructive"
  asChild?: boolean
}) {
  return (
    <MenuItem
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuSubTrigger>> & {
  inset?: boolean
}) {
  return (
    <MenuSubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuSubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  sideOffset = 0,
  alignOffset = 0,
  ...props
}: React.ComponentProps<typeof MenuSubContent>) {
  return (
    <MenuSubContent
      data-slot="context-menu-sub-content"
      sideOffset={sideOffset}
      collisionPadding={0}
      alignOffset={alignOffset}
      className={cn("z-50 min-w-32 origin-(--transform-origin) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  value,
  ...props
}: Omit<WithNodeChildren<React.ComponentProps<typeof MenuCheckboxItem>>, "value"> & {
  value?: string
  inset?: boolean
}) {
  const id = React.useId()
  return (
    <MenuCheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      value={value ?? id}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <MenuItemIndicator>
          <CheckIcon
          />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuRadioItem>> & {
  inset?: boolean
}) {
  return (
    <MenuRadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <MenuItemIndicator>
          <CheckIcon
          />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuRadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
}) {
  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuSeparator>) {
  return (
    <MenuSeparator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/context-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
