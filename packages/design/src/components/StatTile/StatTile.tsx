import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn.ts";
import { toneBg, toneText, type Tone } from "../../lib/tone.ts";

// Written out in full so Tailwind finds every class.
const toneBar: Record<Tone, string> = {
  success: "border-t-status-healthy",
  warning: "border-t-status-warning",
  danger: "border-t-status-recovery",
  info: "border-t-accent",
  neutral: "border-t-muted",
};

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  icon?: LucideIcon;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** A 3px bar in the tone along the top, and the tone on the icon; the number stays in ink. */
  tone?: Tone;
  /** "lg" is the summary band of the nodes page (34px value); "sm" the health strip of the node detail (19px, bold). */
  size?: "lg" | "sm";
  /** The value in the mono face: a version, an image reference. */
  mono?: boolean;
  children?: React.ReactNode;
}

/**
 * One cell of a summary band: a label in the muted ink, one large value,
 * an optional line of context and optional extra content such as a
 * StackBar. The stat tiles of the console decks: a surface, no border.
 */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  (
    { label, icon: Icon, value, sub, tone, size = "lg", mono = false, children, className, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-base bg-surface p-4 px-[18px]",
        tone && cn("border-t-[3px]", toneBar[tone]),
        className,
      )}
      {...props}
    >
      <div className={cn("flex items-center gap-2 text-muted", size === "lg" ? "text-sm" : "text-[13px]")}>
        {Icon && <Icon className={cn("h-4 w-4 shrink-0", tone && toneText[tone])} aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={cn(
          "truncate text-ink",
          size === "lg"
            ? "text-[34px] font-semibold leading-none tracking-[-0.03em]"
            : "text-[19px] font-bold leading-tight",
          mono && "font-mono font-medium",
        )}
      >
        {value}
      </div>
      {sub && <div className="text-[13px] text-sub">{sub}</div>}
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

/** A small usage bar with its percentage, or a dash with no data. For a disk or a partition at full width, TileMeter draws the same reading in tiles. */
export const MeterBar = React.forwardRef<HTMLDivElement, MeterBarProps>(
  ({ value, className, ...props }, ref) => {
    if (value == null) {
      return (
        <div ref={ref} className={cn("text-muted", className)} {...props}>
          —
        </div>
      );
    }
    const v = Math.round(Math.min(100, Math.max(0, value)));
    const tone = usageTone(v);
    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        <div className="h-1.5 w-16 overflow-hidden rounded-sm bg-raised" aria-hidden="true">
          <div data-tone={tone} className={cn("h-full", toneBg[tone])} style={{ width: `${v}%` }} />
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
 * and its label; with nothing to show it renders an empty track.
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
        className={cn("flex h-2 w-full overflow-hidden rounded-sm bg-raised", className)}
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
