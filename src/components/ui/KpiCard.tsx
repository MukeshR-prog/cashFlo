"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  accentColor?: string;
  description?: string;
  delay?: number;
  sparkline?: React.ReactNode;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  icon: Icon,
  accentColor = "var(--primary)",
  description,
  delay = 0,
  sparkline,
}: KpiCardProps) {
  const DeltaIcon = deltaType === "up" ? TrendingUp : deltaType === "down" ? TrendingDown : Minus;
  const deltaClass =
    deltaType === "up"
      ? "kpi-delta-up"
      : deltaType === "down"
      ? "kpi-delta-down"
      : "text-xs font-semibold text-muted-foreground";

  return (
    <div
      className="kpi-card group animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow background */}
      <div
        className="kpi-card-glow"
        style={{ background: `radial-gradient(ellipse 80% 60% at 30% 20%, ${accentColor}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <p className="kpi-label">{label}</p>
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `color-mix(in oklch, ${accentColor} 12%, transparent)` }}
          >
            <Icon size={17} style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="kpi-value stat-number mb-1">{value}</p>

      {/* Delta & description */}
      <div className="flex items-center justify-between mt-2">
        {delta && (
          <div className={`flex items-center gap-1 ${deltaClass}`}>
            <DeltaIcon size={12} />
            <span>{delta}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Sparkline */}
      {sparkline && <div className="mt-3">{sparkline}</div>}
    </div>
  );
}
