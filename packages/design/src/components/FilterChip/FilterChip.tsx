import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { phaseLook, type Tone } from "../../lib/tone.ts";
import { StatusDot } from "../StatusDot/StatusDot.tsx";
import { focusRingOffset } from "../../lib/focus.ts";

export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  selected?: boolean;
  /** A status ("Healthy", "Installing") draws its diamond before the label, through phaseLook(). */
  status?: string;
  /** A tone on its own, for a diamond that is not a node state. */
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
  (
    { selected = false, status, tone, outline, count, onSelect, className, onClick, children, ...props },
    ref,
  ) => {
    const look = status ? phaseLook(status) : undefined;
    const diamondTone = tone ?? look?.tone;
    const diamondOutline = outline ?? look?.outline ?? false;
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        onClick={(e) => {
          onClick?.(e);
          onSelect?.();
        }}
        className={cn(
          `inline-flex cursor-pointer items-center gap-[7px] rounded-sm px-3 py-[7px] text-sm font-semibold transition-colors ${focusRingOffset}`,
          selected ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-hover",
          className,
        )}
        {...props}
      >
        {diamondTone && (
          <StatusDot
            size={10}
            tone={diamondTone}
            outline={diamondOutline}
            className={cn(selected && diamondOutline && diamondTone === "neutral" && "stroke-bg")}
          />
        )}
        {children}
        {count !== undefined && <span className="font-mono text-xs opacity-75">{count}</span>}
      </button>
    );
  },
);
FilterChip.displayName = "FilterChip";
