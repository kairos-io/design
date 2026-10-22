import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface ReserveWidthProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The widest state the box must hold: the bold label, the chip's "Copied". */
  twin: React.ReactNode;
  /** Classes on the visible content, for what changes with state (the weight). */
  childClassName?: string;
  /** Classes on the twin, for the widest state (the bold weight). */
  twinClassName?: string;
}

/**
 * Holds a box at the width of its widest state. The content and an invisible
 * twin share one grid cell, so the box is as wide as the wider of the two
 * and nothing around it shifts when a label turns bold or a copy chip says
 * "Copied". Layout only, not a piece of the design, so it is not exported
 * from the package; the twin is hidden from assistive technology.
 */
export const ReserveWidth = React.forwardRef<HTMLSpanElement, ReserveWidthProps>(
  ({ twin, childClassName, twinClassName, className, children, ...props }, ref) => (
    <span ref={ref} className={cn("grid", className)} {...props}>
      <span className={cn("col-start-1 row-start-1", childClassName)}>{children}</span>
      <span aria-hidden="true" className={cn("invisible col-start-1 row-start-1", twinClassName)}>
        {twin}
      </span>
    </span>
  ),
);
ReserveWidth.displayName = "ReserveWidth";
