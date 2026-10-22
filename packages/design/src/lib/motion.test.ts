import {
  DEFAULT_MOTION_SCALE,
  MOTION_SCALE_PROPERTY,
  getMotionScale,
  motionDuration,
  parseCssTime,
  setMotionScale,
} from "./motion.ts";

describe("parseCssTime", () => {
  it("reads ms and s, and falls back on anything else", () => {
    expect(parseCssTime("150ms", 1)).toBe(150);
    expect(parseCssTime(" 0.2s ", 1)).toBe(200);
    expect(parseCssTime("0ms", 1)).toBe(0);
    expect(parseCssTime("", 1)).toBe(1);
    expect(parseCssTime(undefined, 1)).toBe(1);
    expect(parseCssTime("fast", 1)).toBe(1);
    // The scaled token's own text is not a time: it has to be resolved, not parsed.
    expect(parseCssTime("calc(150ms * 1)", 1)).toBe(1);
  });
});

describe("motionDuration", () => {
  it("reads the token from the document and uses the stylesheet's number without it", () => {
    expect(motionDuration("fast")).toBe(150);
    const spy = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => (name === "--duration-fast" ? "0ms" : ""),
    } as unknown as CSSStyleDeclaration);
    try {
      // A plain time is taken as it stands, synchronously: the reduced-motion
      // block writes a literal 0ms and Toaster removes the toast at once.
      expect(motionDuration("fast")).toBe(0);
      expect(motionDuration("base")).toBe(200);
    } finally {
      spy.mockRestore();
    }
  });

  it("resolves a scaled token through a probe element instead of parsing its text", () => {
    // jsdom resolves no var(), so the browser is stood in for: the root reports
    // the scaled token's text, and the element that is given it reports the
    // time the engine worked out.
    const scaled: Record<string, string> = {
      "--duration-fast": "calc(150ms * 0.5)",
      "--duration-base": "calc(200ms * 0.5)",
      "--duration-slow": "calc(360ms * 0.5)",
      [MOTION_SCALE_PROPERTY]: "0.5",
    };
    const probes: HTMLElement[] = [];
    setMotionScale(null); // Clears any cached probe from an earlier test.
    const spy = vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
      if (el === document.documentElement) {
        return { getPropertyValue: (name: string) => scaled[name] ?? "" } as unknown as CSSStyleDeclaration;
      }
      probes.push(el as HTMLElement);
      return { transitionDuration: "0.075s" } as unknown as CSSStyleDeclaration;
    });
    try {
      expect(motionDuration("fast")).toBe(75);
      // Probed once, then cached: the key is the token text and the scale.
      expect(motionDuration("fast")).toBe(75);
      expect(probes).toHaveLength(1);
      expect(probes[0].style.getPropertyValue("transition-duration")).toBe("var(--duration-fast)");
      // The probe does not stay in the document.
      expect(probes[0].isConnected).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("the motion scale", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(MOTION_SCALE_PROPERTY);
  });

  it("writes the scale on the root and reads it back", () => {
    expect(getMotionScale()).toBe(DEFAULT_MOTION_SCALE);
    setMotionScale(0.25);
    expect(document.documentElement.style.getPropertyValue(MOTION_SCALE_PROPERTY)).toBe("0.25");
    expect(getMotionScale()).toBe(0.25);
    setMotionScale(0);
    expect(getMotionScale()).toBe(0);
  });

  it("removes the property for null and for a value that is not a scale", () => {
    setMotionScale(2);
    setMotionScale(null);
    expect(document.documentElement.style.getPropertyValue(MOTION_SCALE_PROPERTY)).toBe("");
    expect(getMotionScale()).toBe(1);
    setMotionScale(2);
    setMotionScale(-1);
    expect(document.documentElement.style.getPropertyValue(MOTION_SCALE_PROPERTY)).toBe("");
    setMotionScale(2);
    setMotionScale(Number.NaN);
    expect(document.documentElement.style.getPropertyValue(MOTION_SCALE_PROPERTY)).toBe("");
  });

  it("writes and reads a scale on an element other than the root", () => {
    const section = document.createElement("section");
    document.body.appendChild(section);
    try {
      setMotionScale(2, section);
      expect(section.style.getPropertyValue(MOTION_SCALE_PROPERTY)).toBe("2");
      expect(document.documentElement.style.getPropertyValue(MOTION_SCALE_PROPERTY)).toBe("");
    } finally {
      section.remove();
    }
  });

  // With no document at all there is no root to write to; src/test/ssr.test.tsx
  // runs the helpers in a plain Node environment for that.
});
