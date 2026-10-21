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
        fill={tone === "rest" ? "var(--muted)" : tilePalettes[palette][tone]}
        style={{ transition: "fill var(--duration-base) var(--ease-out)" }}
      />
    </svg>
  ),
);
Tile.displayName = "Tile";

export interface TileBarProps extends React.HTMLAttributes<HTMLDivElement>, PaletteProp {
  /** Tiles in the bar: one per node, step or stage. */
  total: number;
  /** Tiles filled, from the left, cycling through the three tones. */
  done: number;
  /** Rendered tile width in px. */
  size?: number;
  /** Accessible name; the value is announced from done and total. */
  "aria-label"?: string;
}

/** The tile bar: one parallelogram per node or step, for rollouts, install progress and stage markers. */
export const TileBar = React.forwardRef<HTMLDivElement, TileBarProps>(
  (
    { total, done, size = 16, palette = "kairos", className, "aria-label": label = "Progress", ...props },
    ref,
  ) => {
    const filled = Math.max(0, Math.min(total, done));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-valuetext={`${filled} of ${total}`}
        className={cn("flex flex-wrap gap-1", className)}
        {...props}
      >
        {Array.from({ length: total }, (_, i) => (
          <Tile key={i} size={size} palette={palette} tone={i < filled ? ((i % 3) as TileTone) : "rest"} />
        ))}
      </div>
    );
  },
);
TileBar.displayName = "TileBar";
