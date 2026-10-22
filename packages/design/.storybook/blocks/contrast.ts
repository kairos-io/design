// WCAG 2.x contrast arithmetic for the docs pages. Pure functions, no DOM.

export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb() and rgba(). Anything else (a var() reference, say) is null. */
export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      const parts = h.split("").map((c) => parseInt(c + c, 16));
      return [parts[0], parts[1], parts[2], h.length === 4 ? parts[3] / 255 : 1];
    }
    if (h.length === 6 || h.length === 8) {
      const parts = [0, 2, 4, 6].slice(0, h.length / 2).map((i) => parseInt(h.slice(i, i + 2), 16));
      return [parts[0], parts[1], parts[2], h.length === 8 ? parts[3] / 255 : 1];
    }
    return null;
  }
  const fn = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (fn) {
    return [Number(fn[1]), Number(fn[2]), Number(fn[3]), fn[4] === undefined ? 1 : Number(fn[4])];
  }
  return null;
}

/** Alpha-blends a colour over an opaque backdrop. */
export function composite(fg: RGBA, bg: RGB, alpha = fg[3]): RGB {
  return [0, 1, 2].map((i) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))) as RGB;
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance per WCAG 2.x. */
export function luminance([r, g, b]: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two opaque colours, 1 to 21. */
export function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA large" | "fail";

/** The level a ratio reaches for normal text (AA 4.5, AAA 7) or large text (AA large 3). */
export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}

export interface ContrastResult {
  ratio: number;
  level: WcagLevel;
}

/** Contrast of `ink` on `surface`, where either may carry alpha and is then blended over `backdrop`. */
export function contrastOn(ink: string, surface: string, backdrop?: string): ContrastResult | null {
  const i = parseColor(ink);
  const s = parseColor(surface);
  const b = backdrop ? parseColor(backdrop) : null;
  if (!i || !s) return null;
  if (!b && (i[3] < 1 || s[3] < 1)) return null;
  const base: RGB = b ? composite(b, [255, 255, 255]) : [s[0], s[1], s[2]];
  const surfaceRgb = s[3] < 1 ? composite(s, base) : ([s[0], s[1], s[2]] as RGB);
  const inkRgb = i[3] < 1 ? composite(i, surfaceRgb) : ([i[0], i[1], i[2]] as RGB);
  const ratio = contrast(inkRgb, surfaceRgb);
  return { ratio, level: wcagLevel(ratio) };
}

/** The soft tone fill the badges use: the tone at 15% over the page background, with the tone's -foreground as ink. */
export function toneContrast(tone: string, foreground: string, background: string): ContrastResult | null {
  const t = parseColor(tone);
  const bg = parseColor(background);
  const fg = parseColor(foreground);
  if (!t || !bg || !fg) return null;
  const surface = composite([t[0], t[1], t[2], 0.15], [bg[0], bg[1], bg[2]]);
  const ratio = contrast([fg[0], fg[1], fg[2]], surface);
  return { ratio, level: wcagLevel(ratio) };
}

export function formatRatio(ratio: number): string {
  return `${(Math.round(ratio * 100) / 100).toFixed(2)}:1`;
}
