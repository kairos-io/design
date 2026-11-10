import { tileField, tileGridPaths, tileHexagon } from "./tiles.ts";

/** The segments of a grid, as endpoint pairs. */
function segments(paths: ReturnType<typeof tileGridPaths>): { a: string; b: string; opacity: number }[] {
  return paths.flatMap((p) =>
    Array.from(p.d.matchAll(/M([\d.-]+) ([\d.-]+)L([\d.-]+) ([\d.-]+)/g)).map((m) => ({
      a: `${m[1]},${m[2]}`,
      b: `${m[3]},${m[4]}`,
      opacity: p.opacity,
    })),
  );
}
const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

describe("tileGridPaths", () => {
  it("draws every lattice edge exactly once: one hexagon has nine edges", () => {
    const paths = tileGridPaths(tileHexagon(50, 50, 50));
    expect(paths).toHaveLength(1);
    expect(paths[0].opacity).toBe(1);
    const segs = segments(paths);
    expect(segs).toHaveLength(9);
    expect(new Set(segs.map((s) => edgeKey(s.a, s.b))).size).toBe(9);
    // The three spokes from the centre and the six outer edges, on the polygons' own points.
    expect(segs.filter((s) => s.a === "50,50" || s.b === "50,50")).toHaveLength(3);
  });

  it("matches the lattice's unique-edge count for a small field, with no duplicates", () => {
    const polygons = tileField({ width: 160, height: 120, radius: 30, seed: 1, solid: true });
    const hexes = polygons.length / 3;
    // Adjacent hexagons, from their centres: a hexagon's width apart.
    // The top face of each hexagon is [p5, p0, p1, centre]: its last point is the centre.
    const centres = polygons
      .filter((p) => p.tone === 0)
      .map((p) => p.points.split(" ").at(-1)!.split(",").map(Number));
    let adjacent = 0;
    for (let i = 0; i < centres.length; i++) {
      for (let j = i + 1; j < centres.length; j++) {
        const d = Math.hypot(centres[i][0] - centres[j][0], centres[i][1] - centres[j][1]);
        if (Math.abs(d - Math.sqrt(3) * 30) < 0.5) adjacent++;
      }
    }
    const expected = 3 * hexes + 6 * hexes - adjacent;
    const segs = segments(tileGridPaths(polygons));
    expect(segs).toHaveLength(expected);
    expect(new Set(segs.map((s) => edgeKey(s.a, s.b))).size).toBe(expected);
    // Every edge of every polygon is in the grid, so a face always lands on its outline.
    const keys = new Set(segs.map((s) => edgeKey(s.a, s.b)));
    for (const p of polygons) {
      const pts = p.points.split(" ");
      pts.forEach((a, i) => expect(keys.has(edgeKey(a, pts[(i + 1) % 4]))).toBe(true));
    }
  });

  it("gives a shared edge the stronger of its cells' strengths, so a filled face's outline is always full, in ascending batches", () => {
    const polygons = tileField({ width: 400, height: 100, radius: 25, seed: 2, bias: (u) => u * 0.9 });
    const paths = tileGridPaths(polygons);
    expect(paths.length).toBeGreaterThan(3);
    expect(paths.length).toBeLessThanOrEqual(21);
    paths.forEach((p, i) => i > 0 && expect(p.opacity).toBeGreaterThan(paths[i - 1].opacity));
    const strength = new Map<string, number>();
    for (const s of segments(paths)) strength.set(edgeKey(s.a, s.b), s.opacity);
    for (const p of polygons) {
      const pts = p.points.split(" ");
      pts.forEach((a, i) => {
        const got = strength.get(edgeKey(a, pts[(i + 1) % 4]));
        // An edge whose two cells both round to nothing is not drawn at all.
        if (Math.round(p.outline * 20) === 0 && got === undefined) return;
        expect(got).toBeGreaterThanOrEqual(Math.round(p.outline * 20) / 20);
        if (p.filled) expect(got).toBe(1);
      });
    }
    // Nothing at zero strength is drawn at all.
    expect(paths.every((p) => p.opacity > 0)).toBe(true);
  });
});
