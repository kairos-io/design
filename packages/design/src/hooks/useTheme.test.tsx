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
