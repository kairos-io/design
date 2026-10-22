import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tile, TileBar, TileField, TileMarker, TileUnit } from "./Tiles.tsx";
import { tileFaceMotion, tileFades, tileField } from "../../lib/tiles.ts";

// The grid is unique lattice edges in a path per opacity step. These read
// it back as edges: endpoint pairs with the strength of their batch.
type GridEdge = { a: string; b: string; x: number; opacity: number };
function gridEdges(root: ParentNode): GridEdge[] {
  return Array.from(root.querySelectorAll(':scope > path[fill="none"], svg > path[fill="none"]')).flatMap(
    (p) => {
      const opacity = Number(p.getAttribute("stroke-opacity") ?? 1);
      return Array.from(p.getAttribute("d")!.matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g)).map(
        (m) => ({
          a: `${m[1]},${m[2]}`,
          b: `${m[3]},${m[4]}`,
          x: Math.min(Number(m[1]), Number(m[3])),
          opacity,
        }),
      );
    },
  );
}
const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
/** The edges of every face polygon under `root`, as keys. */
function faceEdges(root: ParentNode): Set<string> {
  const keys = new Set<string>();
  for (const p of Array.from(root.querySelectorAll("g polygon"))) {
    const pts = p.getAttribute("points")!.split(" ");
    pts.forEach((a, i) => keys.add(edgeKey(a, pts[(i + 1) % 4])));
  }
  return keys;
}

// jsdom has no matchMedia and no layout, so the cursor tests pretend to be a
// browser: a hovering fine pointer, reduced motion off unless asked, a frame
// queue flushed by hand, and an SVG box that maps 1:1 onto its viewBox.
function stubMedia({ hover = true, reduced = false } = {}) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes("hover") ? hover : reduced,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
function stubFrames() {
  const queue: FrameRequestCallback[] = [];
  window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) =>
    queue.push(cb),
  ) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = vi.fn();
  return {
    flush: () => queue.splice(0).forEach((cb) => cb(0)),
    pending: () => queue.length,
  };
}
function renderCursorField() {
  const result = render(
    <div className="relative">
      <TileField idle="cursor" fade="ramp" width={400} height={200} radius={25} seed={4} />
    </div>,
  );
  const svg = result.container.querySelector("svg")!;
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 400, bottom: 200, width: 400, height: 200, x: 0, y: 0 }) as DOMRect;
  const glows = Array.from(svg.querySelectorAll<SVGGElement>(":scope > g.tile-glow"));
  // The first face of a cube is [p5, p0, p1, centre], so its last point is the hexagon's centre.
  const centre = (g: Element) => {
    const [x, y] = g.querySelector("polygon")!.getAttribute("points")!.split(" ").at(-1)!.split(",");
    return { x: Number(x), y: Number(y) };
  };
  const lit = (g: Element) => Number((g as SVGGElement).style.getPropertyValue("--tile-lit") || 0);
  return { ...result, svg, parent: svg.parentElement!, glows, centre, lit };
}

describe("Tiles", () => {
  it("TileField is decorative and deterministic", () => {
    const { container, rerender } = render(<TileField seed={3} width={200} height={100} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    const first = svg.innerHTML;
    rerender(<TileField seed={3} width={200} height={100} />);
    expect(svg.innerHTML).toBe(first);
    expect(svg.querySelectorAll("polygon").length).toBeGreaterThan(5);
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("groups the three faces of a cube so they animate as one", () => {
    const { container } = render(<TileField animate="in" solid width={100} height={60} radius={30} />);
    const groups = Array.from(container.querySelectorAll("g.tile-in"));
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.querySelectorAll("polygon").length === 3)).toBe(true);
  });

  it("TileField paints filled tiles with the brand custom properties and outlines with the border", () => {
    const { container } = render(<TileField solid width={100} height={60} radius={30} />);
    const fills = Array.from(container.querySelectorAll("g polygon")).map((p) => p.getAttribute("fill"));
    expect(fills).toContain("var(--kairos-orange)");
    expect(fills).not.toContain("none");
    // The grid is complete underneath: every edge of every face is in it, each edge once.
    const edges = gridEdges(container);
    const keys = edges.map((e) => edgeKey(e.a, e.b));
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of faceEdges(container)) expect(keys).toContain(key);
    expect(container.querySelector('path[fill="none"]')).toHaveAttribute("stroke", "var(--line)");
    expect(container.querySelector('path[fill="none"]')).toHaveAttribute("stroke-linecap", "round");
    const { container: faded } = render(<TileField fade={() => 0} width={100} height={60} radius={30} />);
    expect(faded.querySelector("path")).toHaveAttribute("stroke", "var(--line)");
  });

  it("fades the outlines with the field so the sparse edge dissolves", () => {
    const { container } = render(<TileField fade="ramp" width={600} height={200} radius={20} seed={9} />);
    // A filled face's edges are always full (an edge takes the stronger of its two cells), so only
    // the edges between empty cells show the fade.
    const filled = faceEdges(container);
    const outlines = gridEdges(container).filter((e) => !filled.has(edgeKey(e.a, e.b)));
    const sparse = outlines.filter((e) => e.x < 60).map((e) => e.opacity);
    const dense = outlines.filter((e) => e.x > 540).map((e) => e.opacity);
    expect(sparse.length).toBeGreaterThan(0);
    expect(Math.max(...sparse)).toBeLessThan(0.2);
    expect(Math.min(...dense)).toBeGreaterThan(0.85);
    for (const e of gridEdges(container).filter((e) => filled.has(edgeKey(e.a, e.b))))
      expect(e.opacity).toBe(1);
    // A full batch omits the attribute rather than writing 1.
    expect(container.querySelector('path[stroke-opacity="1"]')).toBeNull();
    // The filled faces themselves never fade; only the hairlines beneath do.
    expect(container.querySelectorAll("g polygon[stroke-opacity]")).toHaveLength(0);
    // A solid field has no sparse edge, so its grid is one complete path at full strength.
    const { container: solid } = render(<TileField solid width={100} height={60} radius={30} />);
    expect(solid.querySelectorAll("path[stroke-opacity]")).toHaveLength(0);
    expect(solid.querySelectorAll("path")).toHaveLength(1);
  });

  it("animates filled tiles only, dense edge first, then settles back to plain paint", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <TileField animate="in" fade="ramp" width={400} height={100} radius={25} seed={2} />,
      );
      const filled = Array.from(container.querySelectorAll("g.tile-in"));
      const outlines = Array.from(container.querySelectorAll('path[fill="none"]'));
      expect(filled.length).toBeGreaterThan(5);
      expect(outlines.some((p) => p.parentElement?.classList.contains("tile-in"))).toBe(false);
      expect(filled.every((g) => g.querySelectorAll("polygon").length >= 1)).toBe(true);
      const delay = (p: Element) => parseInt((p as HTMLElement).style.getPropertyValue("--tile-delay"), 10);
      expect(filled.map(delay).every((d) => d >= 0 && d <= 900)).toBe(true);
      // With the ramp fade the right edge is dense, so its cubes enter before the left edge's.
      const x = (g: Element) =>
        Number(g.querySelector("polygon")!.getAttribute("points")!.split(" ")[0].split(",")[0]);
      const mean = (a: number[]) => a.reduce((s, n) => s + n, 0) / a.length;
      expect(mean(filled.filter((p) => x(p) > 300).map(delay))).toBeLessThan(
        mean(filled.filter((p) => x(p) < 120).map(delay)),
      );
      // Once the last tile has landed the classes come off, so neighbours paint seamlessly again.
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(container.querySelectorAll(".tile-in")).toHaveLength(0);
      expect(container.querySelectorAll(".tile-live")).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps a few tiles breathing in live mode after the entrance", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<TileField animate="live" solid width={300} height={120} radius={20} />);
      expect(container.querySelectorAll(".tile-live")).toHaveLength(0);
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      const live = container.querySelectorAll("g.tile-live").length;
      const cubes = container.querySelectorAll("g").length;
      expect(live).toBeGreaterThan(0);
      expect(live).toBeLessThan(cubes / 3);
      expect(container.querySelectorAll(".tile-in")).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  describe("motion API", () => {
    const originalMedia = window.matchMedia;
    afterEach(() => {
      window.matchMedia = originalMedia;
      vi.useRealTimers();
    });
    const small = { width: 400, height: 100, radius: 25, seed: 2, fade: "ramp" as const };
    const x = (el: Element) =>
      Number(
        (el.tagName === "polygon" ? el : el.querySelector("polygon")!)
          .getAttribute("points")!
          .split(" ")[0]
          .split(",")[0],
      );
    const delay = (el: Element) => parseInt((el as HTMLElement).style.getPropertyValue("--tile-delay"), 10);
    const mean = (a: number[]) => a.reduce((s, n) => s + n, 0) / a.length;
    const faces = (root: Element) => Array.from(root.querySelectorAll("svg > g > polygon"));
    const cubes = (root: Element) => Array.from(root.querySelectorAll("svg > g"));
    const staticMarkup = () => render(<TileField {...small} />).container.querySelector("svg")!.innerHTML;
    const settle = () =>
      act(() => {
        vi.advanceTimersByTime(2000);
      });

    it("maps enter, idle and folded onto the field, with no motion class at rest", () => {
      const { container, rerender } = render(<TileField {...small} enter="drop" idle="live" />);
      const svg = container.querySelector("svg")!;
      expect(svg).toHaveAttribute("data-enter", "drop");
      expect(svg).toHaveAttribute("data-idle", "live");
      expect(svg).not.toHaveAttribute("data-folded");
      expect(container.querySelectorAll("g.tile-in").length).toBeGreaterThan(0);
      rerender(<TileField {...small} enter="unfold" idle={false} folded />);
      expect(svg).toHaveAttribute("data-enter", "unfold");
      expect(svg).not.toHaveAttribute("data-idle");
      expect(svg).toHaveAttribute("data-folded", "");
      // Nothing is set: the static field, without a single class or style.
      const { container: plain } = render(<TileField {...small} />);
      expect(plain.querySelectorAll("[class], [style]")).toHaveLength(1);
      expect(plain.querySelector("svg")!.hasAttribute("data-enter")).toBe(false);
    });

    it("maps the deprecated animate shorthand onto enter and idle, and lets an explicit prop win", () => {
      const attrs = (el: Element) => [el.getAttribute("data-enter"), el.getAttribute("data-idle")];
      const svg = (ui: React.ReactElement) => render(ui).container.querySelector("svg")!;
      expect(attrs(svg(<TileField {...small} animate="in" />))).toEqual(["drop", null]);
      expect(attrs(svg(<TileField {...small} animate="live" />))).toEqual(["drop", "live"]);
      expect(attrs(svg(<TileField {...small} animate="cursor" />))).toEqual(["drop", "cursor"]);
      expect(attrs(svg(<TileField {...small} animate={false} />))).toEqual([null, null]);
      expect(attrs(svg(<TileField {...small} animate="live" enter="unfold" />))).toEqual(["unfold", "live"]);
      expect(attrs(svg(<TileField {...small} animate="live" idle={false} />))).toEqual(["drop", null]);
      const { container } = render(<TileField {...small} animate="in" />);
      expect(container.querySelectorAll("g.tile-in").length).toBeGreaterThan(5);
    });

    // Every entrance: the class on the right element, the stagger from the
    // dense edge (the right, with the ramp fade), the static field once it
    // has landed, then its reverse when folded flips on, sparse edge first,
    // down to the grid alone, and the entrance again when it flips off.
    const entrances = [
      { enter: "drop", enterClass: "tile-in", exitClass: "tile-out", perFace: false },
      { enter: "fall", enterClass: "tile-fall", exitClass: "tile-fall-out", perFace: false },
      { enter: "assemble", enterClass: "tile-assemble", exitClass: "tile-disassemble", perFace: true },
      { enter: "unfold", enterClass: "tile-unfold", exitClass: "tile-fold", perFace: true },
    ] as const;
    it.each(entrances)("$enter enters dense edge first, rests clean, and reverses when folded", (spec) => {
      vi.useFakeTimers();
      const { container, rerender } = render(<TileField {...small} enter={spec.enter} />);
      const svg = container.querySelector("svg")!;
      const outlines = svg.querySelectorAll(':scope > path[fill="none"]').length;
      const moving = (cls: string) =>
        (spec.perFace ? faces(container) : cubes(container)).filter((el) => el.classList.contains(cls));
      const still = (cls: string) =>
        (spec.perFace ? cubes(container) : faces(container)).filter((el) => el.classList.contains(cls));
      const denseFirst = (els: Element[]) =>
        expect(mean(els.filter((p) => x(p) > 300).map(delay))).toBeLessThan(
          mean(els.filter((p) => x(p) < 120).map(delay)),
        );
      const sparseFirst = (els: Element[]) =>
        expect(mean(els.filter((p) => x(p) < 120).map(delay))).toBeLessThan(
          mean(els.filter((p) => x(p) > 300).map(delay)),
        );

      // Entering: every cube (or every face) carries the class and a delay; the other level nothing.
      let inFlight = moving(spec.enterClass);
      expect(inFlight.length).toBeGreaterThan(5);
      expect(inFlight).toHaveLength(spec.perFace ? faces(container).length : cubes(container).length);
      expect(still(spec.enterClass)).toHaveLength(0);
      expect(container.querySelectorAll("[class]")).toHaveLength(inFlight.length + 1);
      expect(inFlight.map(delay).every((d) => d >= 0)).toBe(true);
      denseFirst(inFlight);
      // The fall height follows the radius, so the keyframes scale with the tiles.
      expect((inFlight[0] as HTMLElement).style.getPropertyValue("--tile-fall")).toBe("50px");
      // The grid is complete and untouched underneath.
      expect(svg.querySelectorAll(':scope > path[fill="none"]')).toHaveLength(outlines);
      expect(svg.querySelectorAll(":scope > path[class], :scope > path[style]")).toHaveLength(0);
      if (spec.perFace) {
        // Inside a cube the faces arrive in tone order, a few tens of milliseconds apart
        // (the markup draws the two sides first and the top last).
        const cube = cubes(container).find((g) => g.children.length === 3)!;
        const [left, right, top] = Array.from(cube.children).map(delay);
        expect(left - top).toBeGreaterThan(10);
        expect(left - top).toBeLessThan(100);
        expect(right - left).toBe(left - top);
      }
      // Landed: nothing but the static field remains.
      settle();
      expect(svg.innerHTML).toBe(staticMarkup());

      // Leaving: the reverse class, sparse edge first, the dense edge last.
      rerender(<TileField {...small} enter={spec.enter} folded />);
      inFlight = moving(spec.exitClass);
      expect(inFlight.length).toBeGreaterThan(5);
      expect(container.querySelectorAll(`.${spec.enterClass}`)).toHaveLength(0);
      sparseFirst(inFlight);
      if (spec.perFace) {
        // The faces leave in reverse tone order: the right face first.
        const cube = cubes(container).find((g) => g.children.length === 3)!;
        const [left, right, top] = Array.from(cube.children).map(delay);
        expect(right).toBeLessThan(left);
        expect(left).toBeLessThan(top);
      }
      // Folded: the grid alone, complete, and not one face.
      settle();
      expect(faces(container)).toHaveLength(0);
      expect(svg.querySelectorAll(':scope > path[fill="none"]')).toHaveLength(outlines);
      expect(svg).toHaveAttribute("data-folded", "");
      // Back: the entrance again, dense edge first, onto the static field.
      rerender(<TileField {...small} enter={spec.enter} folded={false} />);
      inFlight = moving(spec.enterClass);
      expect(inFlight.length).toBeGreaterThan(5);
      denseFirst(inFlight);
      settle();
      expect(svg.innerHTML).toBe(staticMarkup());
    });

    it("hinges each unfolding face on the hexagon's centre vertex, and assembles each face from its own side", () => {
      const { container, rerender } = render(<TileField {...small} enter="unfold" />);
      const cube = () => cubes(container).find((g) => g.children.length === 3)!;
      // The faces in tone order; the markup draws the top last, so sort by fill.
      const inToneOrder = () =>
        Array.from(cube().children).sort(
          (a, b) => toneOf(a.getAttribute("fill")!) - toneOf(b.getAttribute("fill")!),
        );
      const toneOf = (fill: string) =>
        ["var(--kairos-light)", "var(--kairos-mid)", "var(--kairos-orange)"].indexOf(fill);
      // The corner of each face's own box that the point order puts the centre at, per tone.
      const centreIndex = [3, 1, 0];
      inToneOrder().forEach((p, tone) => {
        const style = (p as SVGPolygonElement).style;
        const pts = p
          .getAttribute("points")!
          .split(" ")
          .map((s) => s.split(",").map(Number));
        const xs = pts.map(([px]) => px);
        const ys = pts.map(([, py]) => py);
        const [cx, cy] = pts[centreIndex[tone]];
        const u = ((cx - Math.min(...xs)) / (Math.max(...xs) - Math.min(...xs))) * 100;
        const v = ((cy - Math.min(...ys)) / (Math.max(...ys) - Math.min(...ys))) * 100;
        const geometry = tileFaceMotion[tone as 0 | 1 | 2];
        const [ou, ov] = geometry.origin.split(" ").map(parseFloat);
        expect(Math.abs(u - ou)).toBeLessThan(0.5);
        expect(Math.abs(v - ov)).toBeLessThan(0.5);
        expect(style.transformOrigin).toBe(geometry.origin);
        expect(style.getPropertyValue("--tile-face")).toBe(`${geometry.angle}deg`);
        expect(style.getPropertyValue("--tile-dx")).toBe("");
      });
      rerender(<TileField {...small} enter="assemble" />);
      const from = inToneOrder().map((p) => [
        Number((p as SVGPolygonElement).style.getPropertyValue("--tile-dx")),
        Number((p as SVGPolygonElement).style.getPropertyValue("--tile-dy")),
      ]);
      // Top from above, left from the lower left, right from the lower right; no hinge set.
      expect(from[0]).toEqual([0, -1]);
      expect(from[1][0]).toBeLessThan(0);
      expect(from[1][1]).toBeGreaterThan(0);
      expect(from[2][0]).toBeGreaterThan(0);
      expect(from[2][1]).toBeGreaterThan(0);
      expect((cube().children[0] as SVGPolygonElement).style.transformOrigin).toBe("");
    });

    it("mounts folded as the grid alone, and with no entrance the cubes come and go with no motion", () => {
      const { container, rerender } = render(<TileField {...small} enter="unfold" folded />);
      expect(faces(container)).toHaveLength(0);
      expect(container.querySelectorAll("[class]")).toHaveLength(1);
      rerender(<TileField {...small} enter="unfold" folded={false} />);
      expect(container.querySelectorAll("polygon.tile-unfold").length).toBeGreaterThan(10);
      const { container: plain, rerender: rerenderPlain } = render(<TileField {...small} />);
      rerenderPlain(<TileField {...small} folded />);
      expect(faces(plain)).toHaveLength(0);
      expect(plain.querySelectorAll("[class]")).toHaveLength(1);
      rerenderPlain(<TileField {...small} folded={false} />);
      expect(plain.querySelector("svg")!.innerHTML).toBe(staticMarkup());
    });

    it("attaches no motion class under reduced motion: the cubes are simply there, or simply gone", () => {
      stubMedia({ reduced: true });
      const { container, rerender } = render(<TileField {...small} enter="fall" idle="live" />);
      const svg = container.querySelector("svg")!;
      expect(container.querySelectorAll(".tile-fall, .tile-in")).toHaveLength(0);
      expect(faces(container).length).toBeGreaterThan(10);
      // The idle breathing is CSS, pinned off by the media query; the static field is otherwise intact.
      expect(container.querySelectorAll("g.tile-live").length).toBeGreaterThan(0);
      for (const { enter } of entrances) {
        rerender(<TileField {...small} enter={enter} folded />);
        expect(container.querySelectorAll("[class]")).toHaveLength(1);
        expect(faces(container)).toHaveLength(0);
        rerender(<TileField {...small} enter={enter} />);
        expect(svg.innerHTML).toBe(staticMarkup());
      }
    });

    describe("wave", () => {
      // The delay is written as a share of the period the CSS owns, never a
      // literal duration; this reads the share back.
      const share = (el: Element) => {
        const m = (el as HTMLElement).style
          .getPropertyValue("--tile-wave-delay")
          .match(/^calc\(var\(--tile-wave-period\) \* (\d+(?:\.\d+)?)\)$/);
        expect(m).not.toBeNull();
        return Number(m![1]);
      };
      const y = (el: Element) =>
        Number(el.querySelector("polygon")!.getAttribute("points")!.split(" ")[0].split(",")[1]);
      const waving = (root: Element) => cubes(root).filter((g) => g.classList.contains("tile-wave"));

      it("rolls across every cube at rest, dense edge first and in order along each row, after the entrance", () => {
        vi.useFakeTimers();
        const { container, rerender } = render(<TileField {...small} enter="drop" idle="wave" />);
        const svg = container.querySelector("svg")!;
        expect(svg).toHaveAttribute("data-idle", "wave");
        // While the entrance is in flight the drop owns the cubes.
        expect(waving(container)).toHaveLength(0);
        expect(container.querySelectorAll("g.tile-in").length).toBeGreaterThan(5);
        settle();
        const all = waving(container);
        expect(all).toHaveLength(cubes(container).length);
        expect(all.length).toBeGreaterThan(5);
        expect(container.querySelectorAll(".tile-in, .tile-live")).toHaveLength(0);
        expect(container.querySelectorAll("polygon[class], polygon[style]")).toHaveLength(0);
        // Shares of the period, within the sweep, all of them.
        const shares = all.map(share);
        expect(Math.min(...shares)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...shares)).toBeLessThan(0.8);
        expect(new Set(shares).size).toBeGreaterThan(5);
        // The ramp is dense on the right, so the band sets out there and
        // runs left: along any one row the delay grows as x falls, with no
        // exception, and across the field the right edge goes well before
        // the left.
        const rows = new Map<number, Element[]>();
        for (const g of all) rows.set(y(g), [...(rows.get(y(g)) ?? []), g]);
        let checked = 0;
        for (const row of rows.values()) {
          if (row.length < 3) continue;
          const ordered = row.sort((a, b) => x(b) - x(a)).map(share);
          for (let i = 1; i < ordered.length; i++) expect(ordered[i]).toBeGreaterThanOrEqual(ordered[i - 1]);
          checked++;
        }
        expect(checked).toBeGreaterThan(1);
        expect(mean(all.filter((g) => x(g) > 300).map(share))).toBeLessThan(
          mean(all.filter((g) => x(g) < 120).map(share)) - 0.2,
        );
        // The rows do not march in one line: cubes in the same column, in
        // different rows, take different turns, every one of them.
        const columns = new Map<number, number[]>();
        for (const g of all) columns.set(x(g), [...(columns.get(x(g)) ?? []), share(g)]);
        const stacked = Array.from(columns.values()).filter((c) => c.length > 1);
        expect(stacked.length).toBeGreaterThan(3);
        for (const column of stacked) expect(new Set(column).size).toBe(column.length);
        // Same field, same wave.
        const { container: again } = render(<TileField {...small} idle="wave" />);
        expect(waving(again).map(share)).toEqual(shares);
        // Folded: the grid alone, not one cube and not one class.
        rerender(<TileField {...small} enter="drop" idle="wave" folded />);
        settle();
        expect(faces(container)).toHaveLength(0);
        expect(container.querySelectorAll("[class]")).toHaveLength(1);
        // Back, and the wave resumes once the cubes have landed.
        rerender(<TileField {...small} enter="drop" idle="wave" folded={false} />);
        expect(waving(container)).toHaveLength(0);
        settle();
        expect(waving(container).length).toBe(all.length);
      });

      it("follows the fade axis: left to right for a left fade, outward from the centre, and a custom bias by its denser side", () => {
        // Solid, so both edges have cubes to compare whichever way the field fades.
        const leftward = (ui: React.ReactElement) => {
          const all = waving(render(ui).container);
          const left = all.filter((g) => x(g) < 120).map(share);
          const right = all.filter((g) => x(g) > 300).map(share);
          expect(left.length).toBeGreaterThan(3);
          expect(right.length).toBeGreaterThan(3);
          return mean(left) < mean(right);
        };
        expect(leftward(<TileField {...small} idle="wave" solid fade="left" />)).toBe(true);
        expect(leftward(<TileField {...small} idle="wave" solid fade="right" />)).toBe(false);
        expect(leftward(<TileField {...small} idle="wave" solid fade={(u) => 0.9 - u * 0.8} />)).toBe(true);
        expect(leftward(<TileField {...small} idle="wave" solid fade={(u) => u * 0.9} />)).toBe(false);
        const centred = waving(render(<TileField {...small} idle="wave" fade="center" solid />).container);
        const middle = centred.filter((g) => Math.abs(x(g) - 200) < 40 && Math.abs(y(g) - 50) < 30);
        const edge = centred.filter((g) => x(g) < 60 || x(g) > 340);
        expect(middle.length).toBeGreaterThan(0);
        expect(mean(middle.map(share))).toBeLessThan(mean(edge.map(share)));
      });

      it("attaches nothing under reduced motion, and leaves the deprecated animate shorthand alone", () => {
        stubMedia({ reduced: true });
        const { container } = render(<TileField {...small} idle="wave" />);
        const svg = container.querySelector("svg")!;
        expect(svg).toHaveAttribute("data-idle", "wave");
        expect(container.querySelectorAll(".tile-wave")).toHaveLength(0);
        expect(svg.innerHTML).toBe(staticMarkup());
        stubMedia({ reduced: false });
        const attrs = (el: Element) => [el.getAttribute("data-enter"), el.getAttribute("data-idle")];
        for (const animate of ["in", "live", "cursor", false] as const) {
          const { container: c } = render(<TileField {...small} animate={animate} />);
          expect(c.querySelectorAll(".tile-wave")).toHaveLength(0);
          expect(attrs(c.querySelector("svg")!)[1]).not.toBe("wave");
        }
        const { container: both } = render(<TileField {...small} animate="live" idle="wave" />);
        expect(attrs(both.querySelector("svg")!)).toEqual(["drop", "wave"]);
      });
    });
  });

  describe("cursor mode", () => {
    const originalMedia = window.matchMedia;
    const originalRaf = window.requestAnimationFrame;
    const originalCaf = window.cancelAnimationFrame;
    afterEach(() => {
      window.matchMedia = originalMedia;
      window.requestAnimationFrame = originalRaf;
      window.cancelAnimationFrame = originalCaf;
    });

    it("renders the same polygons at rest as the static field, with the glow layer unlit", () => {
      stubMedia();
      stubFrames();
      const { svg, glows } = renderCursorField();
      const plain = render(
        <TileField fade="ramp" width={400} height={200} radius={25} seed={4} />,
      ).container.querySelector("svg")!;
      const markup = (root: Element) =>
        Array.from(root.querySelectorAll(":scope > path, :scope > g:not(.tile-glow) > polygon")).map(
          (p) => p.outerHTML,
        );
      expect(markup(svg)).toEqual(markup(plain));
      expect(markup(svg).length).toBeGreaterThan(50);
      expect(svg).toHaveAttribute("data-idle", "cursor");
      expect(svg).not.toHaveAttribute("data-enter");
      // One glow per hexagon, on the cell's own points, resting with no intensity written.
      expect(glows.length).toBe(tileField({ width: 400, height: 200, radius: 25, seed: 4 }).length / 3);
      expect(glows.every((g) => g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
      const glowPoints = glows.flatMap((g) =>
        Array.from(g.querySelectorAll("polygon")).map((p) => p.getAttribute("points")),
      );
      const gridPoints = tileField({
        width: 400,
        height: 200,
        radius: 25,
        seed: 4,
        bias: tileFades.ramp,
      }).map((p) => p.points);
      expect(glowPoints).toEqual(gridPoints);
      // A filled cell's glow is the white highlight; an empty cell's is its own tone.
      const fills = new Set(
        glows.flatMap((g) => Array.from(g.querySelectorAll("polygon")).map((p) => p.getAttribute("fill"))),
      );
      expect(fills.has("var(--white)")).toBe(true);
      expect(fills.has("var(--kairos-orange)")).toBe(true);
    });

    it("lights the cubes near the pointer from one frame per move and clears them when it leaves", () => {
      stubMedia();
      const frames = stubFrames();
      const { parent, glows, centre, lit } = renderCursorField();
      fireEvent.pointerMove(parent, { clientX: 190, clientY: 90 });
      fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
      fireEvent.pointerMove(parent, { clientX: 210, clientY: 100 });
      // Three moves, one frame booked.
      expect(frames.pending()).toBe(1);
      expect(glows.every((g) => lit(g) === 0)).toBe(true);
      frames.flush();
      const distance = (g: Element) => Math.hypot(centre(g).x - 210, centre(g).y - 100);
      const near = glows.filter((g) => distance(g) < 30);
      const far = glows.filter((g) => distance(g) > 120);
      expect(near.length).toBeGreaterThan(0);
      expect(far.length).toBeGreaterThan(10);
      expect(near.every((g) => lit(g) > 0.5)).toBe(true);
      expect(far.every((g) => lit(g) === 0 && g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
      // Falls off with distance, never above 1.
      const sorted = glows.filter((g) => lit(g) > 0).sort((a, b) => distance(a) - distance(b));
      for (let i = 1; i < sorted.length; i++) expect(lit(sorted[i])).toBeLessThanOrEqual(lit(sorted[i - 1]));
      expect(Math.max(...glows.map(lit))).toBeLessThanOrEqual(1);
      // Leaving books a frame that clears every cube.
      fireEvent.pointerLeave(parent);
      expect(frames.pending()).toBe(1);
      frames.flush();
      expect(glows.every((g) => g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
    });

    it("listens on the parent, not the SVG, and removes the listeners and the frame on unmount", () => {
      stubMedia();
      stubFrames();
      const { parent, svg, unmount } = renderCursorField();
      expect(svg.className.baseVal).toContain("pointer-events-none");
      const add = vi.spyOn(parent, "addEventListener");
      const remove = vi.spyOn(parent, "removeEventListener");
      // The listeners went on before the spies; re-attach by moving the pointer and checking the frame.
      fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
      unmount();
      expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
      expect(remove).toHaveBeenCalledWith("pointerleave", expect.any(Function));
      expect(add).not.toHaveBeenCalled();
    });

    it("attaches nothing without a hovering fine pointer, under reduced motion, or without matchMedia", () => {
      stubFrames();
      // React delegates its own native listeners onto the root container, so
      // only count what went on the field's parent.
      const attached = () => {
        const add = vi.spyOn(HTMLElement.prototype, "addEventListener");
        const { parent } = renderCursorField();
        const calls = add.mock.calls.filter(
          ([type], i) =>
            add.mock.contexts[i] === parent && (type === "pointermove" || type === "pointerleave"),
        );
        fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
        add.mockRestore();
        return calls.length;
      };
      stubMedia({ hover: false });
      expect(attached()).toBe(0);
      stubMedia({ reduced: true });
      expect(attached()).toBe(0);
      // @ts-expect-error a browser without matchMedia, or jsdom as it ships
      window.matchMedia = undefined;
      expect(attached()).toBe(0);
      expect(window.requestAnimationFrame).not.toHaveBeenCalled();
      stubMedia();
      expect(attached()).toBe(2);
    });

    it("follows a target element instead of the parent when given one", () => {
      stubMedia();
      const frames = stubFrames();
      const target = React.createRef<HTMLDivElement>();
      const { container } = render(
        <>
          <div ref={target} />
          <div className="relative">
            <TileField idle="cursor" target={target} width={400} height={200} radius={25} />
          </div>
        </>,
      );
      const svg = container.querySelector("svg")!;
      svg.getBoundingClientRect = () =>
        ({ left: 0, top: 0, right: 400, bottom: 200, width: 400, height: 200, x: 0, y: 0 }) as DOMRect;
      fireEvent.pointerMove(svg.parentElement!, { clientX: 200, clientY: 100 });
      expect(frames.pending()).toBe(0);
      fireEvent.pointerMove(target.current!, { clientX: 200, clientY: 100 });
      expect(frames.pending()).toBe(1);
      frames.flush();
      expect(svg.querySelectorAll('g.tile-glow[style*="--tile-lit"]').length).toBeGreaterThan(0);
    });
  });

  it("TileUnit has the three tones in the logo's order, the top drawn last", () => {
    const { container } = render(<TileUnit />);
    const fills = Array.from(container.querySelectorAll("polygon")).map((p) => p.getAttribute("fill"));
    expect(fills).toEqual(["var(--kairos-mid)", "var(--kairos-orange)", "var(--kairos-light)"]);
    // The top face is the first of tileHexagon's three: the one whose last point is the centre.
    const top = container.querySelector('polygon[fill="var(--kairos-light)"]')!;
    expect(top.getAttribute("points")!.split(" ").at(-1)).toBe("43.3,50");
  });

  it("Tile keeps the 22:14 box", () => {
    const { container } = render(<Tile size={44} tone="rest" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("height", "28");
    expect(svg.querySelector("polygon")).toHaveAttribute("fill", "var(--inner)");
  });

  it("TileBar is a progressbar with one tile per item", () => {
    const { container } = render(<TileBar total={10} done={4} aria-label="Rollout" />);
    const bar = screen.getByRole("progressbar", { name: "Rollout" });
    expect(bar).toHaveAttribute("aria-valuemax", "10");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "4 of 10");
    expect(container.querySelectorAll("svg")).toHaveLength(10);
    expect(container.querySelectorAll('polygon[fill="var(--inner)"]')).toHaveLength(6);
  });

  it("TileBar clamps done to the range", () => {
    render(<TileBar total={3} done={9} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  });

  it("paints the Hadron palette with the blue custom properties and the right ink", () => {
    const { container } = render(<TileUnit palette="hadron" />);
    const fills = Array.from(container.querySelectorAll("polygon")).map((p) => p.getAttribute("fill"));
    expect(fills).toEqual(["var(--hadron-blue)", "var(--hadron-deep)", "var(--hadron-sky)"]);
    render(
      <>
        <TileMarker palette="hadron" tone={0}>
          sky
        </TileMarker>
        <TileMarker palette="hadron" tone={2}>
          deep
        </TileMarker>
      </>,
    );
    expect(screen.getByText("sky").className).toContain("text-ink");
    expect(screen.getByText("deep").className).toContain("text-bg");
  });

  it("TileMarker shows its number in navy on the tone", () => {
    render(<TileMarker tone={1}>03</TileMarker>);
    const marker = screen.getByText("03");
    expect(marker.className).toContain("text-ink");
    expect(marker.className).toContain("bg-kairos-mid");
    expect(marker.className).toContain("clip-path");
  });
});
