import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { parsePoints } from "../../lib/mark.ts";
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
  ENTER_DURATION,
  LOOP_FACE_STEP,
  REACH,
  STATUS_LABEL,
  STROKE,
  cycleClass,
  faceVars,
  framePad,
  useReducedMotion,
  useSettle,
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
// comes in over one entrance plus two steps.
const FACE_DELAYS = [0, 1, 2].map((tone) => ({ delay: Math.round(tone * LOOP_FACE_STEP) }));
const CUBE_LANDING = ENTER_DURATION + 2 * LOOP_FACE_STEP;

export interface TileLoaderProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height">, PaletteProp {
  /** Height of the cube in px, the icon sizes: 16, 20 (default) or 24. */
  size?: 16 | 20 | 24;
  /**
   * The motion that loops: the three faces come into place one at a time in
   * tone order, rest as a complete cube, leave the same way and come again,
   * with the last face still leaving as the first returns, so a face is
   * always showing over the outline. "assemble" (default): each face
   * arrives along its own line and the three meet at the centre vertex.
   * "unfold": each face hinges open from that vertex. The same motion as
   * the field's entrances, laid end to end; both are proposals, to compare.
   */
  enter?: TileLoop;
  /**
   * "palette" (default) paints the brand tones. "mono" paints the three
   * faces in currentColor at three strengths, for an accent button or any
   * fill the oranges would not read on.
   */
  tone?: "palette" | "mono";
  /**
   * "loading" (default) loops. "success" lets the loop reach its next quiet
   * moment, then the three faces come into place once more in the success
   * greens over the cube, opacity and transform only, and it rests as a
   * green cube; "error" the same in the recovery reds. `onSettled` fires
   * once the last face has landed. Under prefers-reduced-motion the cube
   * simply turns. Back to "loading" and the loop starts again.
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
      enter = "assemble",
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

    // The status: the loop runs until its next quiet moment, then the
    // status faces land over the brand ones and the loader rests.
    const settle = useSettle({
      status,
      reduced,
      faces: FACE_DELAYS,
      cycle: "loop",
      landing: CUBE_LANDING,
      onSettled,
    });
    const looping = status === "loading" || settle.phase === "looping";
    const landed = status !== "loading" && settle.phase !== "looping";

    // The cycle's class and inline values on a face, with the geometry its
    // keyframes read from the face's own points. Nothing under reduced
    // motion: the faces are simply there.
    const motion = (p: (typeof faces)[number], cycle: "loop" | "step") => ({
      className: cycleClass(cycle, enter),
      style: {
        "--tile-delay": `${FACE_DELAYS[p.tone].delay}ms`,
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
          ref={ref}
          viewBox={`${-pad} ${-pad} ${w + 2 * pad} ${size + 2 * pad}`}
          width={w + 2 * pad}
          height={size + 2 * pad}
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : name}
          aria-hidden={decorative ? "true" : undefined}
          focusable="false"
          data-enter={enter}
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
          {/* The faces on the same point strings, sides first and top last,
              each with the face stroke: a thin bevelled stroke in its own fill
              under the fill, which covers the anti-aliased seam against its
              neighbour while it moves on its own layer, with no pin at a
              corner and no overshoot onto the outline. Mono faces carry their
              strength as fill and stroke opacity, so the cycle's opacity is
              free. Once a status has landed, a face that was away at the quiet
              moment stays away rather than snap back. */}
          {tileFaceOrder
            .map((t) => faces[t])
            .map((p) =>
              React.cloneElement(face(p, paint(p.tone), mono ? MONO_FACE[p.tone] : undefined), {
                ...(looping && !reduced ? motion(p, "loop") : {}),
                ...(landed && settle.away[p.tone] ? { opacity: 0 } : {}),
              }),
            )}
          {/* The status faces, over the brand ones: they come into place once
              as the loop's faces do, in the status tones, and stay. */}
          {landed &&
            tileFaceOrder
              .map((t) => faces[t])
              .map((p) =>
                React.cloneElement(face(p, tilePalettes[status as "success" | "error"][p.tone]), {
                  "data-status-face": "",
                  ...(settle.phase === "landing" ? motion(p, "step") : {}),
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
