import { render, screen } from "@testing-library/react";
import { TileLoader } from "./TileLoader.tsx";
import { parsePoints } from "../../lib/mark.ts";

function stubReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: reduced,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// The faces in tone order; the markup draws the two sides first and the top last.
const faces = (root: Element) =>
  Array.from(root.querySelectorAll('polygon:not([fill="none"])')).sort(
    (a, b) => Number(a.getAttribute("data-tone")) - Number(b.getAttribute("data-tone")),
  );
const drawn = (root: Element) => Array.from(root.querySelectorAll('polygon:not([fill="none"])'));
const outlines = (root: Element) => Array.from(root.querySelectorAll('path[fill="none"]'));
/** The edges of the grid path(s), as sorted endpoint keys. */
const gridEdges = (root: Element) =>
  outlines(root).flatMap((p) =>
    Array.from(p.getAttribute("d")!.matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g)).map((m) =>
      [`${m[1]},${m[2]}`, `${m[3]},${m[4]}`].sort().join("|"),
    ),
  );
const polygonEdges = (p: Element) => {
  const pts = p.getAttribute("points")!.split(" ");
  return pts.map((a, i) => [a, pts[(i + 1) % 4]].sort().join("|"));
};
const delay = (el: Element) => parseInt((el as HTMLElement).style.getPropertyValue("--tile-delay"), 10);
const prop = (el: Element, name: string) => (el as HTMLElement).style.getPropertyValue(name);

/** The box round every polygon of an svg, in its viewBox units. */
function bounds(svg: Element) {
  const pts = Array.from(svg.querySelectorAll("polygon")).flatMap((p) =>
    parsePoints(p.getAttribute("points")!),
  );
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
function viewBox(svg: Element) {
  const [x, y, w, h] = svg.getAttribute("viewBox")!.split(" ").map(Number);
  return { x, y, w, h };
}

describe("TileLoader", () => {
  const originalMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMedia;
  });

  it("is an image named Loading, or decorative", () => {
    const { rerender } = render(<TileLoader />);
    expect(screen.getByRole("img", { name: "Loading" })).toHaveClass("tile-loader");
    rerender(<TileLoader aria-label="Pulling image" />);
    expect(screen.getByRole("img", { name: "Pulling image" })).toBeInTheDocument();
    rerender(<TileLoader decorative />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(document.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("draws the outline under the three faces on the same point strings, the faces stroked in their own fill", () => {
    const { container } = render(<TileLoader size={24} />);
    const svg = container.querySelector("svg")!;
    const grid = outlines(svg);
    const cube = faces(svg);
    // One path at full strength: the hexagon's nine lattice edges, each once, on the faces' own points.
    expect(grid).toHaveLength(1);
    expect(cube).toHaveLength(3);
    const edges = gridEdges(svg);
    expect(edges).toHaveLength(9);
    expect(new Set(edges).size).toBe(9);
    for (const p of cube) for (const e of polygonEdges(p)) expect(edges).toContain(e);
    expect(grid[0]).toHaveAttribute("stroke", "var(--line)");
    expect(grid[0]).toHaveAttribute("stroke-linecap", "round");
    expect(grid[0].hasAttribute("stroke-opacity")).toBe(false);
    // The outline comes first in the markup, so nothing paints over a landed face; the top face is drawn last.
    expect(svg.children[0]).toBe(grid[0]);
    expect(drawn(svg).map((p) => p.getAttribute("data-tone"))).toEqual(["1", "2", "0"]);
    expect(cube.map((p) => p.getAttribute("fill"))).toEqual([
      "var(--kairos-light)",
      "var(--kairos-mid)",
      "var(--kairos-orange)",
    ]);
    for (const p of cube) {
      expect(p.getAttribute("stroke")).toBe(p.getAttribute("fill"));
      expect(p).toHaveAttribute("paint-order", "stroke");
      // At rest nothing transforms a face: no transform of its own, ever.
      expect(p.hasAttribute("transform")).toBe(false);
      expect((p as HTMLElement).style.transform).toBe("");
    }
    const { container: hadron } = render(<TileLoader palette="hadron" />);
    expect(faces(hadron)[2]).toHaveAttribute("fill", "var(--hadron-deep)");
  });

  it.each([16, 20, 24] as const)(
    "pads the %ipx box by the stroke's mitre and the reach on every side, and takes it back as margin",
    (size) => {
      const { container } = render(<TileLoader size={size} enter="assemble" />);
      const svg = container.querySelector("svg")!;
      const vb = viewBox(svg);
      const b = bounds(svg);
      const r = size / 2;
      const reach = Math.round(0.3 * r * 100) / 100;
      const pad = 1 + reach;
      // The cube stands `size` tall and the box exceeds it by the pad all round, never less than the stroke.
      expect(b.maxY - b.minY).toBeCloseTo(size, 1);
      expect(b.minX - vb.x).toBeCloseTo(pad, 1);
      expect(b.minY - vb.y).toBeCloseTo(pad, 1);
      expect(vb.x + vb.w - b.maxX).toBeCloseTo(pad, 1);
      expect(vb.y + vb.h - b.maxY).toBeCloseTo(pad, 1);
      expect(
        Math.min(b.minX - vb.x, b.minY - vb.y, vb.x + vb.w - b.maxX, vb.y + vb.h - b.maxY),
      ).toBeGreaterThanOrEqual(1);
      expect(Number(svg.getAttribute("width"))).toBeCloseTo(vb.w, 5);
      expect(Number(svg.getAttribute("height"))).toBeCloseTo(vb.h, 5);
      expect(svg.style.margin).toBe(`${-pad}px`);
      expect(svg.classList.contains("overflow-visible")).toBe(true);
      // The reach the faces assemble from is the same number the pad was computed with.
      expect(prop(faces(svg)[0], "--tile-reach")).toBe(`${reach}px`);
    },
  );

  it("loops the assemble on each face in tone order, an eighth of a turn apart, along each face's own line", () => {
    const { container } = render(<TileLoader enter="assemble" />);
    const cube = faces(container);
    expect(cube.every((p) => p.classList.contains("tile-loop-assemble"))).toBe(true);
    expect(outlines(container).some((p) => p.hasAttribute("class"))).toBe(false);
    // One turn is four entrances of 540ms; an eighth is 270ms.
    expect(cube.map(delay)).toEqual([0, 270, 540]);
    expect(container.querySelector("svg")).toHaveAttribute("data-enter", "assemble");
    // Top from above, left from the lower left, right from the lower right: the field's directions.
    const from = cube.map((p) => [Number(prop(p, "--tile-dx")), Number(prop(p, "--tile-dy"))]);
    expect(from[0][0]).toBeCloseTo(0, 3);
    expect(from[0][1]).toBeCloseTo(-1, 3);
    expect(from[1][0]).toBeLessThan(0);
    expect(from[1][1]).toBeGreaterThan(0);
    expect(from[2][0]).toBeGreaterThan(0);
    expect(from[2][1]).toBeGreaterThan(0);
    expect(cube.some((p) => prop(p, "--tile-vx"))).toBe(false);
  });

  it("unfolds by default, each face's hinge at the centre vertex as exact coordinates", () => {
    const { container } = render(<TileLoader size={20} />);
    const cube = faces(container);
    expect(container.querySelector("svg")).toHaveAttribute("data-enter", "unfold");
    expect(container.querySelector("svg")).toHaveAttribute("data-exit", "disassemble");
    expect(cube.every((p) => p.classList.contains("tile-loop-unfold"))).toBe(true);
    // The centre of a 20px cube: half the hexagon's width across, the radius down.
    const w = Math.round(Math.sqrt(3) * 10 * 100) / 100;
    for (const p of cube) {
      expect(prop(p, "--tile-vx")).toBe(`${w / 2}px`);
      expect(prop(p, "--tile-vy")).toBe("10px");
      expect(prop(p, "--tile-ma")).not.toBe("");
      expect(prop(p, "--tile-id")).not.toBe("");
      expect((p as HTMLElement).style.transformOrigin).toBe("");
      expect(prop(p, "--tile-dx")).toBe("");
    }
    expect(cube.map(delay)).toEqual([0, 270, 540]);
  });

  it("paints the mono rendition in currentColor at three strengths, stroked alike, with the outline fainter", () => {
    const { container } = render(<TileLoader tone="mono" />);
    const cube = faces(container);
    expect(cube.every((p) => p.getAttribute("fill") === "currentColor")).toBe(true);
    expect(cube.every((p) => p.getAttribute("stroke") === "currentColor")).toBe(true);
    expect(cube.map((p) => Number(p.getAttribute("fill-opacity")))).toEqual([0.45, 0.7, 1]);
    expect(cube.map((p) => Number(p.getAttribute("stroke-opacity")))).toEqual([0.45, 0.7, 1]);
    const grid = outlines(container);
    expect(grid[0]).toHaveAttribute("stroke", "currentColor");
    expect(grid[0]).toHaveAttribute("stroke-opacity", "0.3");
    // The strength is fill opacity, never the element's opacity, which the loop animates.
    expect(cube.some((p) => p.hasAttribute("opacity"))).toBe(false);
  });

  it("is the static complete cube under reduced motion", () => {
    stubReducedMotion(true);
    const { container } = render(<TileLoader enter="unfold" />);
    expect(faces(container)).toHaveLength(3);
    expect(gridEdges(container)).toHaveLength(9);
    expect(container.querySelectorAll("polygon[class], polygon[style]")).toHaveLength(0);
    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
    stubReducedMotion(false);
    const { container: moving } = render(<TileLoader />);
    expect(moving.querySelectorAll(".tile-loop-unfold")).toHaveLength(3);
  });
});
