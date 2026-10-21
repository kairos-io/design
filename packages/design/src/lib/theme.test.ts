import {
  applyTheme,
  createTheme,
  getStoredTheme,
  inlineThemeScript,
  resolveTheme,
  setStoredTheme,
  systemPrefersDark,
} from "./theme.ts";

describe("theme helpers", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  it("falls back to system when nothing valid is stored", () => {
    expect(getStoredTheme()).toBe("system");
    localStorage.setItem("kairos-theme", "sideways");
    expect(getStoredTheme()).toBe("system");
  });

  it("round-trips a stored mode under a custom key", () => {
    setStoredTheme("dark", "auroraboot_theme");
    expect(getStoredTheme("auroraboot_theme")).toBe("dark");
    expect(getStoredTheme()).toBe("system");
  });

  it("survives localStorage being unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getStoredTheme()).toBe("system");
    expect(() => setStoredTheme("dark")).not.toThrow();
  });

  it("treats a missing matchMedia as a light preference", () => {
    const original = window.matchMedia;
    // @ts-expect-error jsdom has no matchMedia; make sure it being absent is fine too
    window.matchMedia = undefined;
    expect(systemPrefersDark()).toBe(false);
    expect(resolveTheme("system")).toBe("light");
    window.matchMedia = original;
  });

  it("resolves system from matchMedia", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    expect(resolveTheme("system")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
  });

  it("sets data-theme for an explicit mode and removes it for system", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    applyTheme("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("produces an inline script that applies the stored mode", () => {
    localStorage.setItem("my-key", "dark");
    const script = inlineThemeScript("my-key");
    expect(script).toContain('"my-key"');
    new Function(script)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("binds the helpers to one key with createTheme", () => {
    const theme = createTheme({ storageKey: "t" });
    theme.set("light");
    expect(localStorage.getItem("t")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(theme.get()).toBe("light");
    expect(theme.resolve()).toBe("light");
    expect(theme.inlineScript()).toContain('"t"');
  });
});
