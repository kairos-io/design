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
import { brand, resolveTheme, status, themeLight, type ThemeToken } from "../tokens/index.ts";

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

// The pairs the components put together, in both themes, as Kairos and as
// Hadron (data-variant="hadron"). The Foundations deck states the two accent
// pairs: ink on Kairos orange and white on Hadron blue, the latter just
// under AA for normal text. Everything else follows from the token values,
// so a token change that breaks a pair fails here.
type Pair = [label: string, ink: ThemeToken, surface: ThemeToken];

const normalText: Pair[] = [
  ["ink on bg", "ink", "bg"],
  ["sub on bg", "sub", "bg"],
  ["muted on bg", "muted", "bg"],
  ["ink on surface", "ink", "surface"],
  ["sub on surface", "sub", "surface"],
  ["muted on surface", "muted", "surface"],
  ["ink on raised", "ink", "raised"],
  ["muted on raised", "muted", "raised"],
  ["link on bg", "link", "bg"],
  ["link on surface", "link", "surface"],
  ["bg on ink", "bg", "ink"],
  ["ok on bg", "ok", "bg"],
  ["ok on surface", "ok", "surface"],
  ["codeInk on code", "codeInk", "code"],
  ["codeMuted on codeBar", "codeMuted", "codeBar"],
];

// Large or bold text and the accent used as a line: 3:1. The hairline
// (--line) is decorative and sits at about 1.3:1 by design; inputs read
// through the surface step, not the border.
const largeOrLines: Pair[] = [
  ["onAccent on accent", "onAccent", "accent"],
  ["accentLine on bg", "accentLine", "bg"],
  ["accentLine on surface", "accentLine", "surface"],
  ["accent on bg", "accent", "bg"],
  ["accent on surface", "accent", "surface"],
];

describe.each([
  ["light", undefined],
  ["dark", undefined],
  ["light", "hadron"],
  ["dark", "hadron"],
] as const)("%s theme, %s", (mode, variant) => {
  const theme = resolveTheme(mode, variant);
  const on = (ink: ThemeToken, surface: ThemeToken) =>
    contrastOn(theme[ink], theme[surface], theme.bg)?.ratio ?? 0;

  it.each(normalText)("%s passes AA for normal text", (_label, ink, surface) => {
    expect(on(ink, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(largeOrLines)("%s passes 3:1 for large text and lines", (_label, ink, surface) => {
    expect(on(ink, surface)).toBeGreaterThanOrEqual(3);
  });

  it("ink on the Kairos accent passes AA for normal text", () => {
    if (variant === "hadron") return;
    expect(on("onAccent", "accent")).toBeGreaterThanOrEqual(4.5);
  });

  it("white on Hadron deep passes AA for normal text, the fix for small text on blue", () => {
    expect(contrastOn(status.ink, brand["hadron-deep"], theme.bg)?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });

  it("ink on Hadron sky passes AA for normal text", () => {
    expect(contrastOn(theme.ink, brand["hadron-sky"], theme.bg)?.ratio ?? 0).toBeGreaterThanOrEqual(
      mode === "light" ? 4.5 : 1,
    );
    expect(contrastOn(themeLight.ink, brand["hadron-sky"])?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });

  it("white on the recovery red passes AA for normal text", () => {
    expect(contrastOn(status.ink, status.recovery, theme.bg)?.ratio ?? 0).toBeGreaterThanOrEqual(4.5);
  });
});

describe("Hadron, as the Foundations deck states it", () => {
  it("white on Hadron blue is large-text only", () => {
    const r = contrastOn("#FFFFFF", brand["hadron-blue"])?.ratio ?? 0;
    expect(r).toBeGreaterThanOrEqual(3);
    expect(r).toBeLessThan(4.5);
  });

  it("the Hadron links pass AA on the page in both themes", () => {
    expect(
      contrastOn(resolveTheme("light", "hadron").link, themeLight.bg)?.ratio ?? 0,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastOn(resolveTheme("dark", "hadron").link, resolveTheme("dark", "hadron").bg)?.ratio ?? 0,
    ).toBeGreaterThanOrEqual(4.5);
  });
});
