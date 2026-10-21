// Theme mode helpers, no React: the useTheme hook builds on them, and a page
// that only needs to apply the stored mode (a login screen, the installer's
// theme.js) can call them directly.
//
// tokens.css reads the theme from data-theme="light|dark" on <html> (or on
// any element, to theme a part of a page). With the attribute absent it
// follows the operating system, so applyTheme sets it for an explicit choice
// and removes it for "system".

export type ThemeMode = "system" | "light" | "dark";

export const DEFAULT_THEME_KEY = "kairos-theme";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function isThemeMode(v: unknown): v is ThemeMode {
  return v === "system" || v === "light" || v === "dark";
}

/** The stored mode, or "system" when nothing valid is stored or storage cannot be read. */
export function getStoredTheme(storageKey: string = DEFAULT_THEME_KEY): ThemeMode {
  try {
    const v = window.localStorage.getItem(storageKey);
    return isThemeMode(v) ? v : "system";
  } catch {
    return "system";
  }
}

export function setStoredTheme(mode: ThemeMode, storageKey: string = DEFAULT_THEME_KEY): void {
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Storage blocked: the mode still applies for this page load.
  }
}

export function systemPrefersDark(): boolean {
  try {
    return typeof window.matchMedia === "function" && window.matchMedia(DARK_MEDIA_QUERY).matches;
  } catch {
    return false;
  }
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

export const THEME_ATTRIBUTE = "data-theme";

/** Sets data-theme="light" or "dark" on <html> for an explicit mode, and removes it for "system". */
export function applyTheme(mode: ThemeMode, root: HTMLElement = document.documentElement): void {
  if (mode === "system") root.removeAttribute(THEME_ATTRIBUTE);
  else root.setAttribute(THEME_ATTRIBUTE, mode);
}

/**
 * The no-flash snippet for <head>: applies the stored mode before any
 * stylesheet paints. Inline it as `<script>${inlineThemeScript()}</script>`.
 * With no stored choice it sets nothing, and tokens.css follows the OS.
 */
export function inlineThemeScript(storageKey: string = DEFAULT_THEME_KEY): string {
  const key = JSON.stringify(storageKey);
  return (
    "(function(){try{var m=localStorage.getItem(" +
    key +
    ');if(m==="light"||m==="dark"){document.documentElement.setAttribute("data-theme",m);}}catch(e){}})();'
  );
}

/**
 * The brand a page carries. Kairos is the default; Hadron is the same system
 * with the Hadron blue accent, white ink on it and the Hadron links, which
 * tokens.css applies under data-variant="hadron". A page sets it once on
 * <html> (hadron-linux.io), or on a section that belongs to Hadron.
 */
export type Brand = "kairos" | "hadron";

export const BRAND_ATTRIBUTE = "data-variant";

export function isBrand(v: unknown): v is Brand {
  return v === "kairos" || v === "hadron";
}

/** Sets data-variant="hadron" on the root for Hadron, and removes it for Kairos. */
export function applyBrand(brand: Brand, root: HTMLElement = document.documentElement): void {
  if (brand === "hadron") root.setAttribute(BRAND_ATTRIBUTE, "hadron");
  else if (root.getAttribute(BRAND_ATTRIBUTE) === "hadron") root.removeAttribute(BRAND_ATTRIBUTE);
}

/** The brand the root carries: "hadron" under data-variant="hadron", otherwise "kairos". */
export function getBrand(root: HTMLElement = document.documentElement): Brand {
  return root.getAttribute(BRAND_ATTRIBUTE) === "hadron" ? "hadron" : "kairos";
}

export interface Theme {
  storageKey: string;
  get(): ThemeMode;
  set(mode: ThemeMode): void;
  apply(mode?: ThemeMode): void;
  resolve(mode?: ThemeMode): "light" | "dark";
  inlineScript(): string;
}

/** The helpers bound to one storage key, for apps that keep their own (AuroraBoot uses "auroraboot_theme"). */
export function createTheme({ storageKey = DEFAULT_THEME_KEY }: { storageKey?: string } = {}): Theme {
  return {
    storageKey,
    get: () => getStoredTheme(storageKey),
    set: (mode) => {
      setStoredTheme(mode, storageKey);
      applyTheme(mode);
    },
    apply: (mode = getStoredTheme(storageKey)) => applyTheme(mode),
    resolve: (mode = getStoredTheme(storageKey)) => resolveTheme(mode),
    inlineScript: () => inlineThemeScript(storageKey),
  };
}
