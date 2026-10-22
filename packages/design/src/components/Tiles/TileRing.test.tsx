import { render, screen } from "@testing-library/react";
import { TileRing, tileRingFrame } from "./TileRing.tsx";
import { kairosMarkTiles, parsePoints } from "../../lib/mark.ts";
import { tilePalettes } from "../../lib/tiles.ts";

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

const outlines = (root: Element) => Array.from(root.querySelectorAll('svg > path[fill="none"]'));
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
const cubes = (root: Element) => Array.from(root.querySelectorAll("svg > g"));
// The faces as drawn: per cube, the two sides first and the top last.
const faces = (root: Element) => Array.from(root.querySelectorAll("svg > g > polygon"));
const tone = (p: Element) => Number(p.getAttribute("data-tone")) as 0 | 1 | 2;
const DRAW_ORDER = [1, 2, 0] as const;
const delay = (el: Element) => parseInt((el as HTMLElement).style.getPropertyValue("--tile-delay"), 10);
const prop = (el: Element, name: string) => (el as HTMLElement).style.getPropertyValue(name);
const round = (n: number) => Math.round(n * 100) / 100;

describe("TileRing", () => {
  const originalMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMedia;
  });

  it("is an image named Loading, or decorative", () => {
    const { rerender } = render(<TileRing />);
    expect(screen.getByRole("img", { name: "Loading" })).toHaveClass("tile-ring");
    rerender(<TileRing decorative aria-label="Building" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(document.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("is the Kairos mark's eighteen rhombi, each on its own fill, with no centre cube", () => {
    const size = 96;
    const { container } = render(<TileRing size={size} />);
    const svg = container.querySelector("svg")!;
    const frame = tileRingFrame(size);
    const mark = kairosMarkTiles();
    // The icon's rhombi through the frame, rounded as the ring rounds them: the same points, the same tone, in the same order.
    const expected = mark.cubes.flatMap((cube) =>
      DRAW_ORDER.map((t) => cube.faces[t]).map((face) => ({
        points: face.points
          .map(
            ([x, y]) =>
              `${round(x * frame.scale + frame.offset[0])},${round(y * frame.scale + frame.offset[1])}`,
          )
          .join(" "),
        fill: tilePalettes.kairos[face.tone],
      })),
    );
    const drawn = faces(svg).map((p) => ({ points: p.getAttribute("points"), fill: p.getAttribute("fill") }));
    expect(drawn).toEqual(expected);
    expect(drawn).toHaveLength(18);
    expect(cubes(svg)).toHaveLength(6);
    // Six cubes round an empty centre: no face touches the middle of the box.
    const middle = [frame.width / 2, frame.height / 2];
    for (const p of faces(svg)) {
      for (const [x, y] of parsePoints(p.getAttribute("points")!)) {
        expect(Math.hypot(x - middle[0], y - middle[1])).toBeGreaterThan(size / 12);
      }
    }
    // The outline grid is every edge of the eighteen rhombi, each once, first in the markup;
    // every face is stroked in its own fill.
    const edges = gridEdges(svg);
    expect(new Set(edges).size).toBe(edges.length);
    expect(edges.length).toBeLessThan(18 * 4);
    for (const p of faces(svg)) for (const e of polygonEdges(p)) expect(edges).toContain(e);
    expect(svg.children[0]).toBe(outlines(svg)[0]);
    expect(outlines(svg)[0]).toHaveAttribute("stroke-linecap", "round");
    for (const p of faces(svg)) {
      expect(p.getAttribute("stroke")).toBe(p.getAttribute("fill"));
      expect(p.hasAttribute("transform")).toBe(false);
    }
    // The mark stands `size` tall in a box padded by the stroke's mitre plus the reach, never less than the stroke.
    const pts = faces(svg).flatMap((p) => parsePoints(p.getAttribute("points")!));
    const minX = Math.min(...pts.map(([x]) => x));
    const maxX = Math.max(...pts.map(([x]) => x));
    const minY = Math.min(...pts.map(([, y]) => y));
    const maxY = Math.max(...pts.map(([, y]) => y));
    expect(maxY - minY).toBeCloseTo(size, 0);
    expect(minX).toBeCloseTo(frame.pad, 1);
    expect(minY).toBeCloseTo(frame.pad, 1);
    expect(frame.width - maxX).toBeCloseTo(frame.pad, 1);
    expect(frame.height - maxY).toBeCloseTo(frame.pad, 1);
    expect(frame.pad).toBeGreaterThanOrEqual(1 + frame.reach);
    expect(svg).toHaveAttribute("viewBox", `0 0 ${frame.width} ${frame.height}`);
    expect(svg).toHaveAttribute("height", String(frame.height));
    expect(svg).toHaveClass("overflow-visible");
  });

  it("keeps each cube turned as the mark turns it, clockwise from the top", () => {
    const mark = kairosMarkTiles();
    expect(mark.cubes.map((c) => c.bearing)).toEqual([-60, 0, 60, 120, 180, -120]);
    const { container } = render(<TileRing enter="assemble" />);
    // The cube groups follow that order, and each face's own line points from the cube's centre to its middle.
    cubes(container).forEach((g, i) => {
      expect(g).toHaveAttribute("data-cube", String(i));
      expect(Array.from(g.children).map(tone)).toEqual([1, 2, 0]);
      Array.from(g.children).forEach((p) => {
        const bearing =
          (Math.atan2(Number(prop(p, "--tile-dy")), Number(prop(p, "--tile-dx"))) * 180) / Math.PI;
        expect(Math.round(bearing)).toBe(mark.cubes[i].orientation[tone(p)]);
      });
    });
  });

  it("builds by default, one whole cube at a time clockwise, the faces timed as the loader's; chase is the other lap", () => {
    const { container, rerender } = render(<TileRing />);
    expect(container.querySelector("svg")).toHaveAttribute("data-mode", "build");
    expect(container.querySelector("svg")).toHaveAttribute("data-enter", "unfold");
    const all = faces(container);
    expect(all.every((p) => p.classList.contains("tile-build-unfold"))).toBe(true);
    // A cube takes 1080ms (its last face starts 540ms in and takes 540ms); the next starts exactly then.
    // Within a cube the faces go in tone order 270ms apart, as the inline loader's do.
    const CUBE = 1080;
    cubes(container).forEach((g, i) => {
      const byTone = Array.from(g.children).sort((a, b) => tone(a) - tone(b));
      expect(byTone.map(delay)).toEqual([0, 270, 540].map((d) => i * CUBE + d));
    });
    // The cube starts are monotonic in whole cube steps round the ring, so one cube moves at a time.
    const starts = cubes(container).map((g) => Math.min(...Array.from(g.children).map(delay)));
    starts.forEach((s, i) => expect(s).toBe(i * CUBE));
    expect(outlines(container).some((p) => p.hasAttribute("class"))).toBe(false);
    rerender(<TileRing mode="chase" enter="assemble" />);
    expect(faces(container).every((p) => p.classList.contains("tile-chase-assemble"))).toBe(true);
    rerender(<TileRing mode="chase" enter="unfold" />);
    const unfold = faces(container);
    expect(unfold.every((p) => p.classList.contains("tile-chase-unfold"))).toBe(true);
    // Each face hinges on its own cube's centre, the point its three faces share.
    cubes(container).forEach((g) => {
      const hinges = new Set(
        Array.from(g.children).map((p) => `${prop(p, "--tile-vx")} ${prop(p, "--tile-vy")}`),
      );
      expect(hinges.size).toBe(1);
      const [vx, vy] = [...hinges][0].split(" ").map(parseFloat);
      for (const p of Array.from(g.children)) {
        const pts = parsePoints(p.getAttribute("points")!);
        expect(pts.some(([x, y]) => Math.hypot(x - vx, y - vy) < 0.02)).toBe(true);
      }
    });
  });

  it("paints the Hadron palette on the same arrangement", () => {
    const { container } = render(<TileRing palette="hadron" />);
    const fills = faces(container).map((p) => p.getAttribute("fill"));
    expect(new Set(fills)).toEqual(
      new Set(["var(--hadron-sky)", "var(--hadron-blue)", "var(--hadron-deep)"]),
    );
    const { container: kairos } = render(<TileRing />);
    expect(faces(container).map((p) => p.getAttribute("points"))).toEqual(
      faces(kairos).map((p) => p.getAttribute("points")),
    );
  });

  it("is the static mark under reduced motion", () => {
    stubReducedMotion(true);
    const { container } = render(<TileRing />);
    expect(faces(container)).toHaveLength(18);
    expect(container.querySelectorAll("polygon[class], polygon[style]")).toHaveLength(0);
    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
  });
});
