import { motionDuration, parseCssTime } from "./motion.ts";

describe("parseCssTime", () => {
  it("reads ms and s, and falls back on anything else", () => {
    expect(parseCssTime("150ms", 1)).toBe(150);
    expect(parseCssTime(" 0.2s ", 1)).toBe(200);
    expect(parseCssTime("0ms", 1)).toBe(0);
    expect(parseCssTime("", 1)).toBe(1);
    expect(parseCssTime(undefined, 1)).toBe(1);
    expect(parseCssTime("fast", 1)).toBe(1);
  });
});

describe("motionDuration", () => {
  it("reads the token from the document and uses the stylesheet's number without it", () => {
    expect(motionDuration("fast")).toBe(150);
    const spy = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => (name === "--duration-fast" ? "0ms" : ""),
    } as unknown as CSSStyleDeclaration);
    try {
      expect(motionDuration("fast")).toBe(0);
      expect(motionDuration("base")).toBe(200);
    } finally {
      spy.mockRestore();
    }
  });
});
