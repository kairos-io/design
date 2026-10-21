// The Kairos design tokens: the single source of truth for every visual
// foundation. scripts/build-tokens.ts turns this file into
// src/styles/tokens.css (plain CSS custom properties) and src/styles/theme.css
// (the Tailwind v4 @theme mapping), so edit the values here, never there.
//
// The values are the ones the Kairos web projects already ship: AuroraBoot's
// ui/src/index.css, the Kairos web installer's style.css and kairos-docs'
// custom.css. The brand colours are the fills of the CNCF Kairos artwork.

/** The three oranges of the Kairos mark, plus the navy the docs and app chrome use. */
export const brand = {
  orange: "#EE5007",
  orangeSoft: "#FF7442",
  orangeSofter: "#FB9E70",
  navy: "#03153A",
  white: "#FFFFFF",
  gray: "#E2E7EB",
  grayBlue: "#E1E5EE",
} as const;

/**
 * The Hadron blues, from the Hadron Linux logo. Hadron swaps the accent and
 * nothing else: same tokens, same components, blue where Kairos is orange.
 * White ink on Hadron blue and Deep; navy ink on Sky.
 */
export const hadron = {
  sky: "#1BAAFF",
  blue: "#0275E7",
  deep: "#004CCE",
} as const;

/**
 * Brand aliases under the names kairos-docs already uses, so the docs can
 * replace its own palette block with tokens.css without renaming anything.
 */
export const brandAliases: Record<string, string> = {
  "kairos-orange": brand.orange,
  "kairos-softer-orange": brand.orangeSoft,
  "kairos-softest-orange": brand.orangeSofter,
  "kairos-primary": brand.navy,
  "kairos-secondary": brand.grayBlue,
  "kairos-white": brand.white,
  "kairos-gray": brand.gray,
};

/** The status tones every status badge, dot, banner and tile understands. */
export const tones = ["success", "warning", "danger", "info", "neutral"] as const;
export type Tone = (typeof tones)[number];

/**
 * Semantic colour tokens, in the order AuroraBoot declares them. Each key is
 * the CSS custom property name without the leading dashes; the component
 * classes refer to them through the Tailwind theme (bg-primary, text-muted-foreground, ...).
 */
export const semanticLight = {
  background: "#ffffff",
  foreground: "#0f172a",
  card: "#ffffff",
  "card-foreground": "#0f172a",
  popover: "#ffffff",
  "popover-foreground": "#0f172a",
  primary: brand.orange,
  "primary-hover": brand.orangeSoft,
  "primary-foreground": "#FFFFFF",
  "primary-soft": "#FFF0E8",
  navy: brand.navy,
  secondary: "#f1f5f9",
  "secondary-foreground": brand.navy,
  muted: "#f1f5f9",
  "muted-foreground": "#5b6879",
  accent: "#F1F5F9",
  "accent-foreground": "#0F172A",
  destructive: "var(--danger)",
  "destructive-foreground": "#ffffff",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: brand.orangeSoft,
  success: "#1A9A52",
  "success-foreground": "#12733C",
  warning: "#C98A04",
  "warning-foreground": "#8F6200",
  danger: "#D6372C",
  "danger-foreground": "#A8261D",
  info: "#2F6FE0",
  "info-foreground": "#1F53B5",
  neutral: "#8A94A8",
  "neutral-foreground": "#56607A",
  "sidebar-bg": "var(--navy)",
  "sidebar-fg": "#e2e8f0",
  "sidebar-fg-muted": "#8C96A8",
  "sidebar-accent": brand.orange,
  "sidebar-muted": "rgba(255, 255, 255, 0.1)",
  "terminal-bg": "var(--navy)",
  "terminal-fg": "#e2e8f0",
  "terminal-error": "#FF8A82",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export type SemanticToken = keyof typeof semanticLight;

export const semanticDark: Record<SemanticToken, string> = {
  background: "#1a1e25",
  foreground: "#f1f5f9",
  card: "#232830",
  "card-foreground": "#f1f5f9",
  popover: "#232830",
  "popover-foreground": "#f1f5f9",
  primary: brand.orangeSoft,
  "primary-hover": "#FF8A5C",
  "primary-foreground": "#0F172A",
  "primary-soft": "#2A1A14",
  navy: "#111419",
  secondary: "#2d3341",
  "secondary-foreground": "#f1f5f9",
  muted: "#2d3341",
  "muted-foreground": "#94a3b8",
  accent: "#2D3341",
  "accent-foreground": "#F1F5F9",
  destructive: "var(--danger)",
  "destructive-foreground": "#0F172A",
  border: "#334155",
  input: "#334155",
  ring: brand.orange,
  success: "#3CC97A",
  "success-foreground": "#5FDC95",
  warning: "#EAB308",
  "warning-foreground": "#F4C93F",
  danger: "#FF5F55",
  "danger-foreground": "#FF8A82",
  info: "#5D93FF",
  "info-foreground": "#8AB0FF",
  neutral: "#6F7A91",
  "neutral-foreground": "#A3ADC2",
  "sidebar-bg": "var(--navy)",
  "sidebar-fg": "#e2e8f0",
  "sidebar-fg-muted": "#8C96A8",
  "sidebar-accent": brand.orangeSoft,
  "sidebar-muted": "rgba(255, 255, 255, 0.08)",
  "terminal-bg": "#03153A",
  "terminal-fg": "#e2e8f0",
  "terminal-error": "#FF8A82",
  overlay: "rgba(0, 0, 0, 0.7)",
};

/** Font stacks. Noto Sans is the brand face; the installer must work with no network, so the fallbacks matter. */
export const fonts = {
  sans: '"Noto Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace',
} as const;

/** The type scale, in px, as the apps and docs set it. */
export const typography = {
  family: fonts,
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  /** name -> [font-size px, line-height px, letter-spacing] */
  scale: {
    overline: [10, 14, "0.05em"],
    caption: [12, 16, "normal"],
    small: [13, 18, "normal"],
    body: [14, 20, "normal"],
    "body-lg": [16, 24, "normal"],
    lead: [18, 28, "normal"],
    h4: [16, 24, "-0.01em"],
    h3: [20, 28, "-0.01em"],
    h2: [24, 32, "-0.02em"],
    h1: [30, 36, "-0.025em"],
    display: [48, 56, "-0.025em"],
  },
} as const;

/** Border radius: AuroraBoot's --radius with its derived steps, plus the pill. */
export const radius = {
  base: "0.625rem",
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
  full: "9999px",
} as const;

/** Elevation. These match the Tailwind defaults the apps use, so `shadow-sm` and `--shadow-sm` agree. */
export const shadows = {
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  focus: "0 0 0 2px var(--ring)",
} as const;

/** The 4px spacing scale (Tailwind's), in px, with the steps the apps actually use. */
export const spacing = {
  base: 4,
  steps: [0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64] as const,
} as const;

/** Responsive breakpoints in px (min-width). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Layout measures the apps share. */
export const layout = {
  sidebarWidth: 240,
  sidebarRailWidth: 56,
  sidebarDrawerWidth: 288,
  topbarHeight: 56,
  contentMaxWidth: 1080,
  narrowMaxWidth: 760,
  fieldMaxWidth: 640,
} as const;

/** Motion: one easing, three durations, all suppressed under prefers-reduced-motion. */
export const motion = {
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  duration: { fast: "150ms", base: "200ms", slow: "360ms" },
} as const;

export const tokens = {
  brand,
  hadron,
  brandAliases,
  tones,
  semanticLight,
  semanticDark,
  fonts,
  typography,
  radius,
  shadows,
  spacing,
  breakpoints,
  layout,
  motion,
} as const;

export default tokens;
