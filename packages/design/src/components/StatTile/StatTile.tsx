import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { toneBg, toneText, type Tone } from "../../lib/tone.ts";

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: LucideIcon;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** Colours the icon only; the number stays in the foreground colour. */
  tone?: Tone;
  children?: React.ReactNode;
}

/**
 * One cell of a summary band: a label, a large value, an optional sub-line
 * and optional extra content such as a StackBar. AuroraBoot's fleet/StatTile.tsx.
 */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ label, icon: Icon, value, sub, tone, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-4", className)}
      {...props}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className={cn("h-4 w-4 shrink-0", tone && toneText[tone])} aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      {children}
    </div>
  ),
);
StatTile.displayName = "StatTile";

export const WARNING_PERCENT = 80;
export const DANGER_PERCENT = 90;

/** The tone of a usage percentage: danger from 90, warning from 80, success below. */
export function usageTone(percent: number): Tone {
  if (percent >= DANGER_PERCENT) return "danger";
  if (percent >= WARNING_PERCENT) return "warning";
  return "success";
}

export interface MeterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0 to 100, or null when there is no sample yet. */
  value: number | null;
}

/** A small usage bar with its percentage, or a dash with no data. AuroraBoot's fleet/MeterBar.tsx. */
export const MeterBar = React.forwardRef<HTMLDivElement, MeterBarProps>(
  ({ value, className, ...props }, ref) => {
    if (value == null) {
      return (
        <div ref={ref} className={cn("text-muted-foreground", className)} {...props}>
          —
        </div>
      );
    }
    const v = Math.round(Math.min(100, Math.max(0, value)));
    const tone = usageTone(v);
    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            data-tone={tone}
            className={cn("h-full rounded-full", toneBg[tone])}
            style={{ width: `${v}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums">{v}%</span>
      </div>
    );
  },
);
MeterBar.displayName = "MeterBar";

export interface StackBarCount {
  tone: Tone;
  count: number;
  label: string;
}

export interface StackBarProps extends React.HTMLAttributes<HTMLDivElement> {
  counts: StackBarCount[];
}

/**
 * A bar split by count per status. Zero counts are left out of both the bar
 * and its label; with nothing to show it renders an empty track. AuroraBoot's fleet/StackBar.tsx.
 */
export const StackBar = React.forwardRef<HTMLDivElement, StackBarProps>(
  ({ counts, className, ...props }, ref) => {
    const shown = counts.filter((c) => c.count > 0);
    const total = shown.reduce((sum, c) => sum + c.count, 0);
    const label = shown.length ? shown.map((c) => `${c.count} ${c.label}`).join(", ") : "None";
    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className={cn("flex h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        {shown.map((c) => (
          <div
            key={`${c.tone}-${c.label}`}
            data-tone={c.tone}
            className={cn("h-full", toneBg[c.tone])}
            style={{ width: `${(c.count / total) * 100}%` }}
          />
        ))}
      </div>
    );
  },
);
StackBar.displayName = "StackBar";
