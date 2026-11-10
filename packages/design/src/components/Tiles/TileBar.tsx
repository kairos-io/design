import * as React from "react";
import { cn } from "../../lib/cn.ts";
import { useMergedRef } from "../../hooks/useMergedRef.ts";
import { parsePoints } from "../../lib/mark.ts";
import { tilePalettes, tilePoints, type TileTone } from "../../lib/tiles.ts";
import type { PaletteProp } from "./shared.ts";
import { Tile } from "./Tile.tsx";
import {
  ENTER_DURATION,
  LOOP_DURATION,
  REACH,
  RESOLVE_CLASS,
  STATUS_LABEL,
  WAVE_TILES,
  cycleClass,
  faceVars,
  framePad,
  useReducedMotion,
  useSettle,
  type TileExit,
  type TileLoop,
  type TileStatus,
} from "./loop.ts";

// A bar's tile is the flat parallelogram, 22 by 14. It moves about its
// bottom right corner, the one whose two edges meet nearest the 120 degrees
// of a cube's face, so assembling it arrives along the line from that corner
// through its middle, and unfolding it stands up from its bottom edge. When
// several tiles become done at once they come in BAR_STEP ms apart, left to
// right. The indeterminate wave starts each tile's loop a WAVE_TILES-th of a
// turn after its neighbour, so a band of lit tiles travels the bar and
// repeats every WAVE_TILES tiles.
const BAR_STEP = 60;
const BAR_POINTS = parsePoints(tilePoints);
const BAR_VERTEX = 2;
const BAR_REACH = Math.round(REACH * 14 * 100) / 100;
const BAR_PAD = framePad(BAR_REACH, 0);
const WAVE_STEP = LOOP_DURATION / WAVE_TILES;

export interface TileBarProps extends React.HTMLAttributes<HTMLDivElement>, PaletteProp {
  /** Tiles in the bar: one per node, step or stage. */
  total: number;
  /**
   * Tiles filled, from the left, cycling through the three tones. Leave it
   * out with `current` set for an indeterminate bar, while nothing is known
   * but that work is going on.
   */
  done?: number;
  /**
   * The step that is running. `true`: the tile at index `done`, the next
   * one; a number: that tile. Its tile loops the loader's motion while the
   * rest stay at rest, and from then on a tile that becomes done comes into
   * place once instead of fading in; tiles already done stay still. With
   * `done` unknown the bar is indeterminate, and the loop travels the whole
   * bar as a wave. Under prefers-reduced-motion nothing moves: the running
   * tile is its tone at half strength, and an indeterminate bar is its rest
   * tiles alone. A proposal on top of the deck.
   */
  current?: boolean | number;
  /** The motion a tile makes: "unfold" (default, the system's motion), standing up from its bottom edge, or "assemble", arriving along its own line. */
  enter?: TileLoop;
  /**
   * How the running tile leaves between loops: "disassemble" (default),
   * the way it came, or "vanish", gone in one frame after one entrance at
   * rest, its rest tile still there, and in again after one entrance; an
   * indeterminate bar's wave does the same tile by tile.
   */
  exit?: TileExit;
  /**
   * "loading" (default) runs the current step. "success" stops the loop in
   * the same frame: every done tile crossfades to the success greens over
   * the fast token, a step apart left to right, and the running tile
   * completes to its place from wherever it is over the base token (a
   * transition, nothing jumps back) and turns green as it lands, so the bar
   * rests green up to and including that step within about a third of a
   * second (set `done` to `total` for a complete green bar); "error" the
   * same in the recovery reds. An indeterminate bar turns every tile.
   * `onSettled` fires once the last tile has turned. Under
   * prefers-reduced-motion the tiles simply turn.
   */
  status?: TileStatus;
  /** Called once, when a "success" or "error" has landed and the bar is at rest. */
  onSettled?: (status: TileStatus) => void;
  /** Rendered tile width in px. */
  size?: number;
  /** Accessible name; the value is announced from done and total, and "Done" or "Failed" politely once landed. */
  "aria-label"?: string;
}

/** Which tiles came in on the last change of `done`: from (inclusive) to (exclusive). */
type Landing = { from: number; to: number } | null;

/** The tile bar: one parallelogram per node or step, for rollouts, install progress and stage markers. */
export const TileBar = React.forwardRef<HTMLDivElement, TileBarProps>(
  (
    {
      total,
      done,
      current,
      enter = "unfold",
      exit = "disassemble",
      status = "loading",
      onSettled,
      size = 16,
      palette = "kairos",
      className,
      "aria-label": label = "Progress",
      children,
      ...props
    },
    ref,
  ) => {
    const stepping = current !== undefined || status !== "loading";
    const indeterminate = stepping && done === undefined;
    const filled = indeterminate ? 0 : Math.max(0, Math.min(total, done ?? 0));
    const running =
      !stepping || indeterminate || current === undefined || current === false
        ? -1
        : current === true
          ? filled
          : current;
    const reduced = useReducedMotion();
    const root = React.useRef<HTMLDivElement | null>(null);
    const setRefs = useMergedRef(root, ref);
    const tones = tilePalettes[palette];

    // The entrance runs on the tiles that have just become done, and only
    // those: the previous count is kept in a ref, so a bar that mounts at 3
    // of 8 shows three still tiles, and 4 of 8 brings in the fourth. The
    // class comes off on a timer sized from the duration token and the
    // stagger, so the resting bar carries no motion class. Nothing moves
    // while stepping is off (the fill transition of the plain bar stays) or
    // under reduced motion.
    const [landingDone, setLandingDone] = React.useState<Landing>(null);
    const previous = React.useRef(filled);
    React.useEffect(() => {
      const from = previous.current;
      previous.current = filled;
      if (!stepping || reduced || filled <= from) return;
      setLandingDone({ from, to: filled });
      const timer = window.setTimeout(
        () => setLandingDone(null),
        ENTER_DURATION + (filled - from - 1) * BAR_STEP,
      );
      return () => window.clearTimeout(timer);
    }, [filled, stepping, reduced]);

    // The status: the tiles up to `last` turn, left to right; the running
    // one completes to its place first if it was on its way.
    const last = indeterminate ? total - 1 : running >= 0 ? running : filled - 1;
    const keys = React.useMemo(() => Array.from({ length: last + 1 }, (_, i) => String(i)), [last]);
    const settle = useSettle({ status, reduced, root, keys, onSettled });
    const looping = status === "loading" || settle.phase === "looping";
    const landing = settle.phase === "landing";
    const landed = status !== "loading" && settle.phase !== "looping";
    const statusTones = landed ? tilePalettes[status as "success" | "error"] : null;

    const vars = React.useMemo(() => faceVars(enter, BAR_POINTS, BAR_VERTEX, BAR_REACH), [enter]);

    // The face a tile shows in a stepping bar, over its rest tile: done,
    // coming in if it just became done; running, looping; or none. Once a
    // status has landed, every face up to `last` stands on its tile.
    const face = (i: number): React.SVGAttributes<SVGPolygonElement> | null => {
      const tone = (i % 3) as TileTone;
      const base = { points: tilePoints, fill: tones[tone], "data-face": String(i) };
      if (landed) return i > last ? null : landing ? { ...base, className: RESOLVE_CLASS } : base;
      if (i < filled) {
        if (!landingDone || i < landingDone.from || i >= landingDone.to) return base;
        return {
          ...base,
          className: cycleClass("step", enter),
          style: { "--tile-delay": `${(i - landingDone.from) * BAR_STEP}ms`, ...vars } as React.CSSProperties,
        };
      }
      if (i !== running && !indeterminate) return null;
      if (reduced) return indeterminate ? null : { ...base, fillOpacity: 0.5 };
      if (!looping) return base;
      return {
        ...base,
        className: cycleClass("loop", enter, exit),
        style: {
          "--tile-delay": `${Math.round(indeterminate ? i * WAVE_STEP : 0)}ms`,
          ...vars,
        } as React.CSSProperties,
      };
    };
    // The status face over a tile, fading in while landing, and after.
    const statusFace = (i: number): React.SVGAttributes<SVGPolygonElement> | null => {
      if (!statusTones || i > last) return null;
      const base = { points: tilePoints, fill: statusTones[(i % 3) as TileTone], "data-status-face": "" };
      if (!landing) return base;
      return {
        ...base,
        className: "tile-settle",
        style: { "--tile-delay": `${settle.delays[i]}ms` } as React.CSSProperties,
      };
    };

    // A stepping tile's box is padded by the reach so a face on its way is
    // not clipped, and the padding taken back as margin so the bar's layout
    // is the plain bar's. The tiles carry no stroke, so there is no mitre.
    const unit = size / 22;
    const pad = BAR_PAD * unit;

    return (
      <div
        ref={setRefs}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={indeterminate ? undefined : filled}
        aria-valuetext={indeterminate ? undefined : `${filled} of ${total}`}
        aria-busy={status === "loading" && (indeterminate || running >= 0) ? true : undefined}
        data-current={running >= 0 ? running : indeterminate ? "" : undefined}
        data-enter={stepping ? enter : undefined}
        data-exit={stepping ? exit : undefined}
        data-status={stepping ? status : undefined}
        className={cn("flex flex-wrap gap-1", className)}
        {...props}
      >
        {Array.from({ length: total }, (_, i) =>
          stepping ? (
            // The rest tile is always there, so a face comes onto it and a
            // tile whose face has gone is still a tile.
            <svg
              key={i}
              viewBox={`${-BAR_PAD} ${-BAR_PAD} ${22 + 2 * BAR_PAD} ${14 + 2 * BAR_PAD}`}
              width={size + 2 * pad}
              height={(size * 14) / 22 + 2 * pad}
              style={{ margin: -pad }}
              aria-hidden="true"
              focusable="false"
              className="shrink-0 overflow-visible"
            >
              <polygon points={tilePoints} fill="var(--inner)" />
              {(() => {
                const attrs = face(i);
                return attrs && <polygon {...attrs} />;
              })()}
              {(() => {
                const attrs = statusFace(i);
                return attrs && <polygon {...attrs} />;
              })()}
            </svg>
          ) : (
            <Tile key={i} size={size} palette={palette} tone={i < filled ? ((i % 3) as TileTone) : "rest"} />
          ),
        )}
        {stepping && (
          <span role="status" className="sr-only">
            {status === "loading"
              ? `${label}: ${indeterminate ? "working" : `${filled} of ${total}`}`
              : STATUS_LABEL[status]}
          </span>
        )}
        {children}
      </div>
    );
  },
);
TileBar.displayName = "TileBar";
