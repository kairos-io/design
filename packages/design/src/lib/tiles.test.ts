import { fadeFrom, tileField, tileFieldSvg, tileFades, tileOutlineOpacity, tilePoints } from "./tiles.ts";

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

  it("fades the outlines with the bias and keeps a full outline under every filled face", () => {
    const field = tileField({ width: 600, height: 200, radius: 20, bias: tileFades.ramp, seed: 9 });
    const xs = field.map((p) => Number(p.points.split(" ")[0].split(",")[0]));
    const outlines = (ps: typeof field) => ps.filter((p) => !p.filled).map((p) => p.outline);
    const sparse = outlines(field.filter((_, i) => xs[i] < 60));
    const dense = outlines(field.filter((_, i) => xs[i] > 540));
    expect(sparse.length).toBeGreaterThan(0);
    expect(dense.length).toBeGreaterThan(0);
    // The sparse end dissolves: no outline above a fifth, the first column at nothing.
    expect(Math.max(...sparse)).toBeLessThan(0.2);
    expect(Math.min(...sparse)).toBe(0);
    // The dense end draws the full grid, measured against the field's own peak, not 1.
    expect(Math.min(...dense)).toBeGreaterThan(0.85);
    expect(Math.max(...field.map((p) => p.outline))).toBe(1);
    expect(field.every((p) => p.outline >= 0 && p.outline <= 1)).toBe(true);
    expect(field.filter((p) => p.filled).every((p) => p.outline === 1)).toBe(true);
    // The outline is monotonic in the weight, whichever fade or custom bias produced it.
    for (const bias of [
      ...Object.values(tileFades),
      (u: number, v: number) => Math.max(0, 1.05 - Math.hypot(u - 1, v - 0.45) * 1.35),
    ]) {
      const f = tileField({ width: 300, height: 200, radius: 25, bias, seed: 4 }).filter((p) => !p.filled);
      const sorted = [...f].sort((a, b) => a.weight - b.weight);
      for (let i = 1; i < sorted.length; i++)
        expect(sorted[i].outline).toBeGreaterThanOrEqual(sorted[i - 1].outline);
    }
  });

  it("keeps the complete grid when the bias is flat", () => {
    // No sparse edge to dissolve: a constant bias, or none at all, draws every outline in full.
    expect(tileField({ width: 100, height: 100, bias: () => 0 }).every((p) => p.outline === 1)).toBe(true);
    expect(
      tileField({ width: 100, height: 100, bias: () => 0.4, seed: 2 }).every((p) => p.outline === 1),
    ).toBe(true);
    expect(tileField({ width: 100, height: 100, solid: true }).every((p) => p.outline === 1)).toBe(true);
    expect(tileOutlineOpacity({ weight: 0.3, filled: false }, 0.6)).toBe(0.5);
    expect(tileOutlineOpacity({ weight: 0.3, filled: true }, 0.6)).toBe(1);
    expect(tileOutlineOpacity({ weight: 0, filled: false }, 0)).toBe(1);
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
    expect(svg).toContain("var(--kairos-orange, #EE5007)");
    // Hard edges, and the full grid drawn before the faces so nothing crosses a filled face.
    expect(svg).toContain('stroke-linejoin="miter"');
    expect(svg.indexOf('fill="none"')).toBeLessThan(svg.indexOf("var(--kairos-light"));
    expect(svg.lastIndexOf('fill="none"')).toBeLessThan(svg.indexOf("var(--kairos-light"));
    const faces = (svg.match(/var\(--kairos-(?:light|mid|orange), #/g) ?? []).length / 2;
    const grid = (svg.match(/fill="none"/g) ?? []).length;
    expect(faces).toBe(grid);
    // Solid: every outline is full, so none carries an opacity.
    expect(svg).not.toContain("stroke-opacity");
  });

  it("serialises the outline opacity so the shipped files fade like the component", () => {
    const svg = tileFieldSvg({ width: 600, height: 200, radius: 20, seed: 9, bias: tileFades.ramp });
    // A filled face keeps a full outline wherever it is, so only the empty cells show the fade.
    const filled = new Set(Array.from(svg.matchAll(/<polygon points="([^"]*)" fill="var/g)).map((m) => m[1]));
    const outlines = Array.from(svg.matchAll(/<polygon points="(-?[\d.]+),[^"]*" fill="none"[^>]*\/>/g))
      .filter((m) => !filled.has(/points="([^"]*)"/.exec(m[0])![1]))
      .map((m) => ({ x: Number(m[1]), opacity: Number(/stroke-opacity="([\d.]+)"/.exec(m[0])?.[1] ?? 1) }));
    expect(outlines.length).toBeGreaterThan(50);
    expect(outlines.filter((o) => o.x < 60).every((o) => o.opacity < 0.2)).toBe(true);
    expect(outlines.filter((o) => o.x > 540).every((o) => o.opacity > 0.85)).toBe(true);
    expect(svg).not.toContain('stroke-opacity="1"');
  });

  it("serialises the Hadron palette with its own fallbacks", () => {
    const svg = tileFieldSvg(
      { width: 120, height: 80, radius: 30, seed: 1, solid: true },
      { palette: "hadron" },
    );
    expect(svg).toContain("var(--hadron-deep, #004CCE)");
    expect(svg).not.toContain("orange");
  });

  it("exposes the parallelogram of a single tile", () => {
    expect(tilePoints.split(" ")).toHaveLength(4);
  });
});
