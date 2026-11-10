import * as React from "react";
import { cn } from "../../lib/cn.ts";
import {
  tileOutlinePoints,
  tileOutlineStrokeWidth,
  tilePalettes,
  tilePoints,
  type TileTone,
} from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";

export interface TileProps extends React.SVGAttributes<SVGSVGElement>, PaletteProp {
  /**
   * 0 softer, 1 soft, 2 orange; "rest" is the unfilled tile of a bar;
   * "outline" is the in-progress tile of a rollout bar, the orange as a
   * stroke with nothing inside.
   */
  tone?: TileTone | "rest" | "outline";
  /** Rendered width in px; the height follows the 22:14 box. */
  size?: number;
}

/** One tile: a parallelogram, a rhombus seen flat. */
export const Tile = React.forwardRef<SVGSVGElement, TileProps>(
  ({ tone = 2, size = 22, palette = "kairos", className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 22 14"
      width={size}
      height={(size * 14) / 22}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      {tone === "outline" ? (
        <polygon
          points={tileOutlinePoints}
          fill="none"
          stroke={tilePalettes[palette][2]}
          strokeWidth={tileOutlineStrokeWidth}
          strokeLinejoin="miter"
        />
      ) : (
        <polygon
          points={tilePoints}
          fill={tone === "rest" ? "var(--inner)" : tilePalettes[palette][tone]}
          style={{ transition: "fill var(--duration-base) var(--ease-out)" }}
        />
      )}
    </svg>
  ),
);
Tile.displayName = "Tile";
