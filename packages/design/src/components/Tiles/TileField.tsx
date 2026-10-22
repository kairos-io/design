import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { motion } from "../../tokens/index.ts";
import type { PaletteProp } from "./shared.ts";
import {
  tileDelaySpan,
  tileEnterDelay,
  tileFaceMotion,
  tileField,
  tileFades,
  tileFaceOrder,
  tileFaceStroke,
  tileFoldDelay,
  tileGridPaths,
  tilePalettes,
  tileWaveAxis,
  tileWavePhase,
  type TileBias,
  type TileFade,
  type TilePalette,
  type TilePolygon,
  type TileTone,
} from "../../lib/tiles.ts";

export type { TileBias, TileFade, TilePalette, TileTone };

// The stagger: the dense edge moves first (last, when folding), the sparse
// edge ENTER_SPAN ms later plus the library's jitter. The drop takes the
// slow duration token; the other entrances take it stretched by
// ENTER_SCALE, the same factor --tile-enter-duration applies in base.css.
// Where an entrance moves the faces one by one they start FACE_STEP ms
// apart in tone order, so the cube visibly assembles or unfolds rather than
// appears. Every LIVE_EVERY-th cube breathes. The wave crosses the field in
// the first WAVE_SWEEP of its period (--tile-wave-period in base.css, the
// slow token times a multiplier): a cube's delay is its phase along the fade
// axis times that share, the keyframes take the next tenth, and the rest of
// the period is the gap before the band comes round again.
const ENTER_SPAN = 700;
const SLOW = parseFloat(motion.duration.slow);
const ENTER_SCALE = 1.5;
const FACE_STEP = 40;
const LIVE_EVERY = 5;
const WAVE_SWEEP = 0.65;

// The family of entrances: the class each puts on, entering and leaving,
// whether it moves whole cubes or single faces, and how long one cube takes.
// The keyframes are in base.css next to the tile comments.
const ENTRANCES = {
  drop: { enter: "tile-in", exit: "tile-out", perFace: false, duration: SLOW },
  fall: { enter: "tile-fall", exit: "tile-fall-out", perFace: false, duration: SLOW * ENTER_SCALE },
  assemble: { enter: "tile-assemble", exit: "tile-disassemble", perFace: true, duration: SLOW * ENTER_SCALE },
  unfold: { enter: "tile-unfold", exit: "tile-fold", perFace: true, duration: SLOW * ENTER_SCALE },
} as const;

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
   * The entrance, once, on mount and whenever the field changes: the cubes
   * arrive dense edge first and land exactly on their outlines. "drop": a
   * fade with a short drop. "fall": each cube falls from a hexagon height
   * above under gravity and settles. "assemble": each cube's three faces
   * arrive from their own directions and snap together at the centre
   * vertex. "unfold": the faces hinge open from that vertex onto their
   * outlines; it is the system's motion, the one a field with an `idle`
   * mode and no `enter` uses, and the others are alternatives. Nothing by
   * default: a field with no entrance is simply there. The resting field is
   * the static one either way, and under prefers-reduced-motion the field
   * is simply there.
   */
  enter?: TileEnter;
  /**
   * What the field does once it has entered (or straight away, with no
   * entrance). "live": every fifth cube breathes on a long uneven cycle.
   * "cursor": the cubes near the pointer light up as it moves over the
   * field's parent (or `target`): an empty cell gains a faint fill of its
   * tone, a filled cube brightens, both falling off with distance and
   * easing back over the slow duration once the pointer leaves; only on a
   * device with a fine hovering pointer, and a proposal on top of the deck.
   * "wave": one slow band rolls across the whole field every few seconds,
   * from the dense edge to the sparse one along the fade (right to left on
   * the default hero, outward from a centred field), each cube lifting a
   * pixel and dimming for a moment as it passes, then a gap; for a screen
   * that is working, a build or an install in progress, where "live" is for
   * one merely left open. Opacity and a 1.5px translate, never a scale, and
   * a proposal on top of the deck. All three leave the resting field exactly
   * the static one and stop under prefers-reduced-motion.
   */
  idle?: TileIdle;
  /**
   * Take the filled cubes away. The field is controlled: flipping this to
   * true runs the chosen entrance in reverse (a drop falls out, a fall
   * falls through, an assembled cube pulls apart, an unfolded one folds),
   * sparse edge first and the dense edge last, and leaves the outline grid
   * standing; flipping it back runs the entrance again. A field that mounts
   * folded shows the grid alone, and with no entrance, or under
   * prefers-reduced-motion, the cubes appear and disappear with no motion.
   */
  folded?: boolean;
  /**
   * In cursor mode, the element whose pointer the field follows: the
   * field's positioned parent by default. Pass the hero or card itself when
   * that parent is a pointer-events-none wrapper or sits under the copy.
   */
  target?: React.RefObject<HTMLElement | null>;
  /**
   * @deprecated Use `enter` and `idle`: `"in"` is `enter="drop"`, `"live"`
   * is `enter="drop" idle="live"`, `"cursor"` is `enter="drop" idle="cursor"`.
   * The shorthand keeps the drop so existing callers do not change, where
   * `idle` on its own enters with the unfold. An explicit `enter` or `idle`
   * wins over this. To be removed before 1.0.
   */
  animate?: "in" | "live" | "cursor" | false;
}

/** How a field enters, and leaves when folded: see `TileFieldProps.enter`. */
export type TileEnter = keyof typeof ENTRANCES | false;

/**
 * What a field does at rest: see `TileFieldProps.idle`. Another idle mode
 * hooks in beside "live" and "wave" in `cubeMotion` below and next to their
 * blocks in base.css; it runs only once the entrance has landed.
 */
export type TileIdle = "live" | "cursor" | "wave" | false;

/**
 * Where the field is in its motion: the entrance, the exit on the way to
 * `folded`, and the two resting states that carry no motion classes at all,
 * so the DOM is the static field (or its grid alone).
 */
type TilePhase = "enter" | "exit" | "rest" | "folded";

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
      enter: enterProp,
      idle: idleProp,
      folded = false,
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
    // The grid as unique lattice edges, batched by opacity: every shared
    // edge drawn once, so no alpha compounds and no vertex knots.
    const grid = React.useMemo(() => tileGridPaths(polygons), [polygons]);
    const svgRef = React.useRef<SVGSVGElement>(null);
    React.useImperativeHandle(ref, () => svgRef.current as SVGSVGElement, []);

    // The deprecated shorthand maps onto the two new props; an explicit
    // prop wins so a caller can migrate one at a time. An idle mode with no
    // entrance named enters with the system's motion, the unfold.
    const enter: TileEnter = enterProp ?? (animate ? "drop" : idleProp ? "unfold" : false);
    const idle: TileIdle = idleProp ?? (animate === "live" || animate === "cursor" ? animate : false);

    // The drop and the fall run per hexagon, not per rhombus: while an
    // element animates the browser rasterises it on its own layer, and the
    // anti-aliased edges of its neighbours stop overlapping, which shows
    // what is beneath through hairline seams. Grouping the three faces
    // removes the seams inside a cube, the full grid underneath means a seam
    // shows a hairline rather than the page, no entrance scales a face
    // beyond its cell, and once the last cube has landed the classes come
    // off so everything paints as the static field. The assemble and the
    // unfold have to run per face, since each face moves on its own; a seam
    // inside a cube shows the cell's hairline for the moment it takes.
    // "live" then breathes a few whole cubes, each over its own outlined cell.
    //
    // One phase at a time: the entrance on mount, whenever the field
    // changes and when `folded` flips off; its reverse when `folded` flips
    // on; each ending in a resting phase on a timer sized from the stagger
    // and the duration tokens. With no entrance chosen, or under
    // prefers-reduced-motion, the resting phase comes straight away, so no
    // motion class is ever attached and the static result is the whole
    // story; the CSS turns the animations off as well for markup rendered
    // before this effect runs.
    //
    // The preference is read in the same effect and kept, so that the wave,
    // which would otherwise run for as long as the field rests, is never
    // attached at all under reduced motion; "live" leaves that to the CSS,
    // which pins both off as well.
    const [phase, setPhase] = React.useState<TilePhase>(() => (folded ? "folded" : enter ? "enter" : "rest"));
    const [reduced, setReduced] = React.useState(false);
    const wasFolded = React.useRef(folded);
    React.useEffect(() => {
      const toggled = wasFolded.current !== folded;
      wasFolded.current = folded;
      const still = prefersReducedMotion();
      setReduced(still);
      const resting: TilePhase = folded ? "folded" : "rest";
      const moving: TilePhase | false = !enter || still ? false : folded ? toggled && "exit" : "enter";
      setPhase(moving || resting);
      if (!moving) return;
      const { perFace, duration } = ENTRANCES[enter as keyof typeof ENTRANCES];
      const span = tileDelaySpan(ENTER_SPAN) + (perFace ? 2 * FACE_STEP : 0) + duration;
      const timer = window.setTimeout(() => setPhase(resting), span);
      return () => window.clearTimeout(timer);
    }, [folded, enter, seed, fade, radius, width, height, solid, palette]);

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
      if (idle !== "cursor" || !svg || !host) return;
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
    }, [idle, target, groups, width, height, radius, preserveAspectRatio]);

    // The motion in flight, if any: the entrance's classes while entering,
    // its reverse while leaving, with the stagger reversed too so the sparse
    // edge goes first and the dense edge last. The fall height rides along
    // so the keyframes scale with the radius.
    const flight =
      enter && (phase === "enter" || phase === "exit")
        ? { ...ENTRANCES[enter], className: ENTRANCES[enter][phase], entering: phase === "enter" }
        : null;
    const flightDelay = (p: TilePolygon, hexIndex: number) =>
      flight?.entering ? tileEnterDelay(p, hexIndex, ENTER_SPAN) : tileFoldDelay(p, hexIndex, ENTER_SPAN);
    const fall = `${2 * radius}px`;

    // The wave's axis for this fade, and a cube's row from its centre: the
    // generator lays rows 1.5 radii apart, so v times the height is a whole
    // number of them (to the rounding of v).
    const waveAxis = React.useMemo(() => tileWaveAxis(fade), [fade]);
    const waveRow = (p: TilePolygon) => Math.round((p.v * height) / (1.5 * radius));

    // The class and the inline delay a whole cube carries in this phase: a
    // cube-wise entrance or exit in flight, the breathing or the wave at
    // rest. Nothing otherwise, so a cube at rest is a bare <g>. Another idle
    // mode hooks in here. The wave's delay is written as a share of the
    // period the CSS defines, so no duration is ever a literal here.
    const cubeMotion = (first: TilePolygon, hexIndex: number): React.SVGAttributes<SVGGElement> => {
      if (flight && !flight.perFace) {
        return {
          className: flight.className,
          style: {
            "--tile-delay": `${flightDelay(first, hexIndex)}ms`,
            "--tile-fall": fall,
          } as React.CSSProperties,
        };
      }
      if (phase === "rest" && idle === "live" && hexIndex % LIVE_EVERY === 0) {
        return {
          className: "tile-live",
          style: {
            "--tile-live-delay": `${(hexIndex * 613) % 9000}ms`,
            "--tile-live-duration": `${6000 + ((hexIndex * 271) % 5000)}ms`,
          } as React.CSSProperties,
        };
      }
      if (phase === "rest" && idle === "wave" && !reduced) {
        const share = Math.round(tileWavePhase(first, waveAxis, waveRow(first)) * WAVE_SWEEP * 1000) / 1000;
        return {
          className: "tile-wave",
          style: { "--tile-wave-delay": `calc(var(--tile-wave-period) * ${share})` } as React.CSSProperties,
        };
      }
      return {};
    };
    // The class, the geometry and the delay one face carries while a
    // face-wise entrance or exit is in flight: the cube's turn in the
    // stagger, then the faces in tone order (top, left, right) arriving and
    // the reverse leaving, so the last face to arrive is the first to go.
    // Nothing in any other phase.
    const faceMotion = (p: TilePolygon, hexIndex: number): React.SVGAttributes<SVGPolygonElement> => {
      if (!flight || !flight.perFace) return {};
      const step = flight.entering ? p.tone : 2 - p.tone;
      const geometry = tileFaceMotion[p.tone];
      const style: Record<string, string | number> = {
        "--tile-delay": `${flightDelay(p, hexIndex) + step * FACE_STEP}ms`,
        "--tile-fall": fall,
      };
      if (enter === "unfold") {
        style["--tile-face"] = `${geometry.angle}deg`;
        style.transformOrigin = geometry.origin;
      } else {
        style["--tile-dx"] = geometry.from[0];
        style["--tile-dy"] = geometry.from[1];
      }
      return { className: flight.className, style: style as React.CSSProperties };
    };

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
        focusable="false"
        data-enter={enter || undefined}
        data-idle={idle || undefined}
        data-folded={folded ? "" : undefined}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
        {...props}
      >
        {/* The whole grid first, as unique lattice edges: every edge drawn
            exactly once, whether its cells will be filled or not, so no cube
            is ever painted over by a neighbour's hairline, a cube that has not
            landed yet sits on its outline, never on a gap, and an edge two
            cells share is one line at one strength rather than two copies
            compounding. Each edge takes the stronger of its two cells' bias
            weights relative to the densest cell (p.outline, from the
            library), so the hairlines thin out at the same rate as the fills
            and the sparse edge of the field dissolves instead of stopping in
            a hard line; the edges of a filled face are always full, for the
            cube to land on. Round caps and joins close the corners and
            cannot overshoot at hairline width. */}
        {grid.map((g) => (
          <path
            key={g.opacity}
            d={g.d}
            fill="none"
            stroke={line}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={g.opacity < 1 ? g.opacity : undefined}
          />
        ))}
        {/* A folded field is its grid alone: the faces are not drawn at all,
            so a cube can only be where its outline is. The key carries the
            phase, so a change of phase remounts the cubes: a fresh element
            starts its animation from the first frame, and a landed one is
            the static markup to the byte, with no emptied style attribute
            left over from the delay it carried. The reduced-motion flag is
            in the key for the same reason: a wave attached on the first
            render comes off whole once the preference is read. */}
        {phase !== "folded" &&
          groups.map((faces, hexIndex) => {
            const filled = faces.filter((p) => p.filled);
            if (filled.length === 0) return null;
            return (
              <g key={`${hexIndex}:${phase}:${reduced}`} {...cubeMotion(filled[0], hexIndex)}>
                {tileFaceOrder
                  .flatMap((tone) => filled.filter((p) => p.tone === tone))
                  .map((p) => (
                    <polygon
                      key={p.tone}
                      points={p.points}
                      fill={tones[p.tone]}
                      stroke={tones[p.tone]}
                      strokeWidth={tileFaceStroke.width}
                      strokeLinejoin={tileFaceStroke.join}
                      paintOrder={tileFaceStroke.order}
                      {...faceMotion(p, hexIndex)}
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
            the field looks exactly as it does without the mode. A folded
            field has no filled cubes to brighten, so every cell lights in
            its own tone. */}
        {idle === "cursor" &&
          groups.map((faces, hexIndex) => (
            <g key={hexIndex} className="tile-glow">
              {faces.map((p) => {
                const filled = p.filled && !folded;
                return (
                  <polygon
                    key={p.tone}
                    points={p.points}
                    fill={filled ? "var(--white)" : tones[p.tone]}
                    stroke={filled ? "var(--white)" : tones[p.tone]}
                    strokeWidth={tileFaceStroke.width}
                    strokeLinejoin={tileFaceStroke.join}
                    paintOrder={tileFaceStroke.order}
                    opacity={filled ? HIGHLIGHT : p.outline < 1 ? p.outline : undefined}
                  />
                );
              })}
            </g>
          ))}
      </svg>
    );
  },
);
TileField.displayName = "TileField";

/** Whether the person has asked for reduced motion; a browser without matchMedia (jsdom, a server) has not. */
function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

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
