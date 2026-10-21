import * as React from "react";
import { cn } from "../../lib/cn.ts";
import type { PaletteProp } from "./shared.ts";
import {
  tileEnterDelay,
  tileField,
  tileFades,
  tilePalettes,
  type TileBias,
  type TileFade,
  type TilePalette,
  type TileTone,
} from "../../lib/tiles.ts";

export type { TileBias, TileFade, TilePalette, TileTone };

// The entrance: the dense edge lands first, the sparse edge ENTER_SPAN ms
// later, each tile with up to ENTER_JITTER ms of jitter and ENTER_DURATION ms
// of motion (the slow duration token). Every LIVE_EVERY-th cube breathes.
const ENTER_SPAN = 700;
const ENTER_JITTER = 160;
const ENTER_DURATION = 360;
const LIVE_EVERY = 5;

export interface TileFieldProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height">, PaletteProp {
  /** Which edge the tiles cling to, or a custom bias function. */
  fade?: TileFade | TileBias;
  /** Same seed, same field. Change it to get a different arrangement. */
  seed?: number;
  /** Hexagon radius in viewBox units: 38 reads as texture, 64 as shapes. */
  radius?: number;
  /** viewBox size; the SVG itself fills its container and crops (slice). */
  width?: number;
  height?: number;
  /** Fill every rhombus. */
  solid?: boolean;
  /** Colour of the unfilled outlines; the border token by default, the sidebar hairline on navy. */
  line?: string;
  /**
   * Motion. "in": filled tiles drop into place once, dense edge first.
   * "live": a few tiles keep breathing after that. Both are CSS only and
   * stop under prefers-reduced-motion.
   */
  animate?: "in" | "live" | false;
}

/**
 * A decorative field of Kairos tiles that fills its positioned parent, dense
 * at one edge and fading to hairline outlines. For heroes and empty states,
 * never behind text: put the copy beside it, as the pages do.
 */
export const TileField = React.forwardRef<SVGSVGElement, TileFieldProps>(
  (
    {
      fade = "right",
      seed = 5,
      radius = 38,
      width = 700,
      height = 460,
      solid = false,
      palette = "kairos",
      line = "var(--border)",
      animate = false,
      className,
      ...props
    },
    ref,
  ) => {
    const bias = typeof fade === "function" ? fade : tileFades[fade];
    const tones = tilePalettes[palette];
    const polygons = React.useMemo(
      () => tileField({ width, height, radius, seed, bias, solid }),
      [width, height, radius, seed, bias, solid],
    );

    // Motion runs per hexagon, not per rhombus: while an element animates the
    // browser rasterises it on its own layer, and the anti-aliased edges of
    // its neighbours stop overlapping, which shows what is beneath through
    // hairline seams. Grouping the three faces removes the seams inside a
    // cube, the full grid underneath means a seam shows a hairline rather
    // than the page, the motion is a fade and a short drop with no scaling
    // so a face is never inset from its cell, and once the last cube has
    // landed the classes come off so everything paints as the static field.
    // "live" then breathes a few whole cubes, each over its own outlined cell.
    const [settled, setSettled] = React.useState(false);
    React.useEffect(() => {
      setSettled(false);
      if (!animate) return;
      const timer = window.setTimeout(() => setSettled(true), ENTER_SPAN + ENTER_JITTER + ENTER_DURATION);
      return () => window.clearTimeout(timer);
    }, [animate, seed, fade, radius, width, height, solid, palette]);

    const groups = React.useMemo(() => {
      const byHex = new Map<number, (typeof polygons)[number][]>();
      for (const p of polygons) {
        const list = byHex.get(p.hex);
        if (list) list.push(p);
        else byHex.set(p.hex, [p]);
      }
      return Array.from(byHex.values());
    }, [polygons]);

    const groupClass = (hexIndex: number, anyFilled: boolean): string | undefined => {
      if (!animate || !anyFilled) return undefined;
      if (!settled) return "tile-in";
      return animate === "live" && hexIndex % LIVE_EVERY === 0 ? "tile-live" : undefined;
    };
    const groupStyle = (
      first: (typeof polygons)[number],
      hexIndex: number,
    ): React.CSSProperties | undefined => {
      if (!animate) return undefined;
      if (!settled)
        return { "--tile-delay": `${tileEnterDelay(first, hexIndex, ENTER_SPAN)}ms` } as React.CSSProperties;
      if (animate === "live" && hexIndex % LIVE_EVERY === 0) {
        return {
          "--tile-live-delay": `${(hexIndex * 613) % 9000}ms`,
          "--tile-live-duration": `${6000 + ((hexIndex * 271) % 5000)}ms`,
        } as React.CSSProperties;
      }
      return undefined;
    };

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
        data-animate={animate || undefined}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
        {...props}
      >
        {/* The whole grid first, one outline per cell whether it will be filled
            or not, so no cube is ever painted over by a neighbour's hairline
            and a cube that has not landed yet sits on its outline, never on a
            gap. The filled faces come last, with a 1 unit stroke in their own
            tone that covers the anti-aliased seam against the neighbour
            without moving the boundary between two tones. */}
        {polygons.map((p, i) => (
          <polygon key={i} points={p.points} fill="none" stroke={line} strokeWidth={1} />
        ))}
        {groups.map((faces, hexIndex) => {
          const filled = faces.filter((p) => p.filled);
          if (filled.length === 0) return null;
          return (
            <g key={hexIndex} className={groupClass(hexIndex, true)} style={groupStyle(filled[0], hexIndex)}>
              {filled.map((p) => (
                <polygon
                  key={p.tone}
                  points={p.points}
                  fill={tones[p.tone]}
                  stroke={tones[p.tone]}
                  strokeWidth={1}
                />
              ))}
            </g>
          );
        })}
      </svg>
    );
  },
);
TileField.displayName = "TileField";
