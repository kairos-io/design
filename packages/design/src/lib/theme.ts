// Theme mode helpers, no React: the useTheme hook builds on them, and a page
// that only needs to apply the stored mode (a login screen, the installer's
// theme.js) can call them directly.
//
// tokens.css reads the theme from <html>: `dark` or `light` as a class, or
// data-theme="dark|light". With neither present it follows the operating
// system, so applyTheme sets one of the two classes for an explicit choice
// and clears both for "system".

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

/** Sets `light` or `dark` on <html> for an explicit mode, and clears both for "system". */
export function applyTheme(mode: ThemeMode, root: HTMLElement = document.documentElement): void {
  root.classList.remove("light", "dark");
  if (mode !== "system") root.classList.add(mode);
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
    ');if(m==="light"||m==="dark"){document.documentElement.classList.add(m);}}catch(e){}})();'
  );
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
