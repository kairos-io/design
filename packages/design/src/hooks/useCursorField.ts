import { useEffect } from "react";

// The plumbing behind a decorative SVG that follows the pointer: listen on
// the positioned parent (or a target element), never on the SVG itself,
// which stays pointer-events-none; map each move into the viewBox; book one
// animation frame per batch of moves and hand the painter the point from
// it, or null once the pointer has left. Nothing here touches React state,
// so a move never re-renders. The listeners only attach on a device that
// can hover with a fine pointer and not under prefers-reduced-motion, and a
// browser without matchMedia (jsdom, a server) gets the static field.
//
// This duplicates the cursor effect inside TileField (idle="cursor"), which
// is being reworked alongside the loaders; once that lands TileField should
// call this hook and the copy there go.

/** A point in the SVG's viewBox units. */
export interface ViewBoxPoint {
  x: number;
  y: number;
}

/** What a field does with the pointer; returned once by `setup` when the listeners attach. */
export interface CursorPainter {
  /** From one animation frame per batch of moves: the pointer, or null once it has left. */
  paint(pointer: ViewBoxPoint | null): void;
  /** A press at the point, straight from the event, for a one-shot like a ripple. */
  press?(pointer: ViewBoxPoint): void;
  /** Put the field back to its resting state when the listeners come off. */
  clear(): void;
}

export interface UseCursorFieldOptions {
  /** The decorative SVG the pointer is mapped into. */
  svg: React.RefObject<SVGSVGElement | null>;
  /** The element listened to: the SVG's parent by default. */
  target?: React.RefObject<HTMLElement | null>;
  /** Off, and nothing attaches. */
  enabled: boolean;
  /** The viewBox size and fit, to undo preserveAspectRatio. */
  width: number;
  height: number;
  fit?: string;
  /**
   * Builds the painter once the listeners attach, with the live SVG, so it
   * can collect the elements it writes to. Memoise it: a new function
   * re-attaches, through `clear`.
   */
  setup: (svg: SVGSVGElement) => CursorPainter | null;
}

export const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Whether the pointer can be followed here: a fine hovering pointer and no reduced-motion preference. */
export function canFollowCursor(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(HOVER_QUERY).matches && !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function useCursorField({
  svg: svgRef,
  target,
  enabled,
  width,
  height,
  fit = "xMidYMid slice",
  setup,
}: UseCursorFieldOptions): void {
  useEffect(() => {
    const svg = svgRef.current;
    const host = target ? target.current : svg?.parentElement;
    if (!enabled || !svg || !host || !canFollowCursor()) return;
    const painter = setup(svg);
    if (!painter) return;

    let frame = 0;
    let pointer: ViewBoxPoint | null = null;
    const flush = () => {
      frame = 0;
      painter.paint(pointer);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(flush);
    };
    const onMove = (event: PointerEvent) => {
      // A finger on a hybrid device passes the media query but is not a cursor.
      if (event.pointerType === "touch") return;
      pointer = canFollowCursor()
        ? viewBoxPoint(svg, event.clientX, event.clientY, width, height, fit)
        : null;
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !painter.press || !canFollowCursor()) return;
      painter.press(viewBoxPoint(svg, event.clientX, event.clientY, width, height, fit));
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    if (painter.press) host.addEventListener("pointerdown", onDown);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      if (frame) window.cancelAnimationFrame(frame);
      painter.clear();
    };
  }, [svgRef, target, enabled, width, height, fit, setup]);
}

/**
 * Where a client point falls in the SVG's viewBox, undoing the fit that
 * preserveAspectRatio applies ("xMidYMid slice" crops and centres, "xMaxYMid
 * slice" keeps the right edge). From the bounding box alone, so it holds
 * under a scaled ancestor and in jsdom.
 */
export function viewBoxPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  fit: string,
): ViewBoxPoint {
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
