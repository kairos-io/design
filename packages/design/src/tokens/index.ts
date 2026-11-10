// The Kairos design tokens as data, for charts, canvases and config files.
//
// tokens.json at the package root is the single source of truth, shared with
// the design decks in this repository: scripts/build.js writes tokens.css and
// tailwind.css from it, and scripts/check.js fails when a deck and the file
// disagree. This module is a typed view of the same file, so a value here is
// always the value the decks and the stylesheets carry.
import data from "./resolved.json" with { type: "json" };

export const tokens = data;
export default tokens;

/** The Kairos oranges and the Hadron blues, straight from the logos. They do not change with the theme. */
export const brand = data.color.brand;
export type BrandColor = keyof typeof brand;

/** The Kairos oranges alone, in the order of the mark: light on top, mid on the left, orange on the right. */
export const kairos = {
  light: brand["kairos-light"],
  mid: brand["kairos-mid"],
  orange: brand["kairos-orange"],
} as const;

/** The Hadron blues alone. Hadron swaps the accent and nothing else. */
export const hadron = {
  sky: brand["hadron-sky"],
  blue: brand["hadron-blue"],
  deep: brand["hadron-deep"],
} as const;

/** Node-state colours and the ink that sits on them. The same in both themes. */
export const status = data.color.status;

/** The tiles' status tones: three greens and three reds for a loader that has succeeded or failed. */
export const tile = data.color.tile;

/** The semantic colours: one value per theme, under the names the decks use (bg, ink, line, accent, ...). */
export const themes = data.themes;
export const themeLight = data.themes.light;
export const themeDark = data.themes.dark;
export type ThemeToken = keyof typeof data.themes.light;
export const themeTokens = Object.keys(data.themes.light) as ThemeToken[];

/**
 * The variants: a few screens change a few values. `hadron` is the one most
 * projects need, for the Hadron blue accent with white text on it. Set
 * data-variant="<name>" on the element that carries data-theme, or below it.
 */
export const variants = data.variants;
export type Variant = keyof typeof variants;

export type ThemeMode = keyof typeof data.themes;

/**
 * The effective token values for a theme, with a variant's values laid over
 * it: what an element under data-theme="dark" data-variant="hadron" reads.
 * Names the variant does not set keep the theme's value, as tokens.css does.
 */
export function resolveTheme(mode: ThemeMode, variant?: Variant): Record<ThemeToken, string> {
  const base = { ...data.themes[mode] } as Record<ThemeToken, string>;
  if (!variant) return base;
  const over = data.variants[variant][mode] as Partial<Record<ThemeToken, string>>;
  for (const name of themeTokens) {
    const v = over[name];
    if (v) base[name] = v;
  }
  return base;
}

export const font = data.font;
export const fonts = { sans: data.font.family.sans, mono: data.font.family.mono } as const;
export type TypeStep = keyof typeof data.font.size;

/** The spacing scale in px: 4, 8, 12, 16, 24, 32, 48, 80. Tailwind's step is 4px, so p-4 is 16px. */
export const space = data.space;
export const radius = data.radius;
export const layout = data.layout;
export const motion = data.motion;
export const rules = data.rules;

/** Responsive breakpoints in px (min-width): Tailwind's, which the components use through sm:, md:, lg:. */
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;

/** The status tones every badge, dot, banner and tile understands. */
export const tones = ["success", "warning", "danger", "info", "neutral"] as const;
export type Tone = (typeof tones)[number];

/**
 * What each tone paints with. The decks show status as a coloured diamond
 * beside ink text on a surface, so a tone has a fill and, for text that must
 * carry the tone itself, an ink that passes on the page. info and neutral
 * borrow the accent and the muted ink: the decks draw "upgrading" and
 * "installing" in the accent and "offline" in muted.
 */
export const toneTokens: Record<Tone, { fill: string; ink: string }> = {
  success: { fill: "status-healthy", ink: "ok" },
  warning: { fill: "status-warning", ink: "status-warning" },
  danger: { fill: "status-recovery", ink: "status-recovery" },
  info: { fill: "accent", ink: "link" },
  neutral: { fill: "muted", ink: "muted" },
};
