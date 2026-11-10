// The motion tokens, read back from CSS so a script-driven exit (a toast
// removed after its fade) lasts exactly as long as the stylesheet's, and is
// instant under prefers-reduced-motion, where tokens.css zeroes them.
//
// tokens.css writes each duration as `calc(150ms * var(--duration-scale))`,
// so one property on <html> retimes the whole system: setMotionScale(0.25)
// for reviewing motion a quarter speed, 0 to stop it. Reduced motion still
// wins, because that block writes a literal 0ms whatever the scale is.

export type MotionDuration = "fast" | "base" | "slow";

/** The token's value in ms when it is not readable: the numbers in tokens.css. */
export const DURATION_FALLBACK_MS: Record<MotionDuration, number> = { fast: 150, base: 200, slow: 360 };

/** The custom property every duration is multiplied by. */
export const MOTION_SCALE_PROPERTY = "--duration-scale";

/** The scale tokens.css sets, so nothing is retimed until a host says otherwise. */
export const DEFAULT_MOTION_SCALE = 1;

/** Parses a CSS time ("150ms", "0.2s"); `fallback` for anything else, including an empty string. */
export function parseCssTime(value: string | null | undefined, fallback: number): number {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  return raw.endsWith("ms") ? n : n * 1000;
}

// The root defaults to <html>; on a server there is none, and the helpers
// read the default scale and write nothing rather than throw, so a host can
// call setMotionScale() from code that also runs during server rendering.
function documentRoot(): HTMLElement | undefined {
  return typeof document === "undefined" ? undefined : document.documentElement;
}

function canRead(root: HTMLElement | undefined): root is HTMLElement {
  return !!root && typeof getComputedStyle === "function";
}

// One probe result per duration, keyed by the token text and the scale that
// produced it, so a scale change is read again and a steady page measures
// once. setMotionScale() clears it as well.
const probed = new Map<MotionDuration, { key: string; ms: number }>();

/**
 * Sets `--duration-scale` on <html>, which multiplies every duration token
 * and so every transition, animation and tile loop at once: 0.25 for a
 * quarter speed, 2 to run fast, 0 to stop (the same end state as reduced
 * motion). `null`, or anything that is not a finite number of at least zero,
 * removes the property so the token's own 1 stands. Does nothing without a
 * document.
 */
export function setMotionScale(scale: number | null, root: HTMLElement | undefined = documentRoot()): void {
  if (!root) return;
  if (scale === null || !Number.isFinite(scale) || scale < 0)
    root.style.removeProperty(MOTION_SCALE_PROPERTY);
  else root.style.setProperty(MOTION_SCALE_PROPERTY, String(scale));
  probed.clear();
}

/** The scale in force on the root, 1 when nothing has set it and without a document. */
export function getMotionScale(root: HTMLElement | undefined = documentRoot()): number {
  if (!canRead(root)) return DEFAULT_MOTION_SCALE;
  const n = parseFloat(getComputedStyle(root).getPropertyValue(MOTION_SCALE_PROPERTY));
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_MOTION_SCALE;
}

/**
 * The ms a real element gets for `transition-duration: var(--duration-<name>)`.
 * A custom property's computed value is only its substituted text, so a token
 * written as `calc(150ms * var(--duration-scale))` has to be resolved by the
 * engine rather than parsed: a throwaway element off-screen is given the token
 * and its resolved `transition-duration` read back.
 */
function probeDuration(name: MotionDuration, fallback: number): number {
  const host: HTMLElement | null = document.body ?? document.documentElement;
  if (!host) return fallback;
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;top:0;left:-9999px;width:0;height:0;visibility:hidden;pointer-events:none;transition-property:opacity";
  probe.style.setProperty("transition-duration", `var(--duration-${name})`);
  host.appendChild(probe);
  try {
    return parseCssTime(getComputedStyle(probe).transitionDuration, fallback);
  } finally {
    probe.remove();
  }
}

/**
 * The `--duration-*` token as a number of ms, as the element it applies to
 * sees it: the token's own text when that is a plain time (the literal 0ms the
 * reduced-motion block writes, which has to be seen synchronously so a toast
 * leaves at once), otherwise the scaled value resolved by a probe element.
 * Without a DOM, or where the token is not defined (a host that loads the
 * components without tokens.css), the stylesheet's number.
 */
export function motionDuration(name: MotionDuration): number {
  const fallback = DURATION_FALLBACK_MS[name];
  const root = documentRoot();
  if (!canRead(root)) return fallback;
  const style = getComputedStyle(root);
  const raw = style.getPropertyValue(`--duration-${name}`).trim();
  if (!raw) return fallback;
  const direct = parseCssTime(raw, Number.NaN);
  if (!Number.isNaN(direct)) return direct;

  const key = `${raw}|${style.getPropertyValue(MOTION_SCALE_PROPERTY).trim()}`;
  const hit = probed.get(name);
  if (hit && hit.key === key) return hit.ms;
  const ms = probeDuration(name, fallback);
  probed.set(name, { key, ms });
  return ms;
}
