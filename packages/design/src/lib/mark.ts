// The Kairos mark as tiles: the eighteen rhombi of the icon artwork, read
// from the generated logo data, grouped into the six cubes they make, with
// the geometry a face needs to assemble or unfold on its own. Everything is
// pure and derived from the artwork, so the ring loader is the logo to the
// point, flipped cubes included: the mark does not lay every cube out the
// same way, and nothing here assumes it does.
import { logos, type LogoData } from "../components/Logo/logos.generated.ts";
import type { TileTone } from "./tiles.ts";

export type Point = [number, number];

/** One rhombus of the mark. */
export interface MarkFace {
  /** The four corners in the icon's viewBox units, from the rect through its matrix. */
  points: Point[];
  tone: TileTone;
  /** Index into `points` of the corner at the cube's centre, where its three faces meet. */
  vertex: number;
}

/** Three rhombi meeting at one point, in tone order. */
export interface MarkCube {
  centre: Point;
  faces: MarkFace[];
  /** Where the cube sits: degrees from the mark's centre, y down, so -90 is straight up and 0 is to the right. */
  bearing: number;
  /**
   * How the cube is turned: per tone, the degrees from the cube's centre to
   * that face's middle. The hexagon layout of `tileHexagon` is light at -90,
   * mid at 150, orange at 30; a flipped cube reads differently.
   */
  orientation: Record<TileTone, number>;
}

export interface KairosMarkTiles {
  viewBox: { width: number; height: number };
  /** The box round the eighteen rhombi. */
  bbox: { x: number; y: number; width: number; height: number };
  /** The cubes clockwise from the top: the first is the one nearest twelve o'clock going clockwise. */
  cubes: MarkCube[];
}

const TONE_BY_FILL: Record<string, TileTone> = { "#fb9e70": 0, "#ff7442": 1, "#ee5007": 2 };

/**
 * The rhombi of an icon's generated data: each rect's four corners through
 * its transform matrix, with the tone its fill names. Only rects with a
 * brand fill count, so a one-colour rendition parses to nothing.
 */
export function parseMarkFaces(data: LogoData): Omit<MarkFace, "vertex">[] {
  const faces: Omit<MarkFace, "vertex">[] = [];
  for (const shape of data.shapes) {
    if (shape.tag !== "rect") continue;
    const tone = TONE_BY_FILL[(shape.attrs.fill ?? "").toLowerCase()];
    if (tone === undefined) continue;
    const w = Number(shape.attrs.width);
    const h = Number(shape.attrs.height);
    const m = (shape.attrs.transform ?? "").match(/matrix\(([^)]*)\)/);
    const [a, b, c, d, e, f] = m
      ? m[1]
          .trim()
          .split(/[\s,]+/)
          .map(Number)
      : [1, 0, 0, 1, 0, 0];
    const x0 = Number(shape.attrs.x ?? 0);
    const y0 = Number(shape.attrs.y ?? 0);
    const corners: Point[] = [
      [x0, y0],
      [x0 + w, y0],
      [x0 + w, y0 + h],
      [x0, y0 + h],
    ];
    faces.push({ points: corners.map(([x, y]): Point => [a * x + c * y + e, b * x + d * y + f]), tone });
  }
  return faces;
}

/** The interior angle at corner `i` of a quad, in degrees. */
function cornerAngle(points: Point[], i: number): number {
  const [px, py] = points[i];
  const [nx, ny] = points[(i + 1) % 4];
  const [qx, qy] = points[(i + 3) % 4];
  const a = Math.atan2(ny - py, nx - px);
  const b = Math.atan2(qy - py, qx - px);
  let deg = (Math.abs(a - b) * 180) / Math.PI;
  if (deg > 180) deg = 360 - deg;
  return deg;
}

function centroid(points: Point[]): Point {
  return [
    points.reduce((s, [x]) => s + x, 0) / points.length,
    points.reduce((s, [, y]) => s + y, 0) / points.length,
  ];
}

/** Degrees from one point to another, y down, in (-180, 180]: -90 is straight up, 0 to the right. */
function bearing(from: Point, to: Point): number {
  const deg = Math.round((Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI);
  return deg <= -180 ? deg + 360 : deg === 0 ? 0 : deg;
}

/**
 * The artwork's rects meet at shared corners to within a hundredth of a
 * unit, not exactly (a matrix of -3.2e-05 here, 0.499972 there). Every
 * corner within a twentieth of a unit of an earlier one takes that one's
 * coordinates, so neighbouring faces, and the grid drawn from them, share
 * the same point to the digit.
 */
export function snapVertices<T extends { points: Point[] }>(faces: T[], tolerance = 0.05): T[] {
  const seen: Point[] = [];
  const snap = ([x, y]: Point): Point => {
    const hit = seen.find(([sx, sy]) => Math.hypot(sx - x, sy - y) <= tolerance);
    if (hit) return hit;
    const point: Point = [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
    seen.push(point);
    return point;
  };
  return faces.map((face) => ({ ...face, points: face.points.map(snap) }));
}

/**
 * Groups rhombi into cubes. A cube's centre is a point where three faces
 * meet, each with its obtuse corner there: the three 120 degree corners
 * make the full turn. Two neighbouring cubes also meet in points, but
 * with acute corners, so those do not count.
 */
export function groupCubes(faces: Omit<MarkFace, "vertex">[], tolerance = 0.1): MarkCube[] {
  const used = new Set<number>();
  const cubes: MarkCube[] = [];
  faces.forEach((face, i) => {
    if (used.has(i)) return;
    for (let corner = 0; corner < 4; corner++) {
      if (Math.abs(cornerAngle(face.points, corner) - 120) > 2) continue;
      const centre = face.points[corner];
      const members: MarkFace[] = [];
      faces.forEach((other, j) => {
        if (used.has(j)) return;
        const at = other.points.findIndex(
          ([x, y], k) =>
            Math.hypot(x - centre[0], y - centre[1]) <= tolerance &&
            Math.abs(cornerAngle(other.points, k) - 120) <= 2,
        );
        if (at >= 0) members.push({ ...other, vertex: at });
      });
      if (members.length !== 3 || new Set(members.map((m) => m.tone)).size !== 3) continue;
      members.sort((p, q) => p.tone - q.tone);
      members.forEach((m) => used.add(faces.indexOf(faces.find((f) => f.points === m.points)!)));
      const orientation = { 0: 0, 1: 0, 2: 0 } as Record<TileTone, number>;
      for (const m of members) orientation[m.tone] = bearing(centre, centroid(m.points));
      cubes.push({ centre, faces: members, bearing: 0, orientation });
      break;
    }
  });
  return cubes;
}

let cached: KairosMarkTiles | undefined;

/** The Kairos mark's cubes, clockwise from the top, from the colour icon's artwork. */
export function kairosMarkTiles(): KairosMarkTiles {
  if (cached) return cached;
  const data = logos["icon-color"];
  const [, , vw, vh] = data.viewBox.split(/\s+/).map(Number);
  const faces = snapVertices(parseMarkFaces(data));
  const cubes = groupCubes(faces);
  const all = faces.flatMap((f) => f.points);
  const xs = all.map(([x]) => x);
  const ys = all.map(([, y]) => y);
  const bbox = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
  const middle: Point = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
  for (const cube of cubes) cube.bearing = bearing(middle, cube.centre);
  // Clockwise from twelve o'clock: the bearing turned a quarter so that
  // straight up is zero and the order round the ring is ascending.
  cubes.sort((p, q) => ((p.bearing + 450) % 360) - ((q.bearing + 450) % 360));
  cached = { viewBox: { width: vw, height: vh }, bbox, cubes };
  return cached;
}

/**
 * What a quad's own motion needs, from its points and the corner it moves
 * about. `from` is the unit direction from that corner to the face's
 * middle: assembling, the face arrives along that line and lands on its
 * outline. `matrix` maps the x axis onto the edge from the corner to the
 * next point and the y axis onto the edge to the previous point, with
 * `inverse` undoing it: unfolding scales the face toward the corner in
 * that frame, so a half-open face is still a parallelogram inside its own
 * outline whatever its angles, and at full scale it is the outline itself.
 */
export function quadMotion(
  points: Point[],
  vertex: number,
): {
  vertex: Point;
  from: Point;
  matrix: [number, number, number, number];
  inverse: [number, number, number, number];
} {
  const v = points[vertex];
  const [mx, my] = centroid(points);
  const len = Math.hypot(mx - v[0], my - v[1]);
  const next = points[(vertex + 1) % 4];
  const prev = points[(vertex + 3) % 4];
  const unit = (p: Point): Point => {
    const l = Math.hypot(p[0] - v[0], p[1] - v[1]);
    return [(p[0] - v[0]) / l, (p[1] - v[1]) / l];
  };
  const [a, b] = unit(next);
  const [c, d] = unit(prev);
  const det = a * d - b * c;
  return {
    vertex: v,
    from: [(mx - v[0]) / len, (my - v[1]) / len],
    matrix: [a, b, c, d],
    inverse: [d / det, -b / det, -c / det, a / det],
  };
}

/** A points string back into points. */
export function parsePoints(points: string): Point[] {
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map(Number) as Point);
}
