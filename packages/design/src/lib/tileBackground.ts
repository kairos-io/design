// The wireframe plane behind TileBackground: the tile field's hexagons with
// no filled faces, every cell drawn as the three-rhombus outline of a cube so
// the whole plane reads as cubes stacked edge to edge. The geometry is
// tileField's; this module only decides how strong each cube's outline is,
// so a background has no hard edge and the same seed gives the same plane
// in the browser and in a test.
import { tileField, type TileBias, type TilePolygon } from "./tiles.ts";

/** One cube of the plane: its three faces on shared points, and the strength of its outline. */
export interface TileCube {
  /** Index of the hexagon, in the generator's order. */
  hex: number;
  /** Centre, in viewBox units. */
  x: number;
  y: number;
  /** Row from the top of the viewBox: the generator lays rows 1.5 radii apart, from row -1. */
  row: number;
  /** The three rhombi, in tone order, on the same points `tileField` draws. */
  faces: TilePolygon[];
  /** Opacity of the outline, 0..1, after the vignette, the depth step and the grain. */
  outline: number;
}

export interface TileBackgroundOptions {
  /** viewBox width and height. */
  width: number;
  height: number;
  /** Hexagon circumradius in viewBox units. */
  radius?: number;
  /** Which cells sit a touch fainter; same seed, same plane. */
  seed?: number;
  /**
   * How the outlines fall off toward the edges: a number 0..1 is how much
   * the corners lose against the centre (0 keeps the grid flat, 1 fades
   * the corners to nothing), a function is a custom bias over (u, v), false
   * is a flat grid.
   */
  vignette?: number | TileBias | false;
  /** Step the outline by row so the lower rows read as nearer. */
  depth?: boolean;
}

// A radial vignette measured against the corner, the farthest point from
// the centre, so `amount` is exactly what the corners lose. The far rows of
// a depth plane keep DEPTH_FAR of their strength, the near row all of it.
// The grain is at most GRAIN of a cube's strength, from a seeded hash of its
// index, so the plane is a surface with a little tooth rather than paper.
const CORNER = Math.hypot(0.5, 0.5);
const DEPTH_FAR = 0.5;
const GRAIN = 0.25;

/** The default vignette: a soft radial fall-off losing `amount` at the corners. */
export function tileVignette(amount: number): TileBias {
  const k = Math.min(1, Math.max(0, amount));
  return (u, v) => 1 - k * Math.min(1, Math.hypot(u - 0.5, v - 0.5) / CORNER);
}

/** A cube's seeded grain, 0..1: the same cube under the same seed always gets the same value. */
export function tileGrain(hex: number, seed: number): number {
  const x = (hex * 9301 + seed * 49297 + 233) % 233280;
  return Math.round((x / 233280) * 1000) / 1000;
}

/** The cubes of a background plane. */
export function tileBackground({
  width,
  height,
  radius = 48,
  seed = 5,
  vignette = 0.6,
  depth = false,
}: TileBackgroundOptions): TileCube[] {
  const bias: TileBias =
    typeof vignette === "function" ? vignette : vignette === false ? () => 1 : tileVignette(vignette);
  // The field's weight is the bias at the cell; the seeded fills it rolls
  // are ignored, since nothing here is filled, so the seed is free to drive
  // the grain alone.
  const polygons = tileField({ width, height, radius, seed, bias });
  const byHex = new Map<number, TilePolygon[]>();
  for (const p of polygons) {
    const list = byHex.get(p.hex);
    if (list) list.push(p);
    else byHex.set(p.hex, [p]);
  }
  const cubes: TileCube[] = [];
  for (const [hex, faces] of byHex) {
    const x = faces[0].u * width;
    const y = faces[0].v * height;
    cubes.push({ hex, x, y, row: Math.round(y / (1.5 * radius)), faces, outline: faces[0].weight });
  }
  const rows = Math.max(...cubes.map((c) => c.row));
  const first = Math.min(...cubes.map((c) => c.row));
  for (const cube of cubes) {
    let outline = cube.outline;
    if (depth && rows > first) outline *= DEPTH_FAR + ((1 - DEPTH_FAR) * (cube.row - first)) / (rows - first);
    outline *= 1 - GRAIN * tileGrain(cube.hex, seed);
    cube.outline = Math.round(Math.min(1, Math.max(0, outline)) * 100) / 100;
  }
  return cubes;
}
