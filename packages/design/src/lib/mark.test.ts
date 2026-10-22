import { groupCubes, kairosMarkTiles, parseMarkFaces, parsePoints, quadMotion } from "./mark.ts";
import { tileFaceMotion, tileHexagon } from "./tiles.ts";
import { logos } from "../components/Logo/logos.generated.ts";

const close = (a: number, b: number, tol = 0.05) => Math.abs(a - b) <= tol;

describe("the Kairos mark as tiles", () => {
  it("reads each rect through its matrix into a rhombus with its tone", () => {
    const faces = parseMarkFaces(logos["icon-color"]);
    expect(faces).toHaveLength(18);
    // The first rect: width 24.8171, matrix(-0.86601 0.500028 -3.2e-05 1 68.502 18.8594), the orange face.
    const [first] = faces;
    expect(first.tone).toBe(2);
    const expected = [
      [68.502, 18.859],
      [47.009, 31.269],
      [47.008, 56.086],
      [68.501, 43.676],
    ];
    first.points.forEach(([x, y], i) => {
      expect(close(x, expected[i][0])).toBe(true);
      expect(close(y, expected[i][1])).toBe(true);
    });
    // Every rhombus has four edges of the rect's side and corners of 60 and 120 degrees.
    for (const face of faces) {
      for (let i = 0; i < 4; i++) {
        const [ax, ay] = face.points[i];
        const [bx, by] = face.points[(i + 1) % 4];
        expect(close(Math.hypot(bx - ax, by - ay), 24.8171)).toBe(true);
      }
    }
    expect(parseMarkFaces(logos["icon-white"])).toHaveLength(0);
  });

  it("groups the eighteen rhombi into six cubes of three tones round a shared vertex", () => {
    const cubes = groupCubes(parseMarkFaces(logos["icon-color"]));
    expect(cubes).toHaveLength(6);
    for (const cube of cubes) {
      expect(cube.faces.map((f) => f.tone)).toEqual([0, 1, 2]);
      for (const face of cube.faces) {
        const [x, y] = face.points[face.vertex];
        expect(close(x, cube.centre[0], 0.1)).toBe(true);
        expect(close(y, cube.centre[1], 0.1)).toBe(true);
      }
    }
    // Eighteen distinct faces, each used once.
    const all = cubes.flatMap((c) => c.faces.map((f) => f.points.map((p) => p.join(",")).join(" ")));
    expect(new Set(all).size).toBe(18);
  });

  it("orders the cubes clockwise from the top, on a hexagonal ring with an empty centre, and records how each is turned", () => {
    const mark = kairosMarkTiles();
    expect(mark.viewBox).toEqual({ width: 137, height: 137 });
    expect(mark.cubes.map((c) => c.bearing)).toEqual([-60, 0, 60, 120, 180, -120]);
    // Every cube's centre is one hexagon's width from the middle, so the ring is the tile grid's.
    const middle = [mark.bbox.x + mark.bbox.width / 2, mark.bbox.y + mark.bbox.height / 2];
    const distances = mark.cubes.map((c) => Math.hypot(c.centre[0] - middle[0], c.centre[1] - middle[1]));
    for (const d of distances) expect(close(d, Math.sqrt(3) * 24.8171, 0.1)).toBe(true);
    // The cubes are not all laid out alike: the mark turns some of them, so
    // the same tone meets itself across a few neighbours. Each orientation
    // is the bearing of each tone's face from the cube's centre.
    const orientations = mark.cubes.map((c) => [c.orientation[0], c.orientation[1], c.orientation[2]]);
    expect(orientations).toHaveLength(6);
    for (const [light, mid, orange] of orientations) {
      // Three faces a third of a turn apart, in one of the two possible turns.
      const gaps = [mid - light, orange - mid, light - orange].map((g) => ((g % 360) + 360) % 360);
      expect(gaps.every((g) => g === 120) || gaps.every((g) => g === 240)).toBe(true);
    }
    expect(new Set(orientations.map((o) => o.join("/"))).size).toBeGreaterThan(1);
  });

  it("derives a face's own line and hinge frame from its points", () => {
    // The hexagon's top face, about its corner at the centre: the field's constants again.
    const top = parsePoints(tileHexagon(50, 50, 50)[0].points);
    const motion = quadMotion(top, 3);
    expect(motion.vertex).toEqual([50, 50]);
    expect(close(motion.from[0], tileFaceMotion[0].from[0])).toBe(true);
    expect(close(motion.from[1], tileFaceMotion[0].from[1])).toBe(true);
    // The frame maps the axes onto unit vectors along the two edges, and the inverse undoes it.
    const [a, b, c, d] = motion.matrix;
    expect(close(Math.hypot(a, b), 1)).toBe(true);
    expect(close(Math.hypot(c, d), 1)).toBe(true);
    const [ia, ib, ic, id] = motion.inverse;
    expect(close(a * ia + c * ib, 1)).toBe(true);
    expect(close(b * ia + d * ib, 0)).toBe(true);
    expect(close(a * ic + c * id, 0)).toBe(true);
    expect(close(b * ic + d * id, 1)).toBe(true);
    // The edges out of the vertex are 120 degrees apart, as every face of a cube is.
    const angle = (Math.acos(a * c + b * d) * 180) / Math.PI;
    expect(close(angle, 120, 0.1)).toBe(true);
    // A flipped cube's face: the same holds whatever way it is turned.
    const flipped = kairosMarkTiles().cubes.find((cube) => cube.orientation[0] !== -90)!;
    const face = flipped.faces[0];
    const m = quadMotion(face.points, face.vertex);
    expect(close(Math.hypot(m.from[0], m.from[1]), 1)).toBe(true);
    expect(
      close((Math.acos(m.matrix[0] * m.matrix[2] + m.matrix[1] * m.matrix[3]) * 180) / Math.PI, 120, 0.1),
    ).toBe(true);
  });
});
