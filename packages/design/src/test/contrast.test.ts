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

  it("measures ink on a surface, and the soft tone fill the badges use", () => {
    const onOrange = contrastOn("#FFFFFF", "#EE5007");
    expect(onOrange?.ratio).toBeGreaterThan(3);
    const soft = toneContrast("#1A9A52", "#12733C", "#ffffff");
    expect(soft?.ratio).toBeGreaterThan(4.5);
    expect(contrastOn("var(--x)", "#fff")).toBeNull();
    expect(formatRatio(4.123)).toBe("4.12:1");
  });
});
