import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { tilePalettes, tilePoints, type TileTone } from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";

export interface TileProps extends React.SVGAttributes<SVGSVGElement>, PaletteProp {
  /** 0 softer, 1 soft, 2 orange; "rest" is the unfilled tile of a bar. */
  tone?: TileTone | "rest";
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
      <polygon
        points={tilePoints}
        fill={tone === "rest" ? "var(--inner)" : tilePalettes[palette][tone]}
        style={{ transition: "fill var(--duration-base) var(--ease-out)" }}
      />
    </svg>
  ),
);
Tile.displayName = "Tile";
