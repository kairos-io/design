import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { tileFaceOrder, tileFaceStroke, tileHexagon, tilePalettes } from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";

export interface TileUnitProps extends React.SVGAttributes<SVGSVGElement>, PaletteProp {
  /** Rendered width in px. */
  size?: number;
}

/** The unit: one hexagon split into three rhombi in the logo's order (top softer, left soft, right orange). */
export const TileUnit = React.forwardRef<SVGSVGElement, TileUnitProps>(
  ({ size = 64, palette = "kairos", className, ...props }, ref) => {
    const tones = tilePalettes[palette];
    const r = 50;
    const w = Math.sqrt(3) * r;
    const faces = tileHexagon(w / 2, r, r);
    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${w} ${2 * r}`}
        width={size}
        height={(size * 2 * r) / w}
        aria-hidden="true"
        focusable="false"
        className={cn("shrink-0", className)}
        {...props}
      >
        {/* The face stroke, as the field draws a cube: a thin bevelled stroke
            in the face's own tone under its fill hides the seam between the
            three, with no pin at any corner; the top face last. */}
        {tileFaceOrder
          .map((tone) => faces[tone])
          .map((p) => (
            <polygon
              key={p.tone}
              points={p.points}
              fill={tones[p.tone]}
              stroke={tones[p.tone]}
              strokeWidth={tileFaceStroke.width}
              strokeLinejoin={tileFaceStroke.join}
              paintOrder={tileFaceStroke.order}
            />
          ))}
      </svg>
    );
  },
);
TileUnit.displayName = "TileUnit";
