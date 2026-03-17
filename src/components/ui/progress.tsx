"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  value = 0,
  className,
}: {
  value?: number
  className?: string
}) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div
      data-slot="progress"
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

export { Progress }
