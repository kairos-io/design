// @kairos-io/design: the Kairos design system for React.

// Components, sorted by name.
export * from "./components/Alert/index.ts";
export * from "./components/Badge/index.ts";
export * from "./components/Button/index.ts";
export * from "./components/Card/index.ts";
export * from "./components/Checkbox/index.ts";
export * from "./components/Chip/index.ts";
export * from "./components/Dialog/index.ts";
export * from "./components/EmptyState/index.ts";
export * from "./components/Field/index.ts";
export * from "./components/InfoTooltip/index.ts";
export * from "./components/Input/index.ts";
export * from "./components/Label/index.ts";
export * from "./components/Logo/index.ts";
export * from "./components/PageHeader/index.ts";
export * from "./components/SegmentedControl/index.ts";
export * from "./components/Select/index.ts";
export * from "./components/Separator/index.ts";
export * from "./components/Sidebar/index.ts";
export * from "./components/StatTile/index.ts";
export * from "./components/StatusBadge/index.ts";
export * from "./components/StatusDot/index.ts";
export * from "./components/Steps/index.ts";
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
  DARK_MEDIA_QUERY,
  DEFAULT_THEME_KEY,
  applyTheme,
  createTheme,
  getStoredTheme,
  inlineThemeScript,
  isThemeMode,
  resolveTheme,
  setStoredTheme,
  systemPrefersDark,
  type Theme,
  type ThemeMode,
} from "./lib/theme.ts";

// Helpers.
export { cn } from "./lib/cn.ts";
export { phaseTone, toneBg, toneSoft, toneText, type Tone } from "./lib/tone.ts";
export {
  fadeFrom,
  tileField,
  tileFieldSvg,
  tileFades,
  tileHexagon,
  tilePalettes,
  tilePoints,
} from "./lib/tiles.ts";

// Tokens, also available on their own from "@kairos-io/design/tokens".
export { tokens, brand, hadron, semanticLight, semanticDark, tones, breakpoints } from "./tokens/index.ts";
