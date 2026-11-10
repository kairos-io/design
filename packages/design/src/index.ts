// @kairos-io/design: the Kairos design system for React.

// Components, sorted by name.
export * from "./components/Alert/index.ts";
export * from "./components/AnnouncementBar/index.ts";
export * from "./components/Badge/index.ts";
export * from "./components/Button/index.ts";
export * from "./components/Card/index.ts";
export * from "./components/Checkbox/index.ts";
export * from "./components/Chip/index.ts";
export * from "./components/ChoiceCard/index.ts";
export * from "./components/CommandSample/index.ts";
export * from "./components/DescriptionList/index.ts";
export * from "./components/Dialog/index.ts";
export * from "./components/DocsNav/index.ts";
export * from "./components/EmptyState/index.ts";
export * from "./components/FeatureGrid/index.ts";
export * from "./components/Field/index.ts";
export * from "./components/FilterChip/index.ts";
export * from "./components/Gauge/index.ts";
export * from "./components/Hero/index.ts";
export * from "./components/InfoTooltip/index.ts";
export * from "./components/Input/index.ts";
export * from "./components/Label/index.ts";
export * from "./components/Logo/index.ts";
export * from "./components/PageHeader/index.ts";
export * from "./components/SegmentedControl/index.ts";
export * from "./components/Select/index.ts";
export * from "./components/Separator/index.ts";
export * from "./components/Sidebar/index.ts";
export * from "./components/SiteFooter/index.ts";
export * from "./components/SiteHeader/index.ts";
export * from "./components/SiteSection/index.ts";
export * from "./components/Slide/index.ts";
export * from "./components/StatTile/index.ts";
export * from "./components/StatusBadge/index.ts";
export * from "./components/StatusDot/index.ts";
export * from "./components/Steps/index.ts";
export * from "./components/Switch/index.ts";
export * from "./components/Table/index.ts";
export * from "./components/Tabs/index.ts";
export * from "./components/Terminal/index.ts";
export * from "./components/Textarea/index.ts";
export * from "./components/ThemeToggle/index.ts";
export * from "./components/Tiles/index.ts";
export {
  Toaster,
  toast,
  type ToasterProps,
  type ToastMessage,
  type ToastTone,
} from "./components/Toast/index.ts";

// Theme: the hook and the plain helpers for hosts without React in <head>.
export { useTheme, type UseThemeOptions, type UseThemeResult } from "./hooks/useTheme.ts";
export {
  BRAND_ATTRIBUTE,
  DARK_MEDIA_QUERY,
  DEFAULT_THEME_KEY,
  THEME_ATTRIBUTE,
  applyBrand,
  applyTheme,
  createTheme,
  getBrand,
  getStoredTheme,
  inlineThemeScript,
  isBrand,
  isThemeMode,
  resolveTheme,
  setStoredTheme,
  systemPrefersDark,
  type Brand,
  type Theme,
  type ThemeMode,
} from "./lib/theme.ts";

// Helpers.
export { cn } from "./lib/cn.ts";
export {
  DEFAULT_MOTION_SCALE,
  DURATION_FALLBACK_MS,
  MOTION_SCALE_PROPERTY,
  getMotionScale,
  motionDuration,
  setMotionScale,
  type MotionDuration,
} from "./lib/motion.ts";
export {
  phaseLook,
  phaseTone,
  toneBg,
  toneFill,
  toneSoft,
  toneStroke,
  toneText,
  type StatusLook,
  type Tone,
} from "./lib/tone.ts";
export {
  fadeFrom,
  tileField,
  tileFieldSvg,
  tileFades,
  tileHexagon,
  tilePalettes,
  tilePoints,
} from "./lib/tiles.ts";
export { tileBackground, tileGrain, tileVignette, type TileCube } from "./lib/tileBackground.ts";
export {
  canFollowCursor,
  useCursorField,
  type CursorPainter,
  type UseCursorFieldOptions,
  type ViewBoxPoint,
} from "./hooks/useCursorField.ts";

// Tokens, also available on their own from "@kairos-io/design/tokens".
// resolveTheme here is the token-map resolver; the one above resolves a mode.
export {
  brand,
  breakpoints,
  hadron,
  kairos,
  resolveTheme as resolveThemeTokens,
  status,
  themeDark,
  themeLight,
  themes,
  tokens,
  toneTokens,
  tones,
  variants,
} from "./tokens/index.ts";
export type { BrandColor, ThemeToken, TypeStep, Variant } from "./tokens/index.ts";
