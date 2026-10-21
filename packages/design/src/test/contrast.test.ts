import {
  composite,
  contrast,
  contrastOn,
  formatRatio,
  luminance,
  parseColor,
  toneContrast,
  wcagLevel,
} from "../../.storybook/blocks/contrast.ts";
import { brand, status, themeDark, themeLight, variants } from "../tokens/index.ts";

describe("contrast helpers", () => {
  it("parses hex and rgb() forms", () => {
    expect(parseColor("#fff")).toEqual([255, 255, 255, 1]);
    expect(parseColor("#EE5007")).toEqual([238, 80, 7, 1]);
    expect(parseColor("#0000007f")?.[3]).toBeCloseTo(0.498, 2);
    expect(parseColor("rgba(255, 255, 255, 0.1)")).toEqual([255, 255, 255, 0.1]);
    expect(parseColor("var(--danger)")).toBeNull();
  });

  it("blends alpha over a backdrop", () => {
    expect(composite([0, 0, 0, 0.5], [255, 255, 255])).toEqual([128, 128, 128]);
  });

  it("computes the textbook ratios", () => {
    expect(luminance([255, 255, 255])).toBeCloseTo(1, 5);
    expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrast([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 5);
  });

  it("grades ratios against WCAG", () => {
    expect(wcagLevel(21)).toBe("AAA");
    expect(wcagLevel(4.6)).toBe("AA");
    expect(wcagLevel(3.2)).toBe("AA large");
    expect(wcagLevel(2)).toBe("fail");
  });

  it("measures ink on a surface, and a soft tone fill", () => {
    const onOrange = contrastOn(themeLight.ink, brand["kairos-orange"]);
    expect(onOrange?.ratio).toBeGreaterThan(4.5);
    const soft = toneContrast(status.healthy, themeLight.ok, themeLight.surface);
    expect(soft?.ratio).toBeGreaterThan(3);
    expect(contrastOn("var(--x)", "#fff")).toBeNull();
    expect(formatRatio(4.123)).toBe("4.12:1");
  });
});

// The pairs the components put together must pass AA in both themes. The
// Foundations deck states the two accent pairs; the rest follow from the
// token values, so a token change that breaks a pair fails here.
const pairs: [string, string, string][] = [
  ["ink on bg", "ink", "bg"],
  ["sub on bg", "sub", "bg"],
  ["muted on bg", "muted", "bg"],
  ["ink on surface", "ink", "surface"],
  ["sub on surface", "sub", "surface"],
  ["muted on surface", "muted", "surface"],
  ["link on bg", "link", "bg"],
  ["onAccent on accent", "onAccent", "accent"],
  ["bg on ink", "bg", "ink"],
  ["ok on bg", "ok", "bg"],
  ["codeInk on code", "codeInk", "code"],
  ["ink on raised", "ink", "raised"],
  ["muted on raised", "muted", "raised"],
];

describe.each(["light", "dark"] as const)("%s theme contrast", (mode) => {
  const theme = mode === "light" ? themeLight : themeDark;
  it.each(pairs)("%s passes AA for normal text", (_label, ink, surface) => {
    const r = contrastOn(theme[ink as keyof typeof theme], theme[surface as keyof typeof theme], theme.bg);
    expect(r?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });

  it("white on Hadron blue passes for large and bold text", () => {
    const v = variants.hadron[mode];
    const r = contrastOn(v.onAccent, v.accent, theme.bg);
    expect(r?.ratio ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("white on Hadron deep passes for normal text", () => {
    expect(contrastOn(status.ink, brand["hadron-deep"], theme.bg)?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });

  it("white on the recovery red passes for normal text", () => {
    expect(contrastOn(status.ink, status.recovery, theme.bg)?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });
});
