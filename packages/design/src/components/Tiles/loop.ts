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

/**
 * How a cube leaves between cycles. "disassemble": the entrance reversed,
 * face by face. "vanish": no motion at all; the cube rests, then is gone in
 * one frame (the outline stays) and the next cycle assembles it again.
 */
export type TileExit = "disassemble" | "vanish";

/** The cycles in base.css: the loader's loop, the ring's two laps, and the bar's one-shot step. */
export type TileCycle = "loop" | "chase" | "build" | "step";

/** The class that runs a cycle on a face; the vanish exit has its own keyframes, except the one-shot step. */
export function cycleClass(cycle: TileCycle, loop: TileLoop, exit: TileExit = "disassemble"): string {
  return exit === "vanish" && cycle !== "step" ? `tile-${cycle}-${loop}-vanish` : `tile-${cycle}-${loop}`;
}

/**
 * The class on a cube's group that makes its faces vanish together: a
 * step on the group's opacity, closed from the cycle's vanish moment to
 * the end of its period. The build lap's six gates close at the same
 * instant of the lap, so each cube has its own, closing earlier in its own
 * time by the cubes before it.
 */
export function gateClass(cycle: Exclude<TileCycle, "step">, cube = 0): string {
  return cycle === "build" ? `tile-build-gate-${cube}` : `tile-${cycle}-gate`;
}

/**
 * One cycle's timing, in entrances, as base.css lays it out: the period,
 * when a face is moving (in, then out), from when it is away until the
 * cycle comes round, and for a vanish exit the moment the cube's gate
 * closes in the cube's own time (the first face's away point; the lap's
 * for the build, see `gateClass`). `once` is the bar's one-shot step, which
 * stays landed. The keyframes use the same numbers; keep them together.
 */
export interface CycleTiming {
  period: number;
  moving: [number, number][];
  away: number;
  gate?: number;
  once?: boolean;
}

const STEP: CycleTiming = { period: 1, moving: [[0, 1]], away: 1, once: true };

export const CYCLES: Record<TileExit, Record<TileCycle, CycleTiming>> = {
  disassemble: {
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
    step: STEP,
  },
  // The exit's duration is zero: the face comes in as above, rests, and is
  // away from `gate` on, the cube's three faces together behind the gate.
  // The loop rests one entrance as the whole cube and is gone for one; the
  // chase runs one cube at a time round the ring, each gone as the next
  // begins; the build rests one cube's time as the mark, then all six are
  // gone together for one cube's time.
  vanish: {
    loop: { period: 4, moving: [[0, 1]], away: 3, gate: 3 },
    chase: { period: 12, moving: [[0, 1]], away: 2, gate: 2 },
    build: { period: 16, moving: [[0, 1]], away: 14, gate: 14 },
    step: STEP,
  },
};

/**
 * Where a face is `elapsed` ms into its cycle, by its own keyframes: on its
 * way (in or out), landed on its outline, or away from it. The timing table
 * above, so a test can walk a lap; the components read the live values
 * instead when a status lands.
 */
export function faceState(
  elapsed: number,
  delay: number,
  cycle: TileCycle,
  exit: TileExit = "disassemble",
): "away" | "moving" | "landed" {
  const { period, moving, away, once } = CYCLES[exit][cycle];
  if (elapsed < delay) return "away";
  const t = (elapsed - delay) / ENTER_DURATION;
  if (once && t >= period) return "landed";
  const p = t % period;
  if (moving.some(([a, b]) => p > a && p < b)) return "moving";
  return p >= away ? "away" : "landed";
}

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

// The resolve, when a status lands: a face already on its outline
// crossfades to the status tones over the fast token (.tile-settle), a
// face on its way or away completes to its outline from wherever it is
// over the base token (.tile-resolve, a transition on transform and
// opacity, never a restarted keyframe) and its status face fades in once it
// is there. The landed faces go in tone and ring order a tenth of the fast
// token apart, and the stagger never spans more than the base token, so a
// bar or a ring is done within base plus fast.
export const RESOLVE_FADE = parseFloat(motion.duration.fast);
export const RESOLVE_LAND = parseFloat(motion.duration.base);
export const RESOLVE_STEP = RESOLVE_FADE / 10;
export const RESOLVE_CLASS = "tile-resolve";

/** When status face `index` of `count` starts its fade: in order if its brand face was landed, after the landing if not. */
export function resolveDelay(index: number, count: number, moving: boolean): number {
  if (moving) return RESOLVE_LAND;
  const step = count > 1 ? Math.min(RESOLVE_STEP, RESOLVE_LAND / (count - 1)) : 0;
  return Math.round(index * step);
}

/** Where a loader is between its status changing and its status faces landing. */
export type SettlePhase = "looping" | "landing" | "settled";

type Reached = { status: TileStatus; phase: "landing" | "settled"; delays: number[] };

/**
 * The landing's state lives outside React, read through useSyncExternalStore:
 * the handoff below is DOM work done in a layout effect, and a change here
 * re-renders synchronously before the browser paints, which is what makes
 * the loop's cancel and the resolve one frame.
 */
function createSettleStore() {
  let state: Reached | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: Reached | null) => {
      state = next;
      listeners.forEach((listen) => listen());
    },
    subscribe: (listen: () => void) => {
      listeners.add(listen);
      return () => {
        listeners.delete(listen);
      };
    },
  };
}

const IDENTITY = "matrix(1, 0, 0, 1, 0, 0)";
const PINNED = "data-pinned";

/**
 * Whether an element's live transform and opacity are its resting ones; a
 * browser without animated computed styles (jsdom) reports them so.
 */
function isLanded(style: CSSStyleDeclaration): boolean {
  const transform = style.transform;
  const opacity = style.opacity;
  return (
    (transform === "" || transform === "none" || transform === IDENTITY) &&
    (opacity === "" || parseFloat(opacity) >= 0.999)
  );
}

/**
 * Runs a loader's status. While "loading" the loop runs from a fresh
 * start. When the status becomes "success" or "error" the loop is cancelled
 * in the same frame: before the browser paints again, every face under
 * `root` that carries `data-face` (and every gate carrying `data-gate`) has
 * its live transform and opacity read and pinned inline, the loop classes
 * come off and `tile-resolve` goes on, and the pins are released, so a
 * face on its way completes to its outline from exactly where it was over
 * the base token instead of jumping back to a keyframe. The status faces
 * then come in by `keys`, the order they stagger in: `delays[i]` is the
 * fade's start for the face whose brand face carries `data-face={keys[i]}`,
 * at once and a step apart for the faces that were landed, after the
 * landing for those that were not. `onSettled` fires once, when the last
 * status face has faded in. Under reduced motion the loader settles at
 * once. A status back to "loading" starts the loop again from empty.
 */
export function useSettle(options: {
  status: TileStatus;
  reduced: boolean;
  root: React.RefObject<Element | null>;
  keys: string[];
  onSettled?: (status: TileStatus) => void;
}): { phase: SettlePhase; delays: number[] } {
  const { status, reduced, root, keys, onSettled } = options;
  const [store] = React.useState(createSettleStore);
  const reached = React.useSyncExternalStore(store.subscribe, store.get, store.get);
  // The callback is kept current before the effects below run, so a loader
  // that mounts in a status under reduced motion reports from its first commit.
  const settled = React.useRef<((status: TileStatus) => void) | undefined>(undefined);
  React.useLayoutEffect(() => {
    settled.current = onSettled;
  });

  // The flip: pin the live values and hand over, before paint.
  React.useLayoutEffect(() => {
    if (status === "loading") {
      store.set(null);
      return;
    }
    if (reduced) {
      settled.current?.(status);
      return;
    }
    const moving = new Set<string>();
    const scope = root.current;
    if (scope && typeof getComputedStyle === "function") {
      for (const el of Array.from(scope.querySelectorAll<HTMLElement>("[data-face], [data-gate]"))) {
        const live = getComputedStyle(el);
        if (isLanded(live)) continue;
        el.style.transform = live.transform;
        el.style.opacity = live.opacity;
        el.setAttribute(PINNED, "");
        if (el.hasAttribute("data-gate")) {
          for (const face of Array.from(el.querySelectorAll("[data-face]")))
            moving.add(face.getAttribute("data-face")!);
        } else moving.add(el.getAttribute("data-face")!);
      }
    }
    store.set({
      status,
      phase: "landing",
      delays: keys.map((key, i) => resolveDelay(i, keys.length, moving.has(key))),
    });
    // The keys are derived from props that do not change mid-status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reduced, store]);

  // The landing: with the loop classes gone, let the pins go so the
  // transition runs from them, and settle once the last fade is done.
  React.useLayoutEffect(() => {
    if (!reached || reached.phase !== "landing") return;
    const scope = root.current;
    const pins = scope ? Array.from(scope.querySelectorAll<HTMLElement>(`[${PINNED}]`)) : [];
    if (pins.length) {
      // One read flushes the style with the pins in place and no animation.
      void getComputedStyle(pins[0]).opacity;
      for (const el of pins) {
        el.style.transform = "";
        el.style.opacity = "";
        el.removeAttribute(PINNED);
      }
    }
    const span = Math.max(0, ...reached.delays) + RESOLVE_FADE;
    const timer = window.setTimeout(() => {
      store.set({ ...reached, phase: "settled" });
      settled.current?.(reached.status);
    }, span);
    return () => window.clearTimeout(timer);
  }, [reached, root, store]);

  if (status === "loading") return { phase: "looping", delays: [] };
  if (reduced) return { phase: "settled", delays: keys.map(() => 0) };
  return reached && reached.status === status ? reached : { phase: "looping", delays: [] };
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
