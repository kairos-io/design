import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { tileBackground, type TileCube } from "../../lib/tileBackground.ts";
import { tileFaceOrder, tileFaceStroke, tilePalettes, type TileBias } from "../../lib/tiles.ts";
import { useCursorField, type CursorPainter, type ViewBoxPoint } from "../../hooks/useCursorField.ts";
import type { PaletteProp } from "./shared.ts";

// The cursor: the outlines light fully under the pointer and fade to nothing
// LIT_REACH hexagon radii away, in LIT_STEPS steps so a small drift of the
// pointer does not rewrite every cube. The wake's fill reaches FILL_REACH
// radii, so it is the cube under the pointer and a hint of its neighbours.
// A ripple sets out from the press and dies away RIPPLE_REACH of the
// viewBox's half-diagonal out; its front takes --tile-bg-ripple-span (base.css,
// from the slow token) to get there, each cube's delay its share of that.
const LIT_REACH = 4;
const FILL_REACH = 2;
const LIT_STEPS = 20;
const RIPPLE_REACH = 1;

/** How the plane answers the pointer: see `TileBackgroundProps.cursor`. */
export type TileBackgroundCursor = "lines" | "fill" | "ripple" | false;

export interface TileBackgroundProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height" | "target" | "cursor">, PaletteProp {
  /** Hexagon radius in viewBox units; 48 reads as a quiet texture across a page. */
  radius?: number;
  /** Which cells sit a touch fainter. Same seed, same plane. */
  seed?: number;
  /** viewBox size; the SVG fills its container and crops (slice). A viewport by default. */
  width?: number;
  height?: number;
  /** Colour of the outlines: the border token by default, so the plane is quiet under copy. */
  line?: string;
  /**
   * How the outlines fall off toward the edges, so the grid never ends in
   * a hard line: a number 0..1 is how much the corners lose against the
   * centre (0.6 by default), a function is a custom bias over (u, v), and
   * false keeps the grid flat.
   */
  vignette?: number | TileBias | false;
  /** Step the outlines by row, the lower rows nearer, so the cubes read as stacked. */
  depth?: boolean;
  /**
   * What the plane does under the pointer, a proposal on top of the deck
   * and off by default. "lines": the outlines near the pointer brighten in
   * the highlight colour, falling off with distance and easing back over the
   * slow duration once it leaves. "fill": the same, and the cube under the
   * pointer takes a faint fill of its three tones that trails behind the
   * pointer like a wake. "ripple": quiet until a press, then one ring of
   * brightness runs out across the outlines from that point and dies away.
   * All opacity only, on layers that share the grid's points and rest at
   * zero, so the resting plane is the static one; only on a device that can
   * hover with a fine pointer and never under prefers-reduced-motion.
   */
  cursor?: TileBackgroundCursor;
  /** The colour the lit outlines take: the accent (default) or the ink. */
  highlight?: "accent" | "ink";
  /**
   * The element whose pointer the plane follows: its positioned parent by
   * default. Pass the section itself when that parent is a wrapper the
   * pointer never reaches.
   */
  target?: React.RefObject<HTMLElement | null>;
}

/**
 * A full-bleed wireframe of Kairos cubes that fills its positioned parent:
 * the tile field's hexagons with no filled faces, every cell drawn as the
 * three-rhombus outline so the whole plane reads as cubes stacked edge to
 * edge. Quiet enough to sit under copy, with a soft vignette so it never
 * ends in a line, and, opt-in, outlines that follow the cursor.
 */
export const TileBackground = React.forwardRef<SVGSVGElement, TileBackgroundProps>(
  (
    {
      radius = 48,
      seed = 5,
      width = 1440,
      height = 900,
      line = "var(--line)",
      vignette = 0.6,
      depth = false,
      cursor = false,
      highlight = "accent",
      palette = "kairos",
      target,
      preserveAspectRatio = "xMidYMid slice",
      className,
      ...props
    },
    ref,
  ) => {
    const tones = tilePalettes[palette];
    const cubes = React.useMemo(
      () => tileBackground({ width, height, radius, seed, vignette, depth }),
      [width, height, radius, seed, vignette, depth],
    );
    const svgRef = React.useRef<SVGSVGElement>(null);
    React.useImperativeHandle(ref, () => svgRef.current as SVGSVGElement, []);

    // The painter the hook calls from its one frame per move: it measures
    // every cube's distance from the pointer and writes --tile-lit (and
    // --tile-fill for the wake) on the groups whose intensity changed,
    // nothing else; the CSS transitions on the groups' opacity do the
    // easing. A press in ripple mode writes each cube's delay and amplitude
    // and restarts the ring's animation class on all of them at once, one
    // style flush between taking the class off and putting it back so a
    // ring still running starts over; the animationend takes it off again,
    // so the resting markup carries no motion class.
    const setup = React.useCallback(
      (svg: SVGSVGElement): CursorPainter | null => {
        if (!cursor) return null;
        const glows = Array.from(
          svg.querySelectorAll<SVGGElement>(":scope > g.tile-bg-lit, :scope > g.tile-bg-ring"),
        );
        const wakes = Array.from(svg.querySelectorAll<SVGGElement>(":scope > g.tile-bg-wake"));
        const cells = cubes.map((cube, i) => ({
          x: cube.x,
          y: cube.y,
          glow: glows[i],
          wake: wakes[i] as SVGGElement | undefined,
          lit: 0,
          fill: 0,
          rippling: false,
        }));
        const litReach = radius * LIT_REACH;
        const fillReach = radius * FILL_REACH;
        const rippleReach = (Math.hypot(width, height) / 2) * RIPPLE_REACH;
        const onEnd = (event: Event) => {
          const el = event.target as Element;
          if (el.classList?.contains("tile-bg-ripple")) el.classList.remove("tile-bg-ripple");
        };
        svg.addEventListener("animationend", onEnd);
        const clear = () => {
          svg.removeEventListener("animationend", onEnd);
          for (const cell of cells) {
            cell.glow.classList.remove("tile-bg-ripple");
            cell.glow.removeAttribute("style");
            cell.wake?.removeAttribute("style");
            cell.wake?.removeAttribute("data-lit");
          }
        };
        if (cursor === "ripple") {
          return {
            paint: () => {},
            press: (point: ViewBoxPoint) => {
              for (const cell of cells) {
                const share = Math.hypot(cell.x - point.x, cell.y - point.y) / rippleReach;
                cell.glow.classList.remove("tile-bg-ripple");
                cell.rippling = share <= 1;
                if (!cell.rippling) {
                  cell.glow.removeAttribute("style");
                  continue;
                }
                cell.glow.style.setProperty("--tile-ripple", String(quantise(1 - share)));
                cell.glow.style.setProperty(
                  "--tile-delay",
                  `calc(var(--tile-bg-ripple-span) * ${Math.round(share * 1000) / 1000})`,
                );
              }
              svg.getBoundingClientRect();
              for (const cell of cells) if (cell.rippling) cell.glow.classList.add("tile-bg-ripple");
            },
            clear,
          };
        }
        return {
          paint: (pointer: ViewBoxPoint | null) => {
            for (const cell of cells) {
              const distance = pointer ? Math.hypot(cell.x - pointer.x, cell.y - pointer.y) : Infinity;
              const lit = litAt(distance, litReach);
              if (lit !== cell.lit) {
                cell.lit = lit;
                if (lit === 0) cell.glow.style.removeProperty("--tile-lit");
                else cell.glow.style.setProperty("--tile-lit", String(lit));
              }
              if (!cell.wake) continue;
              const fill = litAt(distance, fillReach);
              if (fill === cell.fill) continue;
              // The wake rises quickly and trails slowly: the data attribute
              // picks the transition's duration for the direction it is going.
              if (fill > 0 !== cell.fill > 0) {
                if (fill > 0) cell.wake.setAttribute("data-lit", "");
                else cell.wake.removeAttribute("data-lit");
              }
              cell.fill = fill;
              if (fill === 0) cell.wake.style.removeProperty("--tile-fill");
              else cell.wake.style.setProperty("--tile-fill", String(fill));
            }
          },
          clear,
        };
      },
      [cubes, cursor, radius, width, height],
    );
    useCursorField({
      svg: svgRef,
      target,
      enabled: cursor !== false,
      width,
      height,
      fit: preserveAspectRatio,
      setup,
    });

    const highlightColor = highlight === "ink" ? "var(--ink)" : "var(--accent)";
    const outlines = (cube: TileCube) => cube.faces.map((p) => <polygon key={p.tone} points={p.points} />);

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
        focusable="false"
        data-cursor={cursor || undefined}
        data-depth={depth ? "" : undefined}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
        {...props}
      >
        {/* The plane: every cube as its three rhombi, one hairline each on the
            same points the filled field would use, so the whole grid is
            complete and nothing is ever filled at rest. Each cube's outline
            carries its opacity from the vignette, the depth step and the
            grain; a full-strength one omits the attribute. */}
        {cubes.map((cube) => (
          <g
            key={cube.hex}
            fill="none"
            stroke={line}
            strokeWidth={1}
            strokeOpacity={cube.outline < 1 ? cube.outline : undefined}
          >
            {outlines(cube)}
          </g>
        ))}
        {/* The wake, under the lit lines: each cube's three faces filled in
            their tones, resting at opacity 0 and raised by --tile-fill. The
            faces take the face stroke (thin, bevelled, under the fill) in
            the order the field draws them, sides first and the top last. */}
        {cursor === "fill" &&
          cubes.map((cube) => (
            <g
              key={cube.hex}
              className="tile-bg-wake"
              strokeWidth={tileFaceStroke.width}
              strokeLinejoin={tileFaceStroke.join}
              paintOrder={tileFaceStroke.order}
            >
              {tileFaceOrder.map((tone) => {
                const p = cube.faces[tone];
                return <polygon key={tone} points={p.points} fill={tones[tone]} stroke={tones[tone]} />;
              })}
            </g>
          ))}
        {/* The light: the same outlines again in the highlight colour, at
            full strength, resting at opacity 0 so the resting plane paints
            exactly as the static one. --tile-lit raises a cube's group as
            the pointer nears; in ripple mode the group is a ring cell the
            press animates once. */}
        {cursor &&
          cubes.map((cube) => (
            <g
              key={cube.hex}
              className={cursor === "ripple" ? "tile-bg-ring" : "tile-bg-lit"}
              fill="none"
              stroke={highlightColor}
              strokeWidth={1}
            >
              {outlines(cube)}
            </g>
          ))}
      </svg>
    );
  },
);
TileBackground.displayName = "TileBackground";

/** How lit a cube `distance` viewBox units from the pointer is: 1 under it, 0 at `reach`, smooth between. */
function litAt(distance: number, reach: number): number {
  return quantise(Math.max(0, 1 - distance / reach));
}

/** A smoothstep over 0..1 in LIT_STEPS steps, so a small drift of the pointer rewrites few cubes. */
function quantise(t: number): number {
  return Math.round(t * t * (3 - 2 * t) * LIT_STEPS) / LIT_STEPS;
}
