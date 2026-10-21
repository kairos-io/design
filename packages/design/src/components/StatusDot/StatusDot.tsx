import * as React from "react";
import { toneBg, type Tone } from "../../lib/tone.ts";
import { cn } from "../../lib/cn.ts";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone: Tone;
}

/** A decorative tone dot: the status text next to it carries the meaning, so it is hidden from assistive technology. */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ tone, className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", toneBg[tone], className)}
      {...props}
    />
  ),
);
StatusDot.displayName = "StatusDot";
