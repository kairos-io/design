import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useTheme } from "./useTheme.ts";

function Probe() {
  const { mode } = useTheme();
  return <span data-mode={mode} />;
}

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("renders the same first markup on the server and the client, then reads the stored mode", () => {
    window.localStorage.setItem("kairos-theme", "dark");
    const serverHtml = renderToString(<Probe />);
    expect(serverHtml).toContain('data-mode="system"');
    const { result } = renderHook(() => useTheme());
    // After the mount effect the stored choice is applied.
    expect(result.current.mode).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists and applies a chosen mode, and removes the attribute for system", () => {
    const { result } = renderHook(() => useTheme({ storageKey: "test-theme" }));
    act(() => result.current.setMode("light"));
    expect(window.localStorage.getItem("test-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    act(() => result.current.setMode("system"));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("leaves a theme the page already carries alone while the stored mode is system", () => {
    // The Storybook toolbar (or a host) set the attribute; a ThemeToggle mounting must not strip it.
    document.documentElement.setAttribute("data-theme", "dark");
    const { result, rerender } = renderHook(() => useTheme());
    expect(result.current.mode).toBe("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    rerender();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    // Choosing system after mount is a real choice and removes it.
    act(() => result.current.setMode("light"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    act(() => result.current.setMode("system"));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("applies an explicit stored mode on mount over whatever the page carries", () => {
    window.localStorage.setItem("kairos-theme", "light");
    document.documentElement.setAttribute("data-theme", "dark");
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("follows a change to system made in another tab", () => {
    window.localStorage.setItem("kairos-theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    act(() => {
      window.localStorage.setItem("kairos-theme", "system");
      window.dispatchEvent(new StorageEvent("storage", { key: "kairos-theme" }));
    });
    expect(result.current.mode).toBe("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("survives localStorage and matchMedia being unavailable", () => {
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
      const { result } = renderHook(() => useTheme());
      expect(result.current.mode).toBe("system");
      expect(result.current.resolved).toBe("light");
      act(() => result.current.setMode("dark"));
      expect(result.current.mode).toBe("dark");
    } finally {
      if (storage) Object.defineProperty(window, "localStorage", storage);
      window.matchMedia = media;
    }
  });
});
