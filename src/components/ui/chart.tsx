"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: string
    color?: string
  }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  config,
  children,
}: React.ComponentProps<"div"> & {
  config: ChartConfig
}) {
  const chartId = React.useId()
  const containerId = `chart-${id || chartId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={containerId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          className
        )}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltip({
  content,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip cursor={false} content={content} {...props} />
}

function ChartTooltipContent({
  active,
  payload,
  className,
  valueFormatter,
}: React.ComponentProps<"div"> & {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>
  valueFormatter?: (value: number) => string
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid min-w-[9rem] gap-1 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? index)
        const label = config[key]?.label ?? item.name
        const color = item.color ?? config[key]?.color ?? "var(--color-chart-1)"
        const value = Number(item.value ?? 0)

        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
            <span className="font-medium text-foreground">
              {valueFormatter ? valueFormatter(value) : value.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
