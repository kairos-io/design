import * as React from "react";
import { cn } from "../../lib/cn.ts";
import type { Tone } from "../../lib/tone.ts";
import { StatusDiamond, type NodeState } from "../StatusDiamond/StatusDiamond.tsx";

export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  selected?: boolean;
  /** A node state draws its diamond before the label. */
  state?: NodeState;
  tone?: Tone;
  outline?: boolean;
  /** A count after the label, in the mono face. */
  count?: React.ReactNode;
  onSelect?: () => void;
  children: React.ReactNode;
}

/**
 * A toggle for a filter or a short pick list: the status filters of the
 * nodes page, the base images and Kubernetes distributions of the build
 * wizard. Selected is ink on the page; the rest sit on a surface.
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ selected = false, state, tone, outline, count, onSelect, className, onClick, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        onClick?.(e);
        onSelect?.();
      }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-[7px] rounded-sm px-3 py-[7px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
        selected ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-hover",
        className,
      )}
      {...props}
    >
      {(state || tone) && (
        <StatusDiamond
          state={state}
          tone={tone}
          outline={outline}
          className={cn(selected && (outline ?? (state === "installing" || state === "offline")) && "stroke-bg")}
        />
      )}
      {children}
      {count !== undefined && <span className="font-mono text-xs opacity-75">{count}</span>}
    </button>
  ),
);
FilterChip.displayName = "FilterChip";
