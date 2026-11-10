import {
  fadeFrom,
  tileField,
  tileFieldSvg,
  tileFades,
  tileOutlineOpacity,
  tilePoints,
  tileWaveAxes,
  tileWaveAxis,
  tileWavePhase,
} from "./tiles.ts";

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
    // The grid is unique lattice edges in a path per opacity, with round caps; solid is one path at full strength.
    const grid = Array.from(svg.matchAll(/<path d="([^"]*)" fill="none"[^>]*>/g));
    expect(grid).toHaveLength(1);
    expect(grid[0][0]).toContain('stroke-linecap="round"');
    const faces = (svg.match(/var\(--kairos-(?:light|mid|orange), #/g) ?? []).length / 2;
    const edges = (grid[0][1].match(/M/g) ?? []).length;
    // Every face has four edges, each shared by two faces at most: fewer edges than four per face, more than one.
    expect(edges).toBeGreaterThan(faces);
    expect(edges).toBeLessThan(4 * faces);
    // Solid: every outline is full, so none carries an opacity.
    expect(svg).not.toContain("stroke-opacity");
  });

  it("serialises the outline opacity so the shipped files fade like the component", () => {
    const svg = tileFieldSvg({ width: 600, height: 200, radius: 20, seed: 9, bias: tileFades.ramp });
    // The grid is batched by opacity; an edge's strength is the stronger of its two cells', so a
    // filled face's edges are always full, and only the empty cells show the fade.
    const filledEdges = new Set<string>();
    for (const m of svg.matchAll(/<polygon points="([^"]*)" fill="var/g)) {
      const pts = m[1].split(" ");
      pts.forEach((a, i) => filledEdges.add([a, pts[(i + 1) % 4]].sort().join("|")));
    }
    const outlines = Array.from(svg.matchAll(/<path d="([^"]*)" fill="none"[^>]*\/>/g)).flatMap((m) => {
      const opacity = Number(/stroke-opacity="([\d.]+)"/.exec(m[0])?.[1] ?? 1);
      return Array.from(m[1].matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g))
        .filter((e) => !filledEdges.has([`${e[1]},${e[2]}`, `${e[3]},${e[4]}`].sort().join("|")))
        .map((e) => ({ x: Math.min(Number(e[1]), Number(e[3])), opacity }));
    });
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

  it("runs the wave from each fade's dense edge to its sparse one, and a custom bias from its denser side", () => {
    // Every preset: the axis is 0 where the fade peaks and grows away from it.
    for (const name of Object.keys(tileFades) as (keyof typeof tileFades)[]) {
      const bias = tileFades[name];
      const axis = tileWaveAxes[name];
      const samples = [0.05, 0.3, 0.5, 0.7, 0.95].flatMap((u) => [0.1, 0.5, 0.9].map((v) => [u, v] as const));
      const densest = samples.reduce((a, b) => (bias(...b) > bias(...a) ? b : a));
      expect(axis(...densest)).toBeLessThanOrEqual(0.2);
      for (const [u, v] of samples) expect(axis(u, v)).toBeGreaterThanOrEqual(axis(...densest) - 1e-9);
      expect(tileWaveAxis(name)).toBe(axis);
    }
    expect(tileWaveAxis((u) => u)(0.9, 0.5)).toBeCloseTo(0.1);
    expect(tileWaveAxis((u) => 1 - u)(0.9, 0.5)).toBeCloseTo(0.9);
    // The phase is the place along the axis, 0..1, nudged by less than a tenth per row and pure.
    const p = { u: 0.3, v: 0.5 };
    const phase = tileWavePhase(p, tileWaveAxes.right, 4);
    expect(phase).toBe(tileWavePhase(p, tileWaveAxes.right, 4));
    expect(Math.abs(phase - 0.7)).toBeLessThan(0.1);
    expect(tileWavePhase({ u: 1.2, v: 0 }, tileWaveAxes.left, 0)).toBeLessThanOrEqual(1);
    expect(tileWavePhase({ u: -0.2, v: 0 }, tileWaveAxes.left, -1)).toBeGreaterThanOrEqual(0);
    const rows = [0, 1, 2, 3, 4, 5, 6].map((row) => tileWavePhase(p, tileWaveAxes.right, row));
    expect(new Set(rows).size).toBeGreaterThan(3);
  });

  it("exposes the parallelogram of a single tile", () => {
    expect(tilePoints.split(" ")).toHaveLength(4);
  });
});
