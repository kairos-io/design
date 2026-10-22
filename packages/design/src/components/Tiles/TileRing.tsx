import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { useMergedRef } from "../../hooks/useMergedRef.ts";
import { kairosMarkTiles, type Point } from "../../lib/mark.ts";
import { tileFaceOrder, tileFaceStroke, tileGridPaths, tilePalettes } from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";
import {
  CUBE_DURATION,
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

/** How the ring runs: see `TileRingProps.mode`. */
export type TileRingMode = "build" | "chase";

export interface TileRingProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "width" | "height">, PaletteProp {
  /** Height of the mark in px, 48 to 120; 64 by default. The box is a little larger: see `tileRingFrame`. */
  size?: number;
  /**
   * "build" (default): the six cubes come into place one at a time,
   * clockwise from the top, each starting as the previous lands and taking
   * the time the inline loader takes; the ring rests as the complete mark
   * for one cube's time, then the cubes go one at a time in the same order,
   * and it starts again as the last has gone. "chase": the cubes come in
   * one at a time, and from then on one cube at a time goes and comes
   * straight back while the next goes, chasing round the ring, never more
   * than two moving.
   */
  mode?: TileRingMode;
  /**
   * The motion each cube makes: "unfold" (default, the system's motion),
   * its faces hinging open from the centre vertex, or "assemble", the
   * alternative, its faces meeting at that vertex.
   */
  enter?: TileLoop;
  /**
   * How a cube leaves. "disassemble" (default): the way it came, face by
   * face. "vanish": in one frame, no motion and no fade, its outline still
   * there. In "build" the whole mark rests one cube's time, then all six
   * are gone together for one cube's time and the build starts again; in
   * "chase" one cube at a time comes in round the ring, each gone as the
   * next begins, so no mark stands. Under prefers-reduced-motion both are
   * the static mark.
   */
  exit?: TileExit;
  /**
   * "loading" (default) runs the lap. "success" stops the lap in the same
   * frame: every cube on its outline crossfades to the success greens over
   * the fast token, a step apart clockwise from the top, a cube on its way
   * or away completes to its outline from wherever it is over the base
   * token (a transition, nothing jumps back) and turns green as it lands,
   * so the mark is green and still within about a third of a second;
   * "error" the same in the recovery reds. `onSettled` fires once the last
   * cube has turned. Under prefers-reduced-motion the mark simply turns.
   * Back to "loading" and the lap starts again from empty.
   */
  status?: TileStatus;
  /** Called once, when a "success" or "error" has landed and the ring is at rest. */
  onSettled?: (status: TileStatus) => void;
  /** Hide the ring from assistive technology, when the surface it sits on is already `aria-busy`. */
  decorative?: boolean;
  /** The accessible name while loading; "Loading" by default. A landed ring is "Done" or "Failed", announced politely. */
  "aria-label"?: string;
}

/**
 * The ring's box for a size: the mark's eighteen rhombi scaled so they
 * stand `size` px tall, padded by the stroke's mitre plus the reach a face
 * assembles from so nothing is clipped. `scale` and `offset` map a point of
 * the icon's own viewBox into the box, which is how the overlay story puts
 * the real mark under the ring.
 */
export function tileRingFrame(size: number): {
  width: number;
  height: number;
  pad: number;
  reach: number;
  scale: number;
  offset: Point;
} {
  const mark = kairosMarkTiles();
  const scale = size / mark.bbox.height;
  const [p0, p1] = mark.cubes[0].faces[0].points;
  const edge = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * scale;
  const reach = round(REACH * edge);
  const pad = framePad(reach);
  return {
    width: round(mark.bbox.width * scale + 2 * pad),
    height: round(size + 2 * pad),
    pad,
    reach,
    scale,
    offset: [pad - mark.bbox.x * scale, pad - mark.bbox.y * scale],
  };
}

// Each cube a whole cube's time after the last, its faces an eighth of a
// loop apart in tone order as the inline loader's are; a cube's gate
// starts with its first face. The status faces stagger in the same order.
const cubeDelay = (cube: number) => Math.round(cube * CUBE_DURATION);
const faceDelay = (cube: number, tone: number) => Math.round(cube * CUBE_DURATION + tone * LOOP_FACE_STEP);
const faceKey = (cube: number, tone: number) => `${cube}.${tone}`;
const FACE_KEYS = [0, 1, 2, 3, 4, 5].flatMap((cube) => [0, 1, 2].map((tone) => faceKey(cube, tone)));

/**
 * The showpiece loader: the Kairos mark itself, its six cubes on the icon's
 * own geometry (flipped cubes and all), coming into place one by one
 * clockwise from the top over an outline that never goes. For empty states,
 * first screens and anything that waits on a build. Under
 * prefers-reduced-motion it is the static mark. A proposal on top of the deck.
 */
export const TileRing = React.forwardRef<SVGSVGElement, TileRingProps>(
  (
    {
      size = 64,
      mode = "build",
      enter = "unfold",
      exit = "disassemble",
      palette = "kairos",
      status = "loading",
      onSettled,
      decorative = false,
      "aria-label": label = "Loading",
      className,
      ...props
    },
    ref,
  ) => {
    const reduced = useReducedMotion();
    const root = React.useRef<SVGSVGElement | null>(null);
    const setRefs = useMergedRef(root, ref);
    const tones = tilePalettes[palette];
    const frame = React.useMemo(() => tileRingFrame(size), [size]);
    // The viewBox is in px, so the 1 unit strokes are 1px hairlines. Every
    // point is rounded once, here, and the one string serves the outline
    // and the face, so the two coincide to the digit.
    const cubes = React.useMemo(() => {
      const { scale, offset, reach } = frame;
      return kairosMarkTiles().cubes.map((cube) => ({
        faces: cube.faces.map((face) => {
          const points = face.points.map(([x, y]): Point => [
            round(x * scale + offset[0]),
            round(y * scale + offset[1]),
          ]);
          return {
            tone: face.tone,
            vertex: face.vertex,
            points,
            string: points.map((p) => p.join(",")).join(" "),
          };
        }),
        reach,
      }));
    }, [frame]);
    const grid = React.useMemo(
      () => tileGridPaths(cubes.flatMap((cube) => cube.faces.map((f) => ({ points: f.string, outline: 1 })))),
      [cubes],
    );
    const settle = useSettle({ status, reduced, root, keys: FACE_KEYS, onSettled });
    const looping = status === "loading" || settle.phase === "looping";
    const landing = settle.phase === "landing";
    const landed = status !== "loading" && settle.phase !== "looping";
    const vanish = exit === "vanish";
    const name = status === "loading" ? label : STATUS_LABEL[status];

    type Face = (typeof cubes)[number]["faces"][number];
    const motion = (i: number, face: Face) => ({
      className: cycleClass(mode, enter, exit),
      style: {
        "--tile-delay": `${faceDelay(i, face.tone)}ms`,
        ...faceVars(enter, face.points, face.vertex, cubes[i].reach),
      } as React.CSSProperties,
    });
    const polygon = (face: Face, fill: string) => (
      <polygon
        key={face.tone}
        data-tone={face.tone}
        points={face.string}
        fill={fill}
        stroke={fill}
        strokeWidth={tileFaceStroke.width}
        strokeLinejoin={tileFaceStroke.join}
        paintOrder={tileFaceStroke.order}
      />
    );

    return (
      <>
        <svg
          ref={setRefs}
          viewBox={`0 0 ${frame.width} ${frame.height}`}
          width={frame.width}
          height={frame.height}
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : name}
          aria-hidden={decorative ? "true" : undefined}
          focusable="false"
          data-mode={mode}
          data-enter={enter}
          data-exit={exit}
          data-status={status}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          className={cn("tile-ring shrink-0 overflow-visible", className)}
          {...props}
        >
          {/* The whole grid first, as unique lattice edges on the very points
              the faces take, each once, so a cube that has gone leaves its
              outline behind, nothing paints over a landed face, and no edge
              two faces share is drawn twice. Round caps close the corners at
              hairline width. */}
          {grid.map((g) => (
            <path
              key={g.opacity}
              d={g.d}
              fill="none"
              stroke="var(--line)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* The cubes clockwise from the top, each a whole cube's time after
              the last, its faces in tone order an eighth of a loop apart as the
              inline loader's are, each face moving about the cube's centre
              vertex along its own geometry; drawn sides first and top last,
              with the face stroke. Each group is its cube's gate for the vanish
              exit. Nothing under reduced motion: the mark is simply there.
              While a status lands, the faces carry the resolve instead. */}
          {cubes.map((cube, i) => (
            <g
              key={i}
              data-cube={i}
              {...(vanish ? { "data-gate": "" } : {})}
              {...(vanish && looping && !reduced
                ? {
                    className: gateClass(mode, i),
                    style: { "--tile-delay": `${cubeDelay(i)}ms` } as React.CSSProperties,
                  }
                : vanish && landing
                  ? { className: RESOLVE_CLASS }
                  : {})}
            >
              {tileFaceOrder
                .map((t) => cube.faces[t])
                .map((face) =>
                  React.cloneElement(polygon(face, tones[face.tone]), {
                    "data-face": faceKey(i, face.tone),
                    ...(looping && !reduced ? motion(i, face) : landing ? { className: RESOLVE_CLASS } : {}),
                  }),
                )}
            </g>
          ))}
          {/* The status mark, over the brand cubes: each face fades in once its
              brand face is on the outline, clockwise from the top, and stays. */}
          {landed &&
            cubes.map((cube, i) => (
              <g key={i} data-status-cube={i}>
                {tileFaceOrder
                  .map((t) => cube.faces[t])
                  .map((face) =>
                    React.cloneElement(
                      polygon(face, tilePalettes[status as "success" | "error"][face.tone]),
                      {
                        "data-status-face": "",
                        ...(landing
                          ? {
                              className: "tile-settle",
                              style: {
                                "--tile-delay": `${settle.delays[i * 3 + face.tone]}ms`,
                              } as React.CSSProperties,
                            }
                          : {}),
                      },
                    ),
                  )}
              </g>
            ))}
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
TileRing.displayName = "TileRing";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
