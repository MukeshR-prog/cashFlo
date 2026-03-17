"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

let listeners: Array<(toast: Toast) => void> = [];
let removeListeners: Array<(id: string) => void> = [];

export function toast(options: Omit<Toast, "id">) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  listeners.forEach((fn) => fn({ ...options, id }));
  return id;
}

toast.success = (title: string, description?: string) =>
  toast({ type: "success", title, description });
toast.error = (title: string, description?: string) =>
  toast({ type: "error", title, description });
toast.warning = (title: string, description?: string) =>
  toast({ type: "warning", title, description });
toast.info = (title: string, description?: string) =>
  toast({ type: "info", title, description });

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: "border-l-success",
  error: "border-l-destructive",
  warning: "border-l-warning",
  info: "border-l-primary",
};

const iconColorMap = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning-foreground",
  info: "text-primary",
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 350);
    }, t.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [t.duration, onRemove]);

  const Icon = iconMap[t.type];

  return (
    <div
      className={`
        relative flex items-start gap-3 rounded-xl border border-l-4 border-border bg-card/95 p-4
        shadow-md backdrop-blur-sm transition-all duration-350
        ${colorMap[t.type]}
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
      style={{ minWidth: 320, maxWidth: 400 }}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColorMap[t.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onRemove, 350);
        }}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={14} />
      </button>
      <div className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden rounded-b-xl bg-muted/60">
        <div className="h-full bg-primary/50 animate-[shrink_4s_linear_forwards]" />
      </div>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addListener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    const removeListener = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    listeners.push(addListener);
    removeListeners.push(removeListener);

    return () => {
      listeners = listeners.filter((fn) => fn !== addListener);
      removeListeners = removeListeners.filter((fn) => fn !== removeListener);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem
            toast={t}
            onRemove={() => {
              setToasts((prev) => prev.filter((item) => item.id !== t.id));
            }}
          />
        </div>
      ))}
    </div>
  );
}
