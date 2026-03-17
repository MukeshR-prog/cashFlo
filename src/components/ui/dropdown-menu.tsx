"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type DropdownContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

function useDropdownContext() {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error("DropdownMenu components must be used inside DropdownMenu")
  }
  return context
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </DropdownContext.Provider>
  )
}

function DropdownMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen } = useDropdownContext()

  return (
    <button
      type="button"
      data-slot="dropdown-menu-trigger"
      data-state={open ? "open" : "closed"}
      className={cn(className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  align = "end",
  children,
}: {
  className?: string
  align?: "start" | "end"
  children: React.ReactNode
}) {
  const { open, setOpen } = useDropdownContext()
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={rootRef}
      data-slot="dropdown-menu-content"
      className={cn(
        "absolute top-[calc(100%+0.5rem)] z-50 min-w-52 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpen } = useDropdownContext()

  return (
    <button
      type="button"
      data-slot="dropdown-menu-item"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        setOpen(false)
      }}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dropdown-menu-separator" className={cn("my-1 h-px bg-border", className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
