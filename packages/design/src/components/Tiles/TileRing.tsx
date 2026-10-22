import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { kairosMarkTiles, type Point } from "../../lib/mark.ts";
import { tileFaceOrder, tileFaceStroke, tileGridPaths, tilePalettes } from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";
import {
  CUBE_DURATION,
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
  /** The motion each cube makes: "assemble" (default), its faces meeting at the centre vertex, or "unfold", hinging open from it. */
  enter?: TileLoop;
  /**
   * "loading" (default) runs the lap. "success" lets the lap reach its next
   * quiet moment, then a final lap builds the mark in the success greens,
   * cube by cube clockwise from the top over whatever stands, and it rests
   * as a green mark; "error" the same in the recovery reds. `onSettled`
   * fires once the last cube has landed. Under prefers-reduced-motion the
   * mark simply turns. Back to "loading" and the lap starts again.
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
// loop apart in tone order as the inline loader's are.
const faceDelay = (cube: number, tone: number) => Math.round(cube * CUBE_DURATION + tone * LOOP_FACE_STEP);
const FACE_DELAYS = [0, 1, 2, 3, 4, 5].flatMap((cube) =>
  [0, 1, 2].map((tone) => ({ delay: faceDelay(cube, tone) })),
);
const LAP_LANDING = 6 * CUBE_DURATION;

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
      enter = "assemble",
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
    const settle = useSettle({
      status,
      reduced,
      faces: FACE_DELAYS,
      cycle: mode,
      landing: LAP_LANDING,
      onSettled,
    });
    const looping = status === "loading" || settle.phase === "looping";
    const landed = status !== "loading" && settle.phase !== "looping";
    const name = status === "loading" ? label : STATUS_LABEL[status];

    type Face = (typeof cubes)[number]["faces"][number];
    const motion = (i: number, face: Face, cycle: TileRingMode | "step") => ({
      className: cycleClass(cycle, enter),
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
          ref={ref}
          viewBox={`0 0 ${frame.width} ${frame.height}`}
          width={frame.width}
          height={frame.height}
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : name}
          aria-hidden={decorative ? "true" : undefined}
          focusable="false"
          data-mode={mode}
          data-enter={enter}
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
              with the face stroke. Nothing under reduced motion: the mark is
              simply there. Once a status has landed, a face that was away at
              the quiet moment stays away rather than snap back. */}
          {cubes.map((cube, i) => (
            <g key={i} data-cube={i}>
              {tileFaceOrder
                .map((t) => cube.faces[t])
                .map((face) =>
                  React.cloneElement(polygon(face, tones[face.tone]), {
                    ...(looping && !reduced ? motion(i, face, mode) : {}),
                    ...(landed && settle.away[i * 3 + face.tone] ? { opacity: 0 } : {}),
                  }),
                )}
            </g>
          ))}
          {/* The status lap, over the brand cubes: the mark built once more,
              cube by cube from the top, in the status tones, and kept. */}
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
                        ...(settle.phase === "landing" ? motion(i, face, "step") : {}),
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
