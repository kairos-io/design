import * as React from "react";
import { toneFill, toneStroke, type Tone } from "../../lib/tone.ts";
import { cn } from "../../lib/cn.ts";

export interface StatusDotProps extends React.SVGAttributes<SVGSVGElement> {
  tone: Tone;
  /** An outlined diamond: a state that is not there yet (installing) or has gone quiet (offline). */
  outline?: boolean;
  /** The diamond's size in px. 11 beside 14px text, 14 beside 15px body copy. */
  size?: number;
}

/**
 * The status diamond: the node-state mark of the Foundations deck, filled
 * or outlined in its tone. Decorative: the status text next to it carries
 * the meaning, so it is hidden from assistive technology.
 */
export const StatusDot = React.forwardRef<SVGSVGElement, StatusDotProps>(
  ({ tone, outline = false, size = 11, className, ...props }, ref) => (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={cn("inline-block shrink-0", outline ? toneStroke[tone] : toneFill[tone], className)}
      {...props}
    >
      <polygon points="6,0.8 11.2,6 6,11.2 0.8,6" strokeWidth="1.5" />
    </svg>
  ),
);
StatusDot.displayName = "StatusDot";
