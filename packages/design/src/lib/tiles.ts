// The Kairos tile geometry. The mark is a ring of rhombi in three oranges;
// laid flat, a hexagon splits into three rhombi in the same three tones (top
// softer, left soft, right orange: the logo's order). A field tiles the plane
// with those hexagons and fills each rhombus with a seeded probability that a
// bias function sets per position, so the field is dense at one edge and
// falls away to outlines at the other. Everything here is pure: the React
// components and the static SVG assets both render from it.

/** Rhombus index inside one hexagon, in the logo's order. */
export type TileTone = 0 | 1 | 2;

export const tileToneNames = ["softer", "soft", "orange"] as const;

/**
 * Kairos paints the tiles orange; Hadron swaps the accent for its blues and
 * nothing else. "success" and "error" are the status tones a loader lands
 * in: three greens from the healthy green, three reds from the recovery red.
 */
export type TilePalette = "kairos" | "hadron" | "success" | "error";

/** CSS custom properties the three tones paint with, per palette, from tokens.css. */
export const tilePalettes: Record<TilePalette, Record<TileTone, string>> = {
  kairos: {
    0: "var(--kairos-light)",
    1: "var(--kairos-mid)",
    2: "var(--kairos-orange)",
  },
  hadron: {
    0: "var(--hadron-sky)",
    1: "var(--hadron-blue)",
    2: "var(--hadron-deep)",
  },
  success: {
    0: "var(--tile-success-light)",
    1: "var(--tile-success-mid)",
    2: "var(--tile-success-deep)",
  },
  error: {
    0: "var(--tile-error-light)",
    1: "var(--tile-error-mid)",
    2: "var(--tile-error-deep)",
  },
};

/** The Kairos tones; kept for callers that only know one palette. */
export const tileToneVars = tilePalettes.kairos;

/** Hex fallbacks for the standalone SVG files, per palette. */
const toneFallbacks: Record<TilePalette, Record<TileTone, string>> = {
  kairos: { 0: "#FB9E70", 1: "#FF7442", 2: "#EE5007" },
  hadron: { 0: "#1BAAFF", 1: "#0275E7", 2: "#004CCE" },
  success: { 0: "#8ED1A6", 1: "#3FAF6E", 2: "#2F8F57" },
  error: { 0: "#F0A3A3", 1: "#E05A5A", 2: "#C62B2B" },
};

export interface TilePolygon {
  /** SVG points attribute. */
  points: string;
  tone: TileTone;
  filled: boolean;
  /** Centre of the hexagon the rhombus belongs to, 0..1 across the field. */
  u: number;
  v: number;
  /** The bias at that position: how dense the field is there, 0..1. */
  weight: number;
  /**
   * Opacity of the cell's outline, 0..1: the weight relative to the densest
   * cell in the field, so the hairlines thin out where the fills do and the
   * sparse edge dissolves instead of stopping in a line. A filled face is
   * always 1, so an animated cube lands on a fully drawn outline.
   */
  outline: number;
  /** Index of the hexagon the rhombus belongs to; three rhombi share one. */
  hex: number;
}

/** Probability of a rhombus being filled at (u, v), both 0..1 across the field. */
export type TileBias = (u: number, v: number) => number;

export interface TileFieldOptions {
  /** viewBox width and height. */
  width: number;
  height: number;
  /** Hexagon circumradius in viewBox units. 38 reads as texture, 64 as shapes. */
  radius?: number;
  /** Seed for the deterministic generator; same seed, same field. */
  seed?: number;
  /** Fill probability per position; defaults to a fade towards the right edge. */
  bias?: TileBias;
  /** Fill every rhombus, for the unit sample. */
  solid?: boolean;
}

/** A fade that is densest at (cx, cy) and loses k per unit of distance. */
export function fadeFrom(cx: number, cy: number, k = 1.25, peak = 0.95): TileBias {
  return (u, v) => Math.max(0, peak - Math.hypot(u - cx, v - cy) * k);
}

/** The fades the pages use, by the edge the tiles cling to. */
export const tileFades = {
  right: fadeFrom(0.9, 0.5),
  left: fadeFrom(0.1, 0.5),
  top: fadeFrom(0.5, 0.05, 1.1),
  bottom: fadeFrom(0.5, 0.95, 1.1),
  topRight: fadeFrom(1, 0.2, 1.1),
  bottomRight: fadeFrom(1, 0.8, 1.1),
  center: fadeFrom(0.5, 0.5, 1.6),
  /** Linear: outlines on the left, solid on the right. */
  ramp: (u: number) => u * 0.9,
} as const satisfies Record<string, TileBias>;

export type TileFade = keyof typeof tileFades;

// A small linear congruential generator, so a field is reproducible from its
// seed in Node (the asset build) and in the browser alike.
function lcg(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

/** The polygons of a tile field. */
export function tileField({
  width,
  height,
  radius = 38,
  seed = 5,
  bias = tileFades.right,
  solid = false,
}: TileFieldOptions): TilePolygon[] {
  const r = radius;
  const s3 = Math.sqrt(3);
  const rnd = lcg(seed);
  const out: TilePolygon[] = [];
  let hex = 0;
  for (let row = -1; row * 1.5 * r < height + r; row++) {
    for (let col = -1; col * s3 * r < width + r; col++, hex++) {
      const cx = col * s3 * r + (row % 2 ? (s3 * r) / 2 : 0);
      const cy = row * 1.5 * r;
      const at = (deg: number): [number, number] => [
        cx + r * Math.cos((deg * Math.PI) / 180),
        cy + r * Math.sin((deg * Math.PI) / 180),
      ];
      const p0 = at(-90);
      const p1 = at(-30);
      const p2 = at(30);
      const p3 = at(90);
      const p4 = at(150);
      const p5 = at(210);
      const c: [number, number] = [cx, cy];
      const t = bias(cx / width, cy / height);
      const rhombi: [number, number][][] = [
        [p5, p0, p1, c],
        [p5, c, p3, p4],
        [c, p1, p2, p3],
      ];
      rhombi.forEach((face, i) => {
        const filled = solid || rnd() < t;
        out.push({
          points: face.map(([x, y]) => `${round(x)},${round(y)}`).join(" "),
          tone: i as TileTone,
          filled,
          u: round(cx / width),
          v: round(cy / height),
          weight: round(Math.min(1, Math.max(0, t))),
          outline: 1,
          hex,
        });
      });
    }
  }
  // The outlines fade with the field, measured against its own densest cell
  // rather than an absolute scale, so a bias that peaks at 0.6 still draws a
  // full grid where it is densest and a custom bias needs no calibration. A
  // flat bias (every cell the same weight, or no weight at all) has no sparse
  // edge to dissolve, so it keeps the complete grid at full strength.
  const peak = Math.max(0, ...out.map((p) => p.weight));
  for (const p of out) p.outline = tileOutlineOpacity(p, peak);
  return out;
}

/**
 * How opaque a cell's outline is, given the field's peak weight: the cell's
 * share of the peak, or 1 under a filled face so the cube that lands there
 * sits on a complete outline. Exported for callers that draw their own grid.
 */
export function tileOutlineOpacity(p: Pick<TilePolygon, "weight" | "filled">, peak: number): number {
  if (p.filled || peak <= 0) return 1;
  return round(Math.min(1, p.weight / peak));
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// The most jitter a tile's delay carries, in ms, on top of its share of the span.
const DELAY_JITTER = 160;

/**
 * When a filled tile enters, in ms: the dense part of the field first, the
 * sparse edge last, with a little seeded jitter so rows do not march in step.
 */
export function tileEnterDelay(p: TilePolygon, index: number, span = 700): number {
  const jitter = ((index * 7919) % 97) / 97;
  return Math.round((1 - p.weight) * span + jitter * DELAY_JITTER);
}

/** The latest delay `tileEnterDelay` or `tileFoldDelay` hands out for a span: when the last tile starts. */
export function tileDelaySpan(span = 700): number {
  return span + DELAY_JITTER;
}

/**
 * When a filled tile folds away, in ms: the mirror of its entrance, so the
 * sparse edge goes first and the dense part of the field is the last to leave.
 */
export function tileFoldDelay(p: TilePolygon, index: number, span = 700): number {
  return tileDelaySpan(span) - tileEnterDelay(p, index, span);
}

/** A position along a sweep across the field, 0..1, from (u, v). */
export type TileAxis = (u: number, v: number) => number;

/**
 * Where idle="wave" runs, per fade preset: 0 at the field's dense edge and 1
 * at its sparse one, so the band of light sets out from where the cubes are
 * and rolls toward the copy (right to left for the default hero), outward in
 * rings from a centred field.
 */
export const tileWaveAxes: Record<TileFade, TileAxis> = {
  right: (u) => 1 - u,
  left: (u) => u,
  top: (_u, v) => v,
  bottom: (_u, v) => 1 - v,
  topRight: (u, v) => (1 - u + v) / 2,
  bottomRight: (u, v) => (2 - u - v) / 2,
  center: (u, v) => Math.hypot(u - 0.5, v - 0.5) * 2,
  ramp: (u) => 1 - u,
};

/**
 * The wave axis for a fade: the preset's own, or, for a custom bias, the u
 * axis in whichever direction runs from its denser side to its sparser one.
 */
export function tileWaveAxis(fade: TileFade | TileBias): TileAxis {
  if (typeof fade !== "function") return tileWaveAxes[fade];
  return fade(1, 0.5) >= fade(0, 0.5) ? tileWaveAxes.right : tileWaveAxes.left;
}

// How much of the wave's sweep the per-row spread takes, so the front is a
// ragged band a few cells deep rather than a ruled line.
const WAVE_ROW_SPREAD = 0.08;

/**
 * A cube's turn in the wave, 0..1: its place along the axis, dense edge
 * first, pushed back by a small seeded amount per row so that neighbouring
 * rows do not light in one ruled line. Pure, so the same field gives the
 * same wave; the component turns it into a delay as a share of the period.
 */
export function tileWavePhase(p: Pick<TilePolygon, "u" | "v">, axis: TileAxis, row: number): number {
  const along = Math.min(1, Math.max(0, axis(p.u, p.v)));
  // Seven rows in a row get seven different nudges, 0 to 1 in a scattered
  // order; the generator's first row is -1, so the modulo is the true one.
  const spread = (((((row % 7) + 7) % 7) * 2) % 7) / 6;
  const phase = along * (1 - WAVE_ROW_SPREAD) + spread * WAVE_ROW_SPREAD;
  return Math.round(phase * 1000) / 1000;
}

/**
 * The geometry a face's own motion needs, per tone. `origin` and `angle` are
 * the hinge when a cube folds or unfolds: the hexagon's centre vertex, which
 * the three faces share, as a `transform-origin` inside the face's own
 * bounding box (`transform-box: fill-box`), and the direction in degrees of
 * the face's first edge out of that vertex. From the point order in
 * `tileField`: the top face [p5, p0, p1, c] has c at the bottom middle of its
 * box; the left face [p5, c, p3, p4] has it on the right edge, a third of
 * the way down; the right face [c, p1, p2, p3] on the left edge, a third of
 * the way down. Every face's second edge is 120 degrees on from its first,
 * so one skew in the CSS serves all three; only the angle differs per tone.
 * `from` is the unit direction a face arrives from when a cube assembles:
 * the top face from straight above, the left face from the lower left and
 * the right face from the lower right, each along the cube's own axis, so
 * the three meet at the centre vertex.
 */
export const tileFaceMotion: Record<TileTone, { origin: string; angle: number; from: [number, number] }> = {
  0: { origin: "50% 100%", angle: 210, from: [0, -1] },
  1: { origin: "100% 33.333%", angle: 90, from: [-0.87, 0.5] },
  2: { origin: "0% 33.333%", angle: 330, from: [0.87, 0.5] },
};

/** One hexagon at (cx, cy) split into its three rhombi, all filled. */
export function tileHexagon(cx: number, cy: number, r: number): TilePolygon[] {
  const at = (deg: number): [number, number] => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy + r * Math.sin((deg * Math.PI) / 180),
  ];
  const p0 = at(-90);
  const p1 = at(-30);
  const p2 = at(30);
  const p3 = at(90);
  const p4 = at(150);
  const p5 = at(210);
  const c: [number, number] = [cx, cy];
  const faces: [number, number][][] = [
    [p5, p0, p1, c],
    [p5, c, p3, p4],
    [c, p1, p2, p3],
  ];
  return faces.map((face, i) => ({
    points: face.map(([x, y]) => `${round(x)},${round(y)}`).join(" "),
    tone: i as TileTone,
    filled: true,
    u: 0.5,
    v: 0.5,
    weight: 1,
    outline: 1,
    hex: 0,
  }));
}

/**
 * How a filled face is stroked, everywhere a face is drawn: a stroke in its
 * own fill, painted under the fill, so only the outer three tenths of a unit
 * show and cover the anti-aliased seam against the neighbouring face, with
 * bevelled joins so a 60 degree corner grows no pin (a mitre there reaches
 * two stroke widths past the vertex). The hairline grid keeps its mitre: it
 * is thin and centred on the shared lines, so it has nothing to overshoot.
 * Within a cube the top face (tone 0) is drawn last.
 */
export const tileFaceStroke = { width: 0.6, join: "bevel", order: "stroke" } as const;

/** The order faces of one cube are drawn in: the two sides, then the top last. */
export const tileFaceOrder: readonly TileTone[] = [1, 2, 0];

/** One batch of the hairline grid: the path of every lattice edge at one opacity. */
export interface TileGridPath {
  d: string;
  /** 0..1; a batch at full strength omits the attribute when drawn. */
  opacity: number;
}

// Opacities are bucketed to this many steps, so a field's grid is at most
// GRID_STEPS + 1 paths however many cells it has.
const GRID_STEPS = 20;

/**
 * The hairline grid of a set of polygons as unique lattice edges: every
 * edge two cells share is drawn once, at the stronger of the two cells'
 * outline opacities (so the edges of a filled face, whose outline is 1,
 * are always full), batched into one path per opacity step in ascending
 * order. Drawn once, an edge cannot compound its alpha with its neighbour's
 * copy, and the six strokes that met at every vertex are one line each. The
 * endpoints are the polygons' own points, so a face still lands on its
 * outline to the digit. Deterministic: polygon order, then edge order.
 */
export function tileGridPaths(polygons: Pick<TilePolygon, "points" | "outline">[]): TileGridPath[] {
  const edges = new Map<string, { a: string; b: string; opacity: number }>();
  const key = (p: string) => {
    const [x, y] = p.split(",").map(Number);
    return `${Math.round(x * 20)},${Math.round(y * 20)}`;
  };
  for (const polygon of polygons) {
    const pts = polygon.points.split(" ");
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const [ka, kb] = [key(a), key(b)];
      const id = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      const seen = edges.get(id);
      if (seen) seen.opacity = Math.max(seen.opacity, polygon.outline);
      else edges.set(id, { a, b, opacity: polygon.outline });
    }
  }
  const buckets = new Map<number, string[]>();
  for (const edge of edges.values()) {
    const step = Math.round(Math.min(1, Math.max(0, edge.opacity)) * GRID_STEPS) / GRID_STEPS;
    if (step === 0) continue;
    const list = buckets.get(step);
    const segment = `M${edge.a.replace(",", " ")}L${edge.b.replace(",", " ")}`;
    if (list) list.push(segment);
    else buckets.set(step, [segment]);
  }
  return Array.from(buckets.entries())
    .sort(([p], [q]) => p - q)
    .map(([opacity, segments]) => ({ d: segments.join(""), opacity }));
}

/** The single parallelogram (one rhombus seen flat), in a 22 x 14 box. */
export const tilePoints = "7,0 22,0 15,14 0,14";

/**
 * The same tile drawn as an outline with a 2-unit stroke: the polygon inset
 * by one unit (half the stroke), so the stroke paints exactly inside the
 * 22x14 box and its mitred tips land on the box's corners instead of being
 * clipped by the viewBox. The acute corners need a mitre ratio of 1.9, under
 * the default limit of 4, so the joins stay hard. Drawn with `stroke-width`
 * 2 and no fill.
 */
export const tileOutlinePoints = "7.62,1 20.38,1 14.38,13 1.62,13";
export const tileOutlineStrokeWidth = 2;

/**
 * Serialises a field as a standalone SVG, for pages with no build step.
 * Tones are the brand custom properties with the hex values as fallbacks,
 * so the file works on its own and follows tokens.css where it is present.
 */
export function tileFieldSvg(
  options: TileFieldOptions,
  {
    line = "#e2e8f0",
    strokeWidth = 1,
    palette = "kairos",
  }: { line?: string; strokeWidth?: number; palette?: TilePalette } = {},
): string {
  const vars = tilePalettes[palette];
  const fallback = toneFallbacks[palette];
  const fills: Record<TileTone, string> = {
    0: `${vars[0].slice(0, -1)}, ${fallback[0]})`,
    1: `${vars[1].slice(0, -1)}, ${fallback[1]})`,
    2: `${vars[2].slice(0, -1)}, ${fallback[2]})`,
  };
  const polygons = tileField(options);
  // The complete grid first, every lattice edge once (tileGridPaths), with
  // round caps and joins that close the corners and cannot overshoot at
  // hairline width, then the filled faces on top with the face stroke
  // (tileFaceStroke): a thin stroke in their own colour under the fill that
  // hides the anti-aliased seam between neighbours without pins or
  // overshoot, the top face of each cube last, and nothing is drawn over a
  // filled face afterwards, so its edges stay hard and clean. Each batch of
  // the grid carries its opacity, so the grid thins out with the fills; the
  // full-strength batch omits the attribute.
  const grid = tileGridPaths(polygons)
    .map(
      (g) =>
        `<path d="${g.d}" fill="none" stroke="var(--line, ${line})" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${
          g.opacity < 1 ? ` stroke-opacity="${g.opacity}"` : ""
        }/>`,
    )
    .join("\n    ");
  const faces = polygons
    .filter((p) => p.filled)
    .sort((a, b) => a.hex - b.hex || tileFaceOrder.indexOf(a.tone) - tileFaceOrder.indexOf(b.tone))
    .map(
      (p) =>
        `<polygon points="${p.points}" fill="${fills[p.tone]}" stroke="${fills[p.tone]}" stroke-width="${tileFaceStroke.width}" stroke-linejoin="${tileFaceStroke.join}" paint-order="${tileFaceStroke.order}"/>`,
    )
    .join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${options.width} ${options.height}" preserveAspectRatio="xMidYMid slice" stroke-linejoin="miter" stroke-linecap="butt" aria-hidden="true">
  <g>
    ${grid}
  </g>
  <g>
    ${faces}
  </g>
</svg>
`;
}
