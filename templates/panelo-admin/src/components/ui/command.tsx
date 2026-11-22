"use client"

import * as React from "react"
import * as CommandPrimitive from "@ui-sdk/react/command"
import { cn } from "cn"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { SearchIcon, CheckIcon } from "lucide-react"

type InputBinding = {
  controller: CommandPrimitive.CommandController
  onValueChange: React.RefObject<((value: string) => void) | undefined>
}

// cmdk controlled the search text on the input; ui-sdk keeps it on the root, so the input reaches it from here.
const CommandInputBinding = React.createContext<InputBinding | null>(null)

function Command({
  className,
  shouldFilter,
  filter,
  controller,
  onQueryChange,
  children,
  ...props
}: Omit<CommandPrimitive.CommandProps, "children"> & {
  children?: React.ReactNode
  shouldFilter?: boolean
}) {
  const [ownController] = React.useState(CommandPrimitive.createCommandController)
  const onValueChange = React.useRef<((value: string) => void) | undefined>(undefined)
  const binding = React.useMemo(
    () => ({ controller: controller ?? ownController, onValueChange }),
    [controller, ownController]
  )
  return (
    <CommandInputBinding.Provider value={binding}>
      <CommandPrimitive.Command
        data-slot="command"
        className={cn(
          "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
          className
        )}
        controller={binding.controller}
        filter={shouldFilter === false ? false : filter}
        onQueryChange={(next, details) => {
          onQueryChange?.(next, details)
          onValueChange.current?.(next)
        }}
        {...props}
      >
        {children}
      </CommandPrimitive.Command>
    </CommandInputBinding.Provider>
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.CommandInput>, "value"> & {
  value?: string
  onValueChange?: (value: string) => void
}) {
  const binding = React.useContext(CommandInputBinding)
  React.useEffect(() => {
    if (binding) binding.onValueChange.current = onValueChange
  })
  React.useEffect(() => {
    if (binding && value !== undefined && value !== binding.controller.getQuery()) {
      binding.controller.setQuery(value)
    }
  }, [binding, value])
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.CommandInput
          data-slot="command-input"
          className={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.CommandList>) {
  return (
    <CommandPrimitive.CommandList
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.CommandEmpty>) {
  // cmdk only mounted this while nothing matched; ui-sdk keeps it as a live region, empty until then.
  return (
    <CommandPrimitive.CommandEmpty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm not-data-empty:py-0", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.CommandGroup>, "children"> & {
  children?: React.ReactNode
  heading?: React.ReactNode
}) {
  return (
    <CommandPrimitive.CommandGroup
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:data-[slot=command-group-label]:px-2 **:data-[slot=command-group-label]:py-1.5 **:data-[slot=command-group-label]:text-xs **:data-[slot=command-group-label]:font-medium **:data-[slot=command-group-label]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {heading && <CommandPrimitive.CommandGroupLabel aria-hidden="true">{heading}</CommandPrimitive.CommandGroupLabel>}
      <div>{children}</div>
    </CommandPrimitive.CommandGroup>
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.CommandSeparator>) {
  return (
    <CommandPrimitive.CommandSeparator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  value,
  label,
  onSelect,
  forceMount: _forceMount,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.CommandItem>, "children" | "onSelect"> & {
  children?: React.ReactNode
  onSelect?: (value: string) => void
  forceMount?: boolean
}) {
  // cmdk searched an item's `value` and passed it to `onSelect`. `forceMount` isn't needed: the only one in the
  // app always matches its own query.
  return (
    <CommandPrimitive.CommandItem
      data-slot="command-item"
      value={value}
      label={label ?? value}
      onSelect={() => onSelect?.(value ?? "")}
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.CommandItem>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
