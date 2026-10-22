import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
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

  // On mount the mode is applied the way the inline <head> script applies it:
  // an explicit choice sets the attribute, and "system" leaves the document as
  // it is. Removing the attribute on mount would undo a theme the page already
  // carries (the Storybook toolbar's, a host's own default) the moment a
  // ThemeToggle appears, which painted the OS theme over a dark page for a
  // frame or for good. A change after mount, here or in another tab, applies
  // "system" in full by removing the attribute.
  const applied = useRef(mode);
  useEffect(() => {
    if (mode !== "system" || applied.current !== mode) applyTheme(mode);
    applied.current = mode;
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
