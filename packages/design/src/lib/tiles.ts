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

/** Kairos paints the tiles orange; Hadron swaps the accent for its blues and nothing else. */
export type TilePalette = "kairos" | "hadron";

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
};

/** The Kairos tones; kept for callers that only know one palette. */
export const tileToneVars = tilePalettes.kairos;

/** Hex fallbacks for the standalone SVG files, per palette. */
const toneFallbacks: Record<TilePalette, Record<TileTone, string>> = {
  kairos: { 0: "#FB9E70", 1: "#FF7442", 2: "#EE5007" },
  hadron: { 0: "#1BAAFF", 1: "#0275E7", 2: "#004CCE" },
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

/**
 * When a filled tile enters, in ms: the dense part of the field first, the
 * sparse edge last, with a little seeded jitter so rows do not march in step.
 */
export function tileEnterDelay(p: TilePolygon, index: number, span = 700): number {
  const jitter = ((index * 7919) % 97) / 97;
  return Math.round((1 - p.weight) * span + jitter * 160);
}

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

/** The single parallelogram (one rhombus seen flat), in a 22 x 14 box. */
export const tilePoints = "7,0 22,0 15,14 0,14";

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
  // The complete grid first, one hairline per cell, then the filled faces on
  // top with a stroke in their own colour: the stroke hides the anti-aliased
  // seam between neighbours and covers the hairline beneath, and nothing is
  // drawn over a filled face afterwards, so its edges stay hard and clean.
  // Each hairline carries its cell's outline opacity, so the grid thins out
  // with the fills; a full-strength outline omits the attribute.
  const grid = polygons
    .map(
      (p) =>
        `<polygon points="${p.points}" fill="none" stroke="var(--line, ${line})" stroke-width="${strokeWidth}"${
          p.outline < 1 ? ` stroke-opacity="${p.outline}"` : ""
        }/>`,
    )
    .join("\n    ");
  const faces = polygons
    .filter((p) => p.filled)
    .map(
      (p) =>
        `<polygon points="${p.points}" fill="${fills[p.tone]}" stroke="${fills[p.tone]}" stroke-width="${strokeWidth}"/>`,
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
