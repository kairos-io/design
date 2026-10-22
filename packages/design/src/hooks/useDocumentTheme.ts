import { useSyncExternalStore } from "react";
import { DARK_MEDIA_QUERY, THEME_ATTRIBUTE, systemPrefersDark } from "../lib/theme.ts";

// tokens.css paints dark for data-theme="dark", light for "light", and follows
// the OS setting for anything else (a host in "system" mode leaves the
// attribute off), so the rendition a logo picks resolves the same way.
function readDocumentTheme(): "light" | "dark" {
  const attr = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  if (attr === "dark" || attr === "light") return attr;
  return systemPrefersDark() ? "dark" : "light";
}

function systemThemeQuery(): MediaQueryList | undefined {
  try {
    return typeof window.matchMedia === "function" ? window.matchMedia(DARK_MEDIA_QUERY) : undefined;
  } catch {
    return undefined;
  }
}

function subscribeDocumentTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  const query = systemThemeQuery();
  query?.addEventListener?.("change", onChange);
  return () => {
    observer.disconnect();
    query?.removeEventListener?.("change", onChange);
  };
}

const serverTheme = (): "light" | "dark" => "light";

/**
 * The theme on <html>, as the Storybook toolbar or a host sets data-theme,
 * or the OS setting while the attribute is off. Unlike useTheme it owns
 * nothing: it only reads, for a piece that must pick a rendition by the
 * theme (a logo, a srcdoc frame).
 *
 * The attribute is read as an external store rather than copied into state
 * from the observer: a store update re-renders in the same microtask as the
 * attribute change, so the logo swaps in the frame the tokens do, where a
 * state update from the observer painted the colour rendition on the dark
 * canvas for a frame first. The media query's change event lands the same way.
 */
export function useDocumentTheme(): "light" | "dark" {
  return useSyncExternalStore(subscribeDocumentTheme, readDocumentTheme, serverTheme);
}
