import { fadeFrom, tileField, tileFieldSvg, tileFades, tilePoints } from "./tiles.ts";

describe("tile geometry", () => {
  it("is deterministic for a seed", () => {
    const a = tileField({ width: 300, height: 200, seed: 5 });
    const b = tileField({ width: 300, height: 200, seed: 5 });
    const c = tileField({ width: 300, height: 200, seed: 6 });
    expect(a).toEqual(b);
    expect(a.map((p) => p.filled)).not.toEqual(c.map((p) => p.filled));
  });

  it("cuts every hexagon into three rhombi in the logo's order", () => {
    const field = tileField({ width: 100, height: 100, radius: 40 });
    const tones = field.map((p) => p.tone);
    for (let i = 0; i < tones.length; i += 3) {
      expect(tones.slice(i, i + 3)).toEqual([0, 1, 2]);
      expect(new Set(field.slice(i, i + 3).map((p) => p.hex)).size).toBe(1);
    }
  });

  it("fills everything when solid", () => {
    expect(tileField({ width: 100, height: 100, solid: true }).every((p) => p.filled)).toBe(true);
  });

  it("is denser where the bias is higher", () => {
    const field = tileField({ width: 600, height: 200, radius: 20, bias: tileFades.ramp, seed: 9 });
    const xs = field.map((p) => Number(p.points.split(" ")[0].split(",")[0]));
    const left = field.filter((_, i) => xs[i] < 200);
    const right = field.filter((_, i) => xs[i] > 400);
    const density = (ps: typeof field) => ps.filter((p) => p.filled).length / ps.length;
    expect(density(right)).toBeGreaterThan(density(left) + 0.3);
  });

  it("fadeFrom peaks at its centre and never goes negative", () => {
    const bias = fadeFrom(0.5, 0.5);
    expect(bias(0.5, 0.5)).toBeCloseTo(0.95);
    expect(bias(0, 0)).toBeGreaterThanOrEqual(0);
    expect(bias(0.5, 0.5)).toBeGreaterThan(bias(0.9, 0.9));
  });

  it("serialises to an SVG that paints with the brand custom properties", () => {
    const svg = tileFieldSvg({ width: 120, height: 80, radius: 30, seed: 1, solid: true });
    expect(svg.startsWith("<svg xmlns=")).toBe(true);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain("var(--brand-orange, #EE5007)");
    // Hard edges, and the full grid drawn before the faces so nothing crosses a filled face.
    expect(svg).toContain('stroke-linejoin="miter"');
    expect(svg.indexOf('fill="none"')).toBeLessThan(svg.indexOf("var(--brand-orange-softer"));
    expect(svg.lastIndexOf('fill="none"')).toBeLessThan(svg.indexOf("var(--brand-orange-softer"));
    const faces = (svg.match(/var\(--brand-orange(?:-soft|-softer)?, #/g) ?? []).length / 2;
    const grid = (svg.match(/fill="none"/g) ?? []).length;
    expect(faces).toBe(grid);
  });

  it("serialises the Hadron palette with its own fallbacks", () => {
    const svg = tileFieldSvg(
      { width: 120, height: 80, radius: 30, seed: 1, solid: true },
      { palette: "hadron" },
    );
    expect(svg).toContain("var(--brand-hadron-deep, #004CCE)");
    expect(svg).not.toContain("orange");
  });

  it("exposes the parallelogram of a single tile", () => {
    expect(tilePoints.split(" ")).toHaveLength(4);
  });
});
