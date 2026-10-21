import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { tilePalettes, tilePoints } from "../../lib/tiles.ts";
import type { Tone } from "../../lib/tone.ts";

// The live meters of the node detail deck: a gauge of thirty tile segments
// in the three oranges, a sparkline, and a disk meter of tiles. Above the
// warning threshold every filled segment turns amber, above the danger
// threshold red, so a hot node reads from across the room.

export const GAUGE_WARNING_PERCENT = 70;
export const GAUGE_DANGER_PERCENT = 85;

/** The tone of a percentage against the gauge thresholds: danger from 85, warning from 70. */
export function gaugeTone(
  percent: number,
  warnAt = GAUGE_WARNING_PERCENT,
  dangerAt = GAUGE_DANGER_PERCENT,
): Tone {
  if (percent >= dangerAt) return "danger";
  if (percent >= warnAt) return "warning";
  return "success";
}

const toneVar: Record<Tone, string> = {
  success: "var(--status-healthy)",
  warning: "var(--status-warning)",
  danger: "var(--status-recovery)",
  info: "var(--accent)",
  neutral: "var(--muted)",
};

export interface GaugeProps extends Omit<React.SVGAttributes<SVGSVGElement>, "values"> {
  /** The reading. */
  value: number;
  max?: number;
  /** Appended to the number: "%" or "°". */
  unit?: string;
  /** Required: what is measured ("CPU"), for assistive technology. */
  label: string;
  /** The small line under the number; the label when absent. */
  sub?: string;
  /** Rendered size in px; the gauge is square. */
  size?: number;
  /** Percent thresholds for the amber and red states. */
  warnAt?: number;
  dangerAt?: number;
  segments?: number;
}

/** A 270° arc of tile segments with the reading in the middle. */
export const Gauge = React.forwardRef<SVGSVGElement, GaugeProps>(
  (
    {
      value,
      max = 100,
      unit = "%",
      label,
      sub,
      size = 132,
      warnAt = GAUGE_WARNING_PERCENT,
      dangerAt = GAUGE_DANGER_PERCENT,
      segments = 30,
      className,
      ...props
    },
    ref,
  ) => {
    const pct = Math.max(0, Math.min(1, value / max));
    const tone = gaugeTone(pct * 100, warnAt, dangerAt);
    const hot = tone === "warning" || tone === "danger";
    const c = 66;
    const r = 57;
    const a0 = 135;
    const span = 270;
    const lit = Math.round(pct * segments);
    const polys: React.ReactNode[] = [];
    for (let i = 0; i < segments; i++) {
      const a = ((a0 + (span * (i + 0.5)) / segments) * Math.PI) / 180;
      const w = ((span / segments) * 0.62 * Math.PI) / 180;
      const p = (ang: number, rr: number) => `${c + rr * Math.cos(ang)},${c + rr * Math.sin(ang)}`;
      const points = [
        p(a - w / 2, r - 7),
        p(a + w / 2 + 0.02, r - 7),
        p(a + w / 2, r + 7),
        p(a - w / 2 - 0.02, r + 7),
      ].join(" ");
      const on = i < lit;
      const third = Math.min(2, Math.floor((i / segments) * 3)) as 0 | 1 | 2;
      polys.push(
        <polygon
          key={i}
          points={points}
          fill={on ? (hot ? toneVar[tone] : tilePalettes.kairos[third]) : "var(--raised)"}
        />,
      );
    }
    const shown = `${Math.round(value)}${unit}`;
    return (
      <svg
        ref={ref}
        viewBox="0 0 132 132"
        width={size}
        height={size}
        role="img"
        aria-label={`${label} ${shown}`}
        data-tone={tone}
        className={cn("shrink-0", className)}
        {...props}
      >
        {polys}
        <text x={c} y={c + 6} textAnchor="middle" className="fill-ink font-sans text-2xl font-bold">
          {shown}
        </text>
        <text x={c} y={c + 22} textAnchor="middle" className="fill-muted font-sans text-[11px] font-semibold">
          {sub ?? label}
        </text>
      </svg>
    );
  },
);
Gauge.displayName = "Gauge";

export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, "values"> {
  /** The series, oldest first. */
  values: number[];
  max?: number;
  /** The line's tone; the accent when absent. */
  tone?: Tone;
  /** A name makes the chart an image for assistive technology; without one it is decorative. */
  "aria-label"?: string;
}

/** A small trend line with a faint area under it, stretched to its box. */
export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  ({ values, max = 100, tone, className, "aria-label": label, ...props }, ref) => {
    const w = 240;
    const h = 40;
    const n = Math.max(1, values.length - 1);
    const pts = values.map((v, i) => [(i / n) * w, h - (Math.min(max, Math.max(0, v)) / max) * (h - 4) - 2]);
    const d = pts.length ? "M" + pts.map((p) => p.join(" ")).join(" L") : "";
    const stroke = tone ? toneVar[tone] : "var(--accent)";
    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={cn("block h-10 w-full", className)}
        {...props}
      >
        {d && <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={stroke} opacity={0.18} />}
        {d && <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
      </svg>
    );
  },
);
Sparkline.displayName = "Sparkline";

export interface TileMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0 to 100. */
  value: number;
  /** Required: what is measured ("Persistent partition"). */
  "aria-label": string;
  /** Text for the value, read instead of the percentage ("182 GB of 420 GB"). */
  valueText?: string;
  /** Tiles in the meter. */
  count?: number;
  warnAt?: number;
  dangerAt?: number;
}

/** A row of tiles filled from the left: the disk meter of the node detail deck. */
export const TileMeter = React.forwardRef<HTMLDivElement, TileMeterProps>(
  (
    {
      value,
      valueText,
      count = 24,
      warnAt = GAUGE_WARNING_PERCENT,
      dangerAt = GAUGE_DANGER_PERCENT,
      className,
      "aria-label": label,
      ...props
    },
    ref,
  ) => {
    const v = Math.max(0, Math.min(100, value));
    const tone = gaugeTone(v, warnAt, dangerAt);
    const hot = tone === "warning" || tone === "danger";
    const lit = Math.round((v / 100) * count);
    return (
      <div
        ref={ref}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v)}
        aria-valuetext={valueText}
        data-tone={tone}
        className={cn("flex gap-0.5", className)}
        {...props}
      >
        {Array.from({ length: count }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 22 14"
            preserveAspectRatio="none"
            className="h-2.5 min-w-0 flex-1"
            aria-hidden="true"
          >
            <polygon
              points={tilePoints}
              fill={
                i < lit ? (hot ? toneVar[tone] : tilePalettes.kairos[(i % 3) as 0 | 1 | 2]) : "var(--raised)"
              }
            />
          </svg>
        ))}
      </div>
    );
  },
);
TileMeter.displayName = "TileMeter";
