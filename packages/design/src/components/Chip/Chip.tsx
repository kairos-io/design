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
  /** A selected filter: the accent hairline on the raised fill. */
  selected?: boolean;
  /** Mono text (labels, paths) or the sans face (plain words). */
  mono?: boolean;
  /** A hairline instead of the raised fill: "group: retail-eu". */
  outline?: boolean;
}

/**
 * A compact token: a node label, an active filter, an uploaded file name.
 * The tag of the Foundations deck (mono, 12px, a raised fill or a hairline,
 * a 2px radius) with an optional remove button. A chip with `onRemove` gets
 * a labelled remove button; the chip itself is not a button, so set
 * `selected` and wrap it in one for toggling filters.
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    { children, onRemove, removeLabel, selected = false, mono = true, outline = false, className, ...props },
    ref,
  ) => {
    const name = removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-sm border text-xs leading-4 text-ink",
          onRemove ? "py-[3px] pl-[7px] pr-0.5" : "px-[7px] py-[3px]",
          mono && "font-mono",
          outline ? "bg-transparent" : "bg-raised",
          selected ? "border-accent-line" : outline ? "border-line" : "border-transparent",
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
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </span>
    );
  },
);
Chip.displayName = "Chip";
