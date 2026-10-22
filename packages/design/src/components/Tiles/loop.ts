// What the tile loaders share: the timing of their cycles, in ms, derived
// from the motion tokens exactly as base.css derives the cycle durations, so
// a component can size a stagger or a timer without a literal; the classes;
// the inline values a face's motion reads; the padding a box needs so no
// stroke or face on its way is clipped; the status machinery; and the
// reduced-motion preference as a hook.
import * as React from "react";
import { motion } from "../../tokens/index.ts";
import { quadMotion, type Point } from "../../lib/mark.ts";

// One entrance takes the slow token stretched by a half (--tile-enter-duration).
// A loader's loop is four entrances: in, rest, out, away; its faces start an
// eighth of a turn apart, so a whole cube takes two entrances to come in or
// go. The ring moves one cube at a time, each a whole cube's time after the
// last: its "chase" lap is fourteen entrances (six cubes in, then one cube
// out and straight back while the next goes) and its "build" lap twenty-six
// (six in, a beat of one cube as the mark, six out). A bar's indeterminate
// wave repeats every WAVE_TILES tiles.
const ENTER_SCALE = 1.5;
export const ENTER_DURATION = parseFloat(motion.duration.slow) * ENTER_SCALE;
export const LOOP_DURATION = ENTER_DURATION * 4;
export const LOOP_FACE_STEP = LOOP_DURATION / 8;
export const CUBE_DURATION = ENTER_DURATION + 2 * LOOP_FACE_STEP;
export const WAVE_TILES = 8;

/**
 * The motions a loader can run, and the entrance a bar's tile makes: the
 * field's entrance of the same name, its reversal, and again. "assemble":
 * each face arrives along the line from the cube's centre vertex through
 * its own middle and the faces meet at that vertex. "unfold": each face
 * hinges open from that vertex along its own two edges.
 */
export type TileLoop = "assemble" | "unfold";

/** The cycles in base.css: the loader's loop, the ring's two laps, and the bar's one-shot step. */
export type TileCycle = "loop" | "chase" | "build" | "step";

export function cycleClass(cycle: TileCycle, loop: TileLoop): string {
  return `tile-${cycle}-${loop}`;
}

/**
 * The timing of each cycle, in entrances, as base.css lays it out: when a
 * face is moving (in, then out) and from when it is away until the cycle
 * comes round. The generator of the keyframes uses the same numbers; keep
 * them together.
 */
export const CYCLES: Record<TileCycle, { period: number; moving: [number, number][]; away: number }> = {
  loop: {
    period: 4,
    moving: [
      [0, 1],
      [2.5, 3.5],
    ],
    away: 3.5,
  },
  chase: {
    period: 14,
    moving: [
      [0, 1],
      [12, 13],
    ],
    away: 13,
  },
  build: {
    period: 26,
    moving: [
      [0, 1],
      [14, 15],
    ],
    away: 15,
  },
  step: { period: 1, moving: [[0, 1]], away: 1 },
};

/** A loader's state: looping, or landed in a status. */
export type TileStatus = "loading" | "success" | "error";

export const STATUS_LABEL: Record<TileStatus, string> = {
  loading: "Loading",
  success: "Done",
  error: "Failed",
};

// A stroke of 1 unit reaches 1 unit past a 60 degree corner at its mitre,
// half a unit past an edge; a face assembling starts `reach` units from its
// outline along its own line. The box is padded by both, on every side.
export const STROKE = 1;
const MITRE = 1;

/** The padding a box needs round its polygons: the mitre of the stroke, if any, plus the reach. */
export function framePad(reach: number, stroke = STROKE): number {
  return stroke * MITRE + reach;
}

/** How far a face travels assembling: three tenths of the cube's edge, as the loaders are drawn. */
export const REACH = 0.3;

/**
 * The inline values one face's motion reads, from its own points and the
 * corner it moves about (`quadMotion`), in viewBox units. Assembling: the
 * unit direction it arrives from and the reach. Unfolding: the corner, and
 * the frame that puts its two edges on the axes, with its inverse, so the
 * keyframes can scale the face toward the corner exactly along its edges.
 */
export function faceVars(
  loop: TileLoop,
  points: Point[],
  vertex: number,
  reach: number,
): Record<string, string> {
  const g = quadMotion(points, vertex);
  if (loop === "assemble") {
    return { "--tile-dx": fix(g.from[0]), "--tile-dy": fix(g.from[1]), "--tile-reach": `${fix(reach)}px` };
  }
  const [ma, mb, mc, md] = g.matrix;
  const [ia, ib, ic, id] = g.inverse;
  return {
    "--tile-vx": `${fix(g.vertex[0])}px`,
    "--tile-vy": `${fix(g.vertex[1])}px`,
    "--tile-ma": fix(ma),
    "--tile-mb": fix(mb),
    "--tile-mc": fix(mc),
    "--tile-md": fix(md),
    "--tile-ia": fix(ia),
    "--tile-ib": fix(ib),
    "--tile-ic": fix(ic),
    "--tile-id": fix(id),
  };
}

function fix(n: number): string {
  return String(Math.round(n * 10000) / 10000);
}

// A face is mid-motion when it is strictly inside one of its moving windows
// by more than this, in ms: the laps touch at their boundaries, and the
// instant one cube lands and the next starts counts as quiet.
const QUIET_SLACK = 24;
const QUIET_STEP = 12;

/**
 * How long after `elapsed` ms into the cycle no face of a loader is
 * mid-motion, so the loop can stop there without cutting a face, and which
 * faces are away at that moment (not yet started, or gone), so they can be
 * kept hidden rather than snap back. Searches forward one period in small
 * steps; the cycles always have such a moment, so the search always ends.
 */
export function quietPoint(
  elapsed: number,
  faces: { delay: number }[],
  cycle: TileCycle,
): { wait: number; away: boolean[] } {
  const { period, moving, away } = CYCLES[cycle];
  const P = period * ENTER_DURATION;
  const phase = (t: number, delay: number) => (((t - delay) % P) + P) % P;
  const isMoving = (t: number, delay: number) =>
    t >= delay &&
    moving.some(([a, b]) => {
      const p = phase(t, delay);
      return p > a * ENTER_DURATION + QUIET_SLACK && p < b * ENTER_DURATION - QUIET_SLACK;
    });
  const isAway = (t: number, delay: number) => t < delay || phase(t, delay) >= away * ENTER_DURATION;
  for (let t = elapsed; t <= elapsed + P + QUIET_STEP; t += QUIET_STEP) {
    if (faces.every((f) => !isMoving(t, f.delay))) {
      return { wait: Math.max(0, t - elapsed), away: faces.map((f) => isAway(t, f.delay)) };
    }
  }
  return { wait: 0, away: faces.map(() => false) };
}

/** Where a loader is between its status changing and its final faces landing. */
export type SettlePhase = "looping" | "landing" | "settled";

/**
 * Runs a loader's status: while "loading" the loop runs from a fresh
 * start; when the status becomes "success" or "error" the loop is left to
 * reach its next quiet moment (`faces` and `cycle` describe it), then the
 * loop comes off, the faces that were away stay away, and the status faces
 * land over `landing` ms, after which `onSettled` fires once. Under reduced
 * motion the loader settles at once; with no faces to wait for it lands at
 * once. A status back to "loading" starts the loop again. The phase is
 * derived from the status it was reached for, so a change of status reads
 * as looping again before any timer has run.
 */
export function useSettle(options: {
  status: TileStatus;
  reduced: boolean;
  faces: { delay: number }[];
  cycle: TileCycle;
  landing: number;
  onSettled?: (status: TileStatus) => void;
}): { phase: SettlePhase; away: boolean[] } {
  const { status, reduced, faces, cycle, landing, onSettled } = options;
  const [reached, setReached] = React.useState<{ status: TileStatus; phase: SettlePhase; away: boolean[] }>({
    status: "loading",
    phase: "looping",
    away: [],
  });
  const started = React.useRef(0);
  const settled = React.useRef<((status: TileStatus) => void) | undefined>(undefined);
  React.useEffect(() => {
    settled.current = onSettled;
  });
  React.useEffect(() => {
    if (status === "loading") {
      started.current = performance.now();
      return;
    }
    if (reduced) {
      settled.current?.(status);
      return;
    }
    // Nothing to wait for (an indeterminate bar, say) lands at once.
    const quiet = faces.length
      ? quietPoint(performance.now() - started.current, faces, cycle)
      : { wait: 0, away: [] };
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setReached({ status, phase: "landing", away: quiet.away });
        timers.push(
          window.setTimeout(() => {
            setReached({ status, phase: "settled", away: quiet.away });
            settled.current?.(status);
          }, landing),
        );
      }, quiet.wait),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // The faces and the landing time are derived from props that do not change mid-status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reduced, cycle]);
  if (status === "loading") return { phase: "looping", away: [] };
  if (reduced) return { phase: "settled", away: [] };
  return reached.status === status ? reached : { phase: "looping", away: [] };
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
function getSnapshot(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the person has asked for reduced motion, kept current as the
 * preference changes. A server, and a browser without matchMedia (jsdom),
 * have not asked, and the server snapshot is false, so hydration starts from
 * the moving markup and settles on the client's preference.
 */
export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
