import * as React from "react";
import { Badge, type BadgeProps } from "../Badge/Badge.tsx";
import { StatusDot } from "../StatusDot/StatusDot.tsx";
import { phaseTone, toneSoft, type Tone } from "../../lib/tone.ts";
import { cn } from "../../lib/cn.ts";

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  /** The status text, usually a node, build or deployment phase. Empty reads as "unknown". */
  status?: string | null;
  /** The tone. When absent it is derived from the status through phaseTone(). */
  tone?: Tone;
  /** Prefix the text with a StatusDot. */
  dot?: boolean;
}

/**
 * A status in its tone: the tone at 15% behind its -foreground ink, as
 * AuroraBoot's StatusBadge. A missing status must not throw out of render and
 * take the page down with it, so it reads as "unknown" in the neutral tone.
 */
export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, tone, dot = false, className, children, ...props }, ref) => {
    const resolvedTone = tone ?? phaseTone(status);
    const label = children ?? (status || "unknown");
    return (
      <Badge
        ref={ref}
        variant="outline"
        className={cn(toneSoft[resolvedTone], dot && "gap-1.5", className)}
        {...props}
      >
        {dot && <StatusDot tone={resolvedTone} />}
        {label}
      </Badge>
    );
  },
);
StatusBadge.displayName = "StatusBadge";
