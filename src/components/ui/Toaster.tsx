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
  const id = Math.random().toString(36).slice(2);
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
  success: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  error: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
  warning: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
  info: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
};

const iconColorMap = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
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
        relative flex items-start gap-3 rounded-xl border border-l-4 border-border p-4
        shadow-lg backdrop-blur-sm transition-all duration-350
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
