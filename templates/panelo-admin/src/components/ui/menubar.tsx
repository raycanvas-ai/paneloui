"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  type MenuProps,
  type MenuSubProps,
} from "@ui-sdk/react/menu"
import { Menubar as MenubarPrimitive } from "@ui-sdk/react/menubar"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { asChildProps, popupContainer, type WithNodeChildren } from "@/lib/popup-container"

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive>) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        "flex h-8 items-center gap-0.5 rounded-lg border p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: MenuProps) {
  return <Menu {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenuGroup>) {
  return <MenuGroup data-slot="menubar-group" {...props} />
}

function MenubarPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenuRadioGroup<string>>) {
  return (
    <MenuRadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarTrigger({
  className,
  asChild,
  children,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuTrigger>> & { asChild?: boolean }) {
  return (
    <MenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-sm px-1.5 py-[2px] text-sm font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        className
      )}
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenuContent>) {
  return (
    <MenuContent
      data-slot="menubar-content"
      container={popupContainer()}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      collisionPadding={0}
      className={cn("z-50 min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95", className )}
      {...props}
    />
  )
}

function MenubarItem({
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
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
      {...asChildProps(asChild, children)}
    />
  )
}

function MenubarCheckboxItem({
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
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      value={value ?? id}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuItemIndicator>
          <CheckIcon
          />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuCheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuRadioItem>> & {
  inset?: boolean
}) {
  return (
    <MenuRadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenuItemIndicator>
          <CheckIcon
          />
        </MenuItemIndicator>
      </span>
      {children}
    </MenuRadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
}) {
  return (
    <div
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-sm font-medium data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuSeparator>) {
  return (
    <MenuSeparator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/menubar-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({ ...props }: MenuSubProps) {
  return <MenuSub {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: WithNodeChildren<React.ComponentProps<typeof MenuSubTrigger>> & {
  inset?: boolean
}) {
  return (
    <MenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuSubTrigger>
  )
}

function MenubarSubContent({
  className,
  sideOffset = 0,
  alignOffset = 0,
  ...props
}: React.ComponentProps<typeof MenuSubContent>) {
  return (
    <MenuSubContent
      data-slot="menubar-sub-content"
      sideOffset={sideOffset}
      collisionPadding={0}
      alignOffset={alignOffset}
      className={cn("z-50 min-w-32 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
