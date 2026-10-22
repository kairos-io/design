// The motion tokens, read back from CSS so a script-driven exit (a toast
// removed after its fade) lasts exactly as long as the stylesheet's, and is
// instant under prefers-reduced-motion, where tokens.css zeroes them.

export type MotionDuration = "fast" | "base" | "slow";

/** The token's value in ms when it is not readable: the numbers in tokens.css. */
export const DURATION_FALLBACK_MS: Record<MotionDuration, number> = { fast: 150, base: 200, slow: 360 };

/** Parses a CSS time ("150ms", "0.2s"); `fallback` for anything else, including an empty string. */
export function parseCssTime(value: string | null | undefined, fallback: number): number {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  return raw.endsWith("ms") ? n : n * 1000;
}

/**
 * The `--duration-*` token as a number of ms, read from the document's
 * computed style. Without a DOM, or where the token is not defined (a host
 * that loads the components without tokens.css), the stylesheet's number.
 */
export function motionDuration(name: MotionDuration): number {
  const fallback = DURATION_FALLBACK_MS[name];
  if (typeof document === "undefined" || typeof getComputedStyle !== "function") return fallback;
  return parseCssTime(
    getComputedStyle(document.documentElement).getPropertyValue(`--duration-${name}`),
    fallback,
  );
}
