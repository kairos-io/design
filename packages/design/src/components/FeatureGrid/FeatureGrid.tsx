import * as React from "react";
import { cn } from "../../lib/cn.ts";

export interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum cell width; the grid fits as many as the row allows. */
  minWidth?: number;
}

/**
 * Surface cells separated by hairlines: a grid with a 1px gap over the line
 * colour, as the stage and principle grids on the homepages are drawn.
 */
export const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ minWidth = 240, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid gap-px border border-line bg-line", className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`, ...style }}
      {...props}
    />
  ),
);
FeatureGrid.displayName = "FeatureGrid";

export interface FeatureCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A tile, a diamond or an icon at the top of the cell, with its mono label. */
  marker?: React.ReactNode;
  label?: React.ReactNode;
}

/** One cell of a FeatureGrid: a surface with an optional marker row, then whatever the cell holds. */
export const FeatureCell = React.forwardRef<HTMLDivElement, FeatureCellProps>(
  ({ marker, label, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-5 bg-surface p-6", className)} {...props}>
      {(marker || label) && (
        <div className="flex items-center gap-2.5">
          {marker}
          {label && <span className="font-mono text-xs text-muted">{label}</span>}
        </div>
      )}
      {children}
    </div>
  ),
);
FeatureCell.displayName = "FeatureCell";
