"use client"

import * as React from "react"
import { X, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ToastItem = {
  id: string
  title: string
  description: string
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-[20rem] rounded-xl border border-border bg-card p-3 shadow-lg",
            "animate-in fade-in-0 slide-in-from-bottom-3"
          )}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5 rounded-md bg-primary/15 p-1 text-primary">
              <Bell size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{toast.title}</p>
              <p className="text-xs text-muted-foreground">{toast.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDismiss(toast.id)}
              className="-mt-0.5"
            >
              <X size={13} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export { Toaster }
