import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { parsePoints } from "../../lib/mark.ts";
import { useMergedRef } from "../../hooks/useMergedRef.ts";
import {
  tileFaceOrder,
  tileFaceStroke,
  tileGridPaths,
  tileHexagon,
  tilePalettes,
  type TileTone,
} from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";
import {
  LOOP_FACE_STEP,
  REACH,
  RESOLVE_CLASS,
  STATUS_LABEL,
  STROKE,
  cycleClass,
  faceVars,
  framePad,
  gateClass,
  useReducedMotion,
  useSettle,
  type TileExit,
  type TileLoop,
  type TileStatus,
} from "./loop.ts";

// The mono rendition paints the three faces in currentColor at three
// strengths in tone order, lightest on top like the palettes, so the cube
// keeps its three tones on any fill. The outline beneath is the same colour,
// fainter. These are fill and stroke opacities, not the element's opacity,
// which the loop animates.
const MONO_FACE: Record<TileTone, number> = { 0: 0.45, 1: 0.7, 2: 1 };
const MONO_LINE = 0.3;

// Each face's corner at the cube's centre, by tone, from the point order of
// tileHexagon: the top face [p5, p0, p1, c], the left [p5, c, p3, p4], the
// right [c, p1, p2, p3].
const CENTRE_INDEX: Record<TileTone, number> = { 0: 3, 1: 1, 2: 0 };

// The faces start an eighth of a loop apart in tone order, so a whole cube
// comes in over one entrance plus two steps. The status faces stagger in
// the same order.
const FACE_DELAYS = [0, 1, 2].map((tone) => Math.round(tone * LOOP_FACE_STEP));
const FACE_KEYS = ["0", "1", "2"];

export interface TileLoaderProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height">, PaletteProp {
  /** Height of the cube in px, the icon sizes: 16, 20 (default) or 24. */
  size?: 16 | 20 | 24;
  /**
   * The motion that loops: the three faces come into place one at a time in
   * tone order, rest as a complete cube, leave the same way and come again,
   * with the last face still leaving as the first returns, so a face is
   * always showing over the outline. "unfold" (default, the system's
   * motion): each face hinges open from the cube's centre vertex along its
   * own two edges. "assemble", the alternative: each face arrives along its
   * own line and the three meet at that vertex. The same motion as the
   * field's entrances, laid end to end.
   */
  enter?: TileLoop;
  /**
   * How the cube leaves between cycles. "disassemble" (default): the faces
   * leave the way they came, the last still leaving as the first returns.
   * "vanish": the cube rests one entrance complete, then is gone in one
   * frame, no motion and no fade, the outline still there, and comes in
   * again after one entrance. Under prefers-reduced-motion both are the
   * static cube.
   */
  exit?: TileExit;
  /**
   * "palette" (default) paints the brand tones. "mono" paints the three
   * faces in currentColor at three strengths, for an accent button or any
   * fill the oranges would not read on.
   */
  tone?: "palette" | "mono";
  /**
   * "loading" (default) loops. "success" stops the loop in the same frame:
   * a face already on its outline crossfades to the success greens over
   * the fast token, a face on its way or away completes to its outline
   * from wherever it is over the base token (a transition, nothing jumps
   * back) and turns green as it lands, the three a step apart in tone
   * order, so the cube is green and still within about a third of a
   * second; "error" the same in the recovery reds. `onSettled` fires once
   * the last face has turned. Under prefers-reduced-motion the cube simply
   * turns. Back to "loading" and the loop starts again from empty.
   */
  status?: TileStatus;
  /** Called once, when a "success" or "error" has landed and the loader is at rest. */
  onSettled?: (status: TileStatus) => void;
  /** Hide the loader from assistive technology, when the control it sits in is already `aria-busy`. */
  decorative?: boolean;
  /** The accessible name while loading; "Loading" by default. A landed loader is "Done" or "Failed", announced politely. */
  "aria-label"?: string;
}

/**
 * The inline loader: one cube whose faces come into place, rest, and leave
 * again, over an outline that never goes, so the cell is never blank. For
 * buttons, chips and table rows; icon-sized. Under prefers-reduced-motion it
 * is the static complete cube. A proposal on top of the deck.
 */
export const TileLoader = React.forwardRef<SVGSVGElement, TileLoaderProps>(
  (
    {
      size = 20,
      enter = "unfold",
      exit = "disassemble",
      tone = "palette",
      palette = "kairos",
      status = "loading",
      onSettled,
      decorative = false,
      "aria-label": label = "Loading",
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const reduced = useReducedMotion();
    const root = React.useRef<SVGSVGElement | null>(null);
    const setRefs = useMergedRef(root, ref);
    // The viewBox is in px, so the 1 unit strokes are 1px hairlines; `size`
    // is the cube's height. The box is padded by the stroke's mitre plus the
    // reach a face assembles from, so nothing is ever clipped, and the
    // padding is taken back as margin so the loader's footprint in a line
    // or a button is the cube itself; what paints outside it, while a face
    // is on its way, is overflow.
    const r = size / 2;
    const w = round(Math.sqrt(3) * r);
    const reach = round(REACH * r);
    const pad = framePad(reach);
    const faces = React.useMemo(() => tileHexagon(w / 2, r, r), [w, r]);
    const grid = React.useMemo(() => tileGridPaths(faces), [faces]);
    const mono = tone === "mono";
    const tones = tilePalettes[palette];
    const paint = (face: TileTone) => (mono ? "currentColor" : tones[face]);

    // The status: the loop stops in the same frame and the faces resolve
    // to their outlines, then the status faces fade in over them.
    const settle = useSettle({ status, reduced, root, keys: FACE_KEYS, onSettled });
    const looping = status === "loading" || settle.phase === "looping";
    const landing = settle.phase === "landing";
    const landed = status !== "loading" && settle.phase !== "looping";
    const vanish = exit === "vanish";

    // The cycle's class and inline values on a face, with the geometry its
    // keyframes read from the face's own points. Nothing under reduced
    // motion: the faces are simply there.
    const motion = (p: (typeof faces)[number]) => ({
      className: cycleClass("loop", enter, exit),
      style: {
        "--tile-delay": `${FACE_DELAYS[p.tone]}ms`,
        ...faceVars(enter, parsePoints(p.points), CENTRE_INDEX[p.tone], reach),
      } as React.CSSProperties,
    });
    const face = (p: (typeof faces)[number], fill: string, strength?: number) => (
      <polygon
        key={p.tone}
        data-tone={p.tone}
        points={p.points}
        fill={fill}
        stroke={fill}
        strokeWidth={tileFaceStroke.width}
        strokeLinejoin={tileFaceStroke.join}
        paintOrder={tileFaceStroke.order}
        fillOpacity={strength}
        strokeOpacity={strength}
      />
    );
    const name = status === "loading" ? label : STATUS_LABEL[status];

    return (
      <>
        <svg
          ref={setRefs}
          viewBox={`${-pad} ${-pad} ${w + 2 * pad} ${size + 2 * pad}`}
          width={w + 2 * pad}
          height={size + 2 * pad}
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : name}
          aria-hidden={decorative ? "true" : undefined}
          focusable="false"
          data-enter={enter}
          data-exit={exit}
          data-tone={tone}
          data-status={status}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          className={cn("tile-loader shrink-0 overflow-visible", className)}
          style={{ margin: -pad, ...style }}
          {...props}
        >
          {/* The outline first: the hexagon's nine lattice edges, each once, on
              the very points the faces take, so a face that has not landed sits
              on its cell and never on nothing, and nothing paints over a landed
              face. Round caps close the corners at hairline width. */}
          {grid.map((g) => (
            <path
              key={g.opacity}
              d={g.d}
              fill="none"
              stroke={mono ? "currentColor" : "var(--line)"}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={mono ? MONO_LINE : undefined}
            />
          ))}
          {/* The cube: its faces on the same point strings, sides first and top
              last, each with the face stroke: a thin bevelled stroke in its own
              fill under the fill, which covers the anti-aliased seam against
              its neighbour while it moves on its own layer, with no pin at a
              corner and no overshoot onto the outline. Mono faces carry their
              strength as fill and stroke opacity, so the cycle's opacity is
              free. The group is the vanish exit's gate. While a status lands,
              the faces carry the resolve instead of the loop. */}
          <g
            data-cube="0"
            {...(vanish ? { "data-gate": "" } : {})}
            {...(vanish && looping && !reduced
              ? { className: gateClass("loop"), style: { "--tile-delay": "0ms" } as React.CSSProperties }
              : vanish && landing
                ? { className: RESOLVE_CLASS }
                : {})}
          >
            {tileFaceOrder
              .map((t) => faces[t])
              .map((p) =>
                React.cloneElement(face(p, paint(p.tone), mono ? MONO_FACE[p.tone] : undefined), {
                  "data-face": FACE_KEYS[p.tone],
                  ...(looping && !reduced ? motion(p) : landing ? { className: RESOLVE_CLASS } : {}),
                }),
              )}
          </g>
          {/* The status faces, over the brand ones: each fades in once its
              brand face is on the outline, in tone order, and stays. */}
          {landed &&
            tileFaceOrder
              .map((t) => faces[t])
              .map((p) =>
                React.cloneElement(face(p, tilePalettes[status as "success" | "error"][p.tone]), {
                  "data-status-face": "",
                  ...(landing
                    ? {
                        className: "tile-settle",
                        style: { "--tile-delay": `${settle.delays[p.tone]}ms` } as React.CSSProperties,
                      }
                    : {}),
                }),
              )}
        </svg>
        {!decorative && (
          <span role="status" className="sr-only">
            {name}
          </span>
        )}
      </>
    );
  },
);
TileLoader.displayName = "TileLoader";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
