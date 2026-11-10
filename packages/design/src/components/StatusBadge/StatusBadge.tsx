import * as React from "react";
import { StatusDot } from "../StatusDot/StatusDot.tsx";
import { phaseLook, type Tone } from "../../lib/tone.ts";
import { cn } from "../../lib/cn.ts";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The status text, usually a node, build or deployment phase. Empty reads as "unknown". */
  status?: string | null;
  /** The tone. When absent it is derived from the status through phaseLook(). */
  tone?: Tone;
  /** An outlined diamond. When absent it is derived from the status: installing and offline are outlines. */
  outline?: boolean;
  /** Hide the diamond. The deck always shows it; only drop it where the chip sits in a list of diamonds already. */
  dot?: boolean;
  /** No surface behind the text: the diamond and the word alone, for table cells and dense lists. */
  bare?: boolean;
}

/**
 * A status as the decks draw it: a diamond in the tone beside the status in
 * ink, on a surface chip with a 2px radius. The chip is never tinted; the
 * diamond carries the tone, filled or outlined. A missing status must not
 * throw out of render and take the page down with it, so it reads as
 * "unknown" as a neutral outline.
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, tone, outline, dot = true, bare = false, className, children, ...props }, ref) => {
    const look = phaseLook(status);
    const resolvedTone = tone ?? look.tone;
    const resolvedOutline = outline ?? (tone ? false : look.outline);
    const label = children ?? (status || "unknown");
    return (
      <span
        ref={ref}
        data-tone={resolvedTone}
        data-outline={resolvedOutline || undefined}
        className={cn(
          "inline-flex items-center gap-[7px] text-sm font-semibold text-ink",
          !bare && "rounded-sm bg-surface px-2.5 py-1.5",
          className,
        )}
        {...props}
      >
        {dot && <StatusDot tone={resolvedTone} outline={resolvedOutline} />}
        {label}
      </span>
    );
  },
);
StatusBadge.displayName = "StatusBadge";
