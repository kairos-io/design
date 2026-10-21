import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn.ts";

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onSelect"> {
  /** The chip text, in the mono face: a label, a filter, a path. */
  children: React.ReactNode;
  /** Shows a remove button that calls this. */
  onRemove?: () => void;
  /** The accessible name of the remove button; defaults to "Remove <text>" when children is a string. */
  removeLabel?: string;
  /** A selected filter: primary border and soft fill. */
  selected?: boolean;
  /** Mono text (labels, paths) or the sans face (plain words). */
  mono?: boolean;
}

/**
 * A compact token: a node label, an active filter, an uploaded file name.
 * The installer's `.chip` and AuroraBoot's FilterChip and LabelChips. A chip
 * with `onRemove` gets a labelled remove button; the chip itself is not a
 * button, so set `selected` and wrap it in one for toggling filters.
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ children, onRemove, removeLabel, selected = false, mono = true, className, ...props }, ref) => {
    const name = removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-base border py-0.5 pl-2.5 text-xs",
          onRemove ? "pr-1" : "pr-2.5",
          mono && "font-mono",
          selected ? "border-accent bg-raised text-ink" : "border-line bg-raised text-ink",
          className,
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        {onRemove && (
          <button
            type="button"
            aria-label={name}
            onClick={onRemove}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </span>
    );
  },
);
Chip.displayName = "Chip";
