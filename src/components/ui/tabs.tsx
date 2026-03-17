"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextType = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used inside Tabs")
  }
  return context
}

function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const currentValue = value ?? internalValue

  const setValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div data-slot="tabs" className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-muted/60 p-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  value: string
}) {
  const tabs = useTabsContext()
  const active = tabs.value === value

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all",
        "hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      onClick={() => tabs.setValue(value)}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: string
}) {
  const tabs = useTabsContext()

  if (tabs.value !== value) {
    return null
  }

  return (
    <div data-slot="tabs-content" className={cn("mt-4", className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
