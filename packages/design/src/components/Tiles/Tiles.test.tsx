import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tile, TileBar, TileField, TileMarker, TileUnit } from "./Tiles.tsx";

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
      <TileField animate="cursor" fade="ramp" width={400} height={200} radius={25} seed={4} />
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
    expect(svg.querySelectorAll("polygon").length).toBeGreaterThan(10);
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
    // The grid is complete underneath, one outline per cell, filled or not.
    expect(container.querySelectorAll('polygon[fill="none"]')).toHaveLength(
      container.querySelectorAll("g polygon").length,
    );
    const { container: faded } = render(<TileField fade={() => 0} width={100} height={60} radius={30} />);
    expect(faded.querySelector("polygon")).toHaveAttribute("stroke", "var(--line)");
  });

  it("fades the outlines with the field so the sparse edge dissolves", () => {
    const { container } = render(<TileField fade="ramp" width={600} height={200} radius={20} seed={9} />);
    // A filled face keeps a full outline wherever it is, so only the empty cells show the fade.
    const filled = new Set(
      Array.from(container.querySelectorAll("g polygon")).map((p) => p.getAttribute("points")),
    );
    const outlines = Array.from(container.querySelectorAll('polygon[fill="none"]')).filter(
      (p) => !filled.has(p.getAttribute("points")),
    );
    const x = (p: Element) => Number(p.getAttribute("points")!.split(" ")[0].split(",")[0]);
    const opacity = (p: Element) => Number(p.getAttribute("stroke-opacity") ?? 1);
    const sparse = outlines.filter((p) => x(p) < 60).map(opacity);
    const dense = outlines.filter((p) => x(p) > 540).map(opacity);
    expect(sparse.length).toBeGreaterThan(0);
    expect(Math.max(...sparse)).toBeLessThan(0.2);
    expect(Math.min(...dense)).toBeGreaterThan(0.85);
    // A full outline omits the attribute rather than writing 1.
    expect(container.querySelector('polygon[stroke-opacity="1"]')).toBeNull();
    // The filled faces themselves never fade; only the hairlines beneath do.
    expect(container.querySelectorAll("g polygon[stroke-opacity]")).toHaveLength(0);
    // A solid field has no sparse edge, so its grid is complete and full.
    const { container: solid } = render(<TileField solid width={100} height={60} radius={30} />);
    expect(solid.querySelectorAll("polygon[stroke-opacity]")).toHaveLength(0);
  });

  it("animates filled tiles only, dense edge first, then settles back to plain paint", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <TileField animate="in" fade="ramp" width={400} height={100} radius={25} seed={2} />,
      );
      const filled = Array.from(container.querySelectorAll("g.tile-in"));
      const outlines = Array.from(container.querySelectorAll('polygon[fill="none"]'));
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
      const field = (animate: "cursor" | false) =>
        render(<TileField animate={animate} fade="ramp" width={400} height={200} radius={25} seed={4} />);
      const { svg, glows } = renderCursorField();
      const plain = field(false).container.querySelector("svg")!;
      const markup = (root: Element) =>
        Array.from(root.querySelectorAll(":scope > polygon, :scope > g:not(.tile-glow) > polygon")).map(
          (p) => p.outerHTML,
        );
      expect(markup(svg)).toEqual(markup(plain));
      expect(markup(svg).length).toBeGreaterThan(50);
      expect(svg).toHaveAttribute("data-animate", "cursor");
      // One glow per hexagon, on the cell's own points, resting with no intensity written.
      expect(glows.length).toBe(svg.querySelectorAll(":scope > polygon").length / 3);
      expect(glows.every((g) => g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
      const glowPoints = glows.flatMap((g) =>
        Array.from(g.querySelectorAll("polygon")).map((p) => p.getAttribute("points")),
      );
      const gridPoints = Array.from(svg.querySelectorAll(":scope > polygon")).map((p) =>
        p.getAttribute("points"),
      );
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
            <TileField animate="cursor" target={target} width={400} height={200} radius={25} />
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

  it("TileUnit has the three tones in the logo's order", () => {
    const { container } = render(<TileUnit />);
    const fills = Array.from(container.querySelectorAll("polygon")).map((p) => p.getAttribute("fill"));
    expect(fills).toEqual(["var(--kairos-light)", "var(--kairos-mid)", "var(--kairos-orange)"]);
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
    expect(fills).toEqual(["var(--hadron-sky)", "var(--hadron-blue)", "var(--hadron-deep)"]);
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
