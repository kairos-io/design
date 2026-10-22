import { act, renderHook } from "@testing-library/react";
import { useDocumentTheme } from "./useDocumentTheme.ts";

/** A matchMedia whose dark query answers `dark` and whose change event can be fired by the test. */
function mockMatchMedia(dark: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: dark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  window.matchMedia = (() => query) as unknown as typeof window.matchMedia;
  return {
    query,
    listeners,
    flip() {
      query.matches = !query.matches;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useDocumentTheme", () => {
  const media = window.matchMedia;
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.matchMedia = media;
  });

  it("reads data-theme on the first render, so a logo never mounts in the wrong rendition", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const { result } = renderHook(() => useDocumentTheme());
    expect(result.current).toBe("dark");
  });

  it("treats a missing or unknown attribute as light, with no storage and no matchMedia", () => {
    const storage = Object.getOwnPropertyDescriptor(window, "localStorage");
    const media = window.matchMedia;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    // @ts-expect-error simulating a browser without matchMedia
    window.matchMedia = undefined;
    try {
      expect(renderHook(() => useDocumentTheme()).result.current).toBe("light");
      document.documentElement.setAttribute("data-theme", "sideways");
      expect(renderHook(() => useDocumentTheme()).result.current).toBe("light");
    } finally {
      if (storage) Object.defineProperty(window, "localStorage", storage);
      window.matchMedia = media;
    }
  });

  it("follows the OS setting while the attribute is off, as tokens.css does in system mode", () => {
    const { flip } = mockMatchMedia(true);
    const { result } = renderHook(() => useDocumentTheme());
    expect(result.current).toBe("dark");
    act(() => flip());
    expect(result.current).toBe("light");
    act(() => flip());
    expect(result.current).toBe("dark");
  });

  it("lets the attribute win over the OS setting, and unknown values follow the OS", () => {
    mockMatchMedia(true);
    document.documentElement.setAttribute("data-theme", "light");
    expect(renderHook(() => useDocumentTheme()).result.current).toBe("light");
    document.documentElement.setAttribute("data-theme", "sideways");
    expect(renderHook(() => useDocumentTheme()).result.current).toBe("dark");
  });

  it("stops listening to the media query when unmounted", () => {
    const { listeners } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useDocumentTheme());
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });

  it("follows the attribute while mounted and stops when unmounted", async () => {
    const { result, unmount } = renderHook(() => useDocumentTheme());
    expect(result.current).toBe("light");
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "dark");
      // MutationObserver callbacks are microtasks; let them run.
      await Promise.resolve();
    });
    expect(result.current).toBe("dark");
    unmount();
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "light");
      await Promise.resolve();
    });
    expect(result.current).toBe("dark");
  });
});
