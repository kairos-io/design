// @kairos-io/design: the Kairos design system for React.

// Components, sorted by name.
export * from "./components/Alert/index.ts";
export { AnnouncementBar, type AnnouncementBarProps } from "./components/AnnouncementBar/index.ts";
export * from "./components/Badge/index.ts";
export * from "./components/Button/index.ts";
export * from "./components/Card/index.ts";
export * from "./components/Checkbox/index.ts";
export * from "./components/Chip/index.ts";
export { CommandSample, type CommandSampleProps } from "./components/CommandSample/index.ts";
export * from "./components/Dialog/index.ts";
export {
  DocsNav,
  DocsToc,
  type DocsNavGroup,
  type DocsNavItem,
  type DocsNavProps,
  type DocsTocProps,
} from "./components/DocsNav/index.ts";
export * from "./components/EmptyState/index.ts";
export {
  FeatureCell,
  FeatureGrid,
  type FeatureCellProps,
  type FeatureGridProps,
} from "./components/FeatureGrid/index.ts";
export * from "./components/Field/index.ts";
export { Hero, type HeroProps } from "./components/Hero/index.ts";
export * from "./components/InfoTooltip/index.ts";
export * from "./components/Input/index.ts";
export * from "./components/Label/index.ts";
export * from "./components/Logo/index.ts";
export * from "./components/PageHeader/index.ts";
export * from "./components/SegmentedControl/index.ts";
export * from "./components/Select/index.ts";
export * from "./components/Separator/index.ts";
export * from "./components/Sidebar/index.ts";
export { SiteFooter, type SiteFooterColumn, type SiteFooterProps } from "./components/SiteFooter/index.ts";
export { SiteHeader, type SiteHeaderProps, type SiteLink } from "./components/SiteHeader/index.ts";
export {
  SectionHeading,
  SiteSection,
  type SectionHeadingProps,
  type SiteSectionProps,
} from "./components/SiteSection/index.ts";
export {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
  Slide,
  SlideAgenda,
  SlideClosing,
  SlideCode,
  SlideCodeKey,
  SlideDemo,
  SlideDivider,
  SlideImage,
  SlideLifecycle,
  SlideList,
  SlideNumber,
  SlideQuote,
  SlideScreenshot,
  SlideSpeaker,
  SlideStatement,
  SlideTable,
  SlideTerminal,
  SlideTitle,
  type SlideAgendaProps,
  type SlideBrand,
  type SlideClosingProps,
  type SlideCodeProps,
  type SlideDemoProps,
  type SlideDividerProps,
  type SlideImageProps,
  type SlideLifecycleProps,
  type SlideListProps,
  type SlideNumberProps,
  type SlideProps,
  type SlideQuoteProps,
  type SlideScreenshotProps,
  type SlideSpeakerProps,
  type SlideStatementProps,
  type SlideTableProps,
  type SlideTerminalLine,
  type SlideTerminalProps,
  type SlideTitleProps,
} from "./components/Slide/index.ts";
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
  BRAND_ATTRIBUTE,
  DARK_MEDIA_QUERY,
  DEFAULT_THEME_KEY,
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
