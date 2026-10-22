import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.ts";

// Ink per tile follows the Foundations rule: navy on the oranges and on Sky,
// white on Hadron blue and Deep. Written out so Tailwind finds every class.
const markerVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center font-mono font-semibold tabular-nums [clip-path:polygon(32%_0,100%_0,68%_100%,0_100%)]",
  {
    variants: {
      palette: { kairos: "", hadron: "" },
      tone: { 0: "", 1: "", 2: "" },
      size: {
        sm: "h-5 min-w-9 px-3 text-xs",
        default: "h-7 min-w-12 px-4 text-sm",
        lg: "h-10 min-w-16 px-5 text-lg",
      },
    },
    compoundVariants: [
      { palette: "kairos", tone: 0, class: "bg-kairos-light text-ink" },
      { palette: "kairos", tone: 1, class: "bg-kairos-mid text-ink" },
      { palette: "kairos", tone: 2, class: "bg-kairos-orange text-ink" },
      { palette: "hadron", tone: 0, class: "bg-hadron-sky text-ink" },
      { palette: "hadron", tone: 1, class: "bg-hadron-blue text-bg" },
      { palette: "hadron", tone: 2, class: "bg-hadron-deep text-bg" },
    ],
    defaultVariants: { palette: "kairos", tone: 2, size: "default" },
  },
);

export interface TileMarkerProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof markerVariants> {}

/**
 * A numbered tile: the section marker of the talk deck ("03"), for stage
 * numbers, agenda items and step headings. Navy ink on the oranges (4.9:1 on
 * Kairos orange) and on Sky; white on Hadron blue and Deep.
 */
export const TileMarker = React.forwardRef<HTMLSpanElement, TileMarkerProps>(
  ({ palette, tone, size, className, children, ...props }, ref) => (
    <span ref={ref} className={cn(markerVariants({ palette, tone, size }), className)} {...props}>
      {children}
    </span>
  ),
);
TileMarker.displayName = "TileMarker";
