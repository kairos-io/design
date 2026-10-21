import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DARK_MEDIA_QUERY,
  DEFAULT_THEME_KEY,
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  systemPrefersDark,
  type ThemeMode,
} from "../lib/theme.ts";

export interface UseThemeOptions {
  /** The localStorage key the choice is kept under. Apps with an existing key pass it here. */
  storageKey?: string;
}

export interface UseThemeResult {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode(mode: ThemeMode): void;
}

// The stored mode is an external store: every hook instance reads the same
// value and re-renders when any of them, or another tab, changes it. When
// storage is blocked the choice lives here for the page's lifetime.
const modeListeners = new Set<() => void>();
const memory = new Map<string, ThemeMode>();

function subscribeMode(onChange: () => void): () => void {
  modeListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    modeListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function subscribeSystem(onChange: () => void): () => void {
  try {
    if (typeof window.matchMedia !== "function") return () => {};
    const mql = window.matchMedia(DARK_MEDIA_QUERY);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  } catch {
    return () => {};
  }
}

const serverMode = (): ThemeMode => "system";
const serverPrefersDark = () => false;

/**
 * Owns the theme mode: applies it to <html>, persists changes, and follows
 * the OS setting while the mode is "system".
 *
 * Server-rendered markup (Docusaurus) always says "system", and the client's
 * first render matches it before the stored choice is read, so there is no
 * hydration mismatch. The inline theme script in <head> keeps the page from
 * flashing in the meantime.
 */
export function useTheme({ storageKey = DEFAULT_THEME_KEY }: UseThemeOptions = {}): UseThemeResult {
  const mode = useSyncExternalStore(
    subscribeMode,
    () => memory.get(storageKey) ?? getStoredTheme(storageKey),
    serverMode,
  );
  const prefersDark = useSyncExternalStore(subscribeSystem, systemPrefersDark, serverPrefersDark);
  const resolved: "light" | "dark" = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const setMode = useCallback(
    (m: ThemeMode) => {
      setStoredTheme(m, storageKey);
      // Storage can be blocked; then the choice is kept in memory instead.
      if (getStoredTheme(storageKey) === m) memory.delete(storageKey);
      else memory.set(storageKey, m);
      modeListeners.forEach((l) => l());
    },
    [storageKey],
  );

  return { mode, resolved, setMode };
}
