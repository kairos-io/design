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

// The cursor: a cube lights fully under the pointer and fades to nothing
// CURSOR_REACH hexagon radii away, in LIT_STEPS steps so a small drift of
// the pointer does not rewrite every cube. A lit filled cube takes a white
// highlight at HIGHLIGHT of the glow's strength; an empty cell takes its
// own tone at full strength, scaled by its outline so the lit field
// dissolves where the grid does.
const CURSOR_REACH = 3.4;
const LIT_STEPS = 20;
const HIGHLIGHT = 0.6;
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface TileFieldProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height" | "target">, PaletteProp {
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
  /**
   * Colour of the unfilled outlines; the border token by default, the sidebar
   * hairline on navy. Each outline's opacity follows its cell's bias weight,
   * so the grid dissolves with the fills at the sparse edge.
   */
  line?: string;
  /**
   * Motion. "in": filled tiles drop into place once, dense edge first.
   * "live": a few tiles keep breathing after that. "cursor": the same
   * entrance, after which the cubes near the pointer light up as it moves
   * over the field's parent (or `target`): an empty cell gains a faint fill
   * of its tone, a filled cube brightens, both falling off with distance
   * and easing back over the slow duration once the pointer leaves. The
   * resting field is the static one. "in" and "live" are CSS only; "cursor"
   * listens for pointer events on the parent, only on a device with a fine
   * hovering pointer. All three stop under prefers-reduced-motion. "cursor"
   * is opt-in: a proposal on top of the deck, not part of it.
   */
  animate?: "in" | "live" | "cursor" | false;
  /**
   * In cursor mode, the element whose pointer the field follows: the
   * field's positioned parent by default. Pass the hero or card itself when
   * that parent is a pointer-events-none wrapper or sits under the copy.
   */
  target?: React.RefObject<HTMLElement | null>;
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
      line = "var(--line)",
      animate = false,
      target,
      preserveAspectRatio = "xMidYMid slice",
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
    const svgRef = React.useRef<SVGSVGElement>(null);
    React.useImperativeHandle(ref, () => svgRef.current as SVGSVGElement, []);

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

    // The cursor follows the pointer over the parent, never the SVG, which
    // stays inert. Each move books one animation frame; the frame maps the
    // pointer into viewBox units, measures every cube's distance from it and
    // writes --tile-lit on the glow groups whose intensity changed, nothing
    // else: no React state, no re-render, and the CSS transition on the
    // glow's opacity does the easing. The listeners only attach on a device
    // that can hover with a fine pointer and not under reduced motion; a
    // browser without matchMedia (jsdom, a server) gets the static field.
    React.useEffect(() => {
      const svg = svgRef.current;
      const host = target ? target.current : svg?.parentElement;
      if (animate !== "cursor" || !svg || !host) return;
      if (typeof window.matchMedia !== "function") return;
      const hover = window.matchMedia(HOVER_QUERY);
      const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
      const allowed = () => hover.matches && !reduced.matches;
      if (!allowed()) return;

      const glows = Array.from(svg.querySelectorAll<SVGGElement>(":scope > g.tile-glow"));
      const cells = groups.map((faces, i) => ({
        el: glows[i],
        x: faces[0].u * width,
        y: faces[0].v * height,
        lit: 0,
      }));
      const reach = radius * CURSOR_REACH;
      let frame = 0;
      let pointer: { x: number; y: number } | null = null;

      const paint = () => {
        frame = 0;
        for (const cell of cells) {
          const lit = pointer ? tileLit(Math.hypot(cell.x - pointer.x, cell.y - pointer.y), reach) : 0;
          if (lit === cell.lit) continue;
          cell.lit = lit;
          if (lit === 0) cell.el.style.removeProperty("--tile-lit");
          else cell.el.style.setProperty("--tile-lit", String(lit));
        }
      };
      const schedule = () => {
        if (!frame) frame = window.requestAnimationFrame(paint);
      };
      const onMove = (event: PointerEvent) => {
        // A finger on a hybrid device passes the media query but is not a cursor.
        if (event.pointerType === "touch") return;
        pointer = allowed()
          ? viewBoxPoint(svg, event.clientX, event.clientY, width, height, preserveAspectRatio)
          : null;
        schedule();
      };
      const onLeave = () => {
        pointer = null;
        schedule();
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      return () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        if (frame) window.cancelAnimationFrame(frame);
        for (const cell of cells) cell.el.style.removeProperty("--tile-lit");
      };
    }, [animate, target, groups, width, height, radius, preserveAspectRatio]);

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
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio={preserveAspectRatio}
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
            gap. Each outline is as opaque as its cell's bias weight relative
            to the densest cell (p.outline, from the library), so the hairlines
            thin out at the same rate as the fills and the sparse edge of the
            field dissolves instead of stopping in a hard line; a cell that
            holds a filled face keeps a full outline for the cube to land on.
            The filled faces come last, with a 1 unit stroke in their own
            tone that covers the anti-aliased seam against the neighbour
            without moving the boundary between two tones. */}
        {polygons.map((p, i) => (
          <polygon
            key={i}
            points={p.points}
            fill="none"
            stroke={line}
            strokeWidth={1}
            strokeOpacity={p.outline < 1 ? p.outline : undefined}
          />
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
        {/* Cursor mode adds a glow layer over everything, one group per
            hexagon in the same order as the groups above, on the very same
            points: an empty cell's faces in its own tone, a filled cell's in
            white, so that lighting a cube only ever raises this group's
            opacity (base.css) and never scales a face or moves it off its
            outline. At rest the layer is at opacity 0 and paints nothing, so
            the field looks exactly as it does without the mode. */}
        {animate === "cursor" &&
          groups.map((faces, hexIndex) => (
            <g key={hexIndex} className="tile-glow">
              {faces.map((p) => (
                <polygon
                  key={p.tone}
                  points={p.points}
                  fill={p.filled ? "var(--white)" : tones[p.tone]}
                  stroke={p.filled ? "var(--white)" : tones[p.tone]}
                  strokeWidth={1}
                  opacity={p.filled ? HIGHLIGHT : p.outline < 1 ? p.outline : undefined}
                />
              ))}
            </g>
          ))}
      </svg>
    );
  },
);
TileField.displayName = "TileField";

/** How lit a cube `distance` viewBox units from the pointer is: 1 under it, 0 at `reach`, smooth between. */
function tileLit(distance: number, reach: number): number {
  const t = Math.max(0, 1 - distance / reach);
  return Math.round(t * t * (3 - 2 * t) * LIT_STEPS) / LIT_STEPS;
}

/**
 * Where a client point falls in the SVG's viewBox, undoing the fit that
 * preserveAspectRatio applies ("xMidYMid slice" crops and centres, the hero's
 * "xMaxYMid slice" keeps the right edge). From the bounding box alone, so it
 * holds under a scaled ancestor like the slide frame and in jsdom.
 */
function viewBoxPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  fit: string,
): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const [align = "xMidYMid", mode = "meet"] = fit.trim().split(/\s+/);
  let scaleX = rect.width / width;
  let scaleY = rect.height / height;
  if (align !== "none") {
    const scale = mode === "slice" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    scaleX = scale;
    scaleY = scale;
  }
  const ax = align.startsWith("xMin") ? 0 : align.startsWith("xMax") ? 1 : 0.5;
  const ay = align.endsWith("YMin") ? 0 : align.endsWith("YMax") ? 1 : 0.5;
  return {
    x: (clientX - rect.left - (rect.width - width * scaleX) * ax) / scaleX,
    y: (clientY - rect.top - (rect.height - height * scaleY) * ay) / scaleY,
  };
}
