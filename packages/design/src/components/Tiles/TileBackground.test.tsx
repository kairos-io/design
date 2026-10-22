import * as React from "react";
import { fireEvent, render } from "@testing-library/react";
import { TileBackground } from "./TileBackground.tsx";
import { tileBackground, tileVignette } from "../../lib/tileBackground.ts";

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
const small = { width: 400, height: 200, radius: 25, seed: 4 } as const;
function renderPlane(props: Partial<React.ComponentProps<typeof TileBackground>> = {}) {
  const result = render(
    <div className="relative">
      <TileBackground {...small} {...props} />
    </div>,
  );
  const svg = result.container.querySelector("svg")!;
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 400, bottom: 200, width: 400, height: 200, x: 0, y: 0 }) as DOMRect;
  const glows = Array.from(
    svg.querySelectorAll<SVGGElement>(":scope > g.tile-bg-lit, :scope > g.tile-bg-ring"),
  );
  const wakes = Array.from(svg.querySelectorAll<SVGGElement>(":scope > g.tile-bg-wake"));
  // The first face of a cube is [p5, p0, p1, centre], so its last point is the hexagon's centre.
  const centre = (g: Element) => {
    const [x, y] = g.querySelector("polygon")!.getAttribute("points")!.split(" ").at(-1)!.split(",");
    return { x: Number(x), y: Number(y) };
  };
  const lit = (g: Element) => Number((g as SVGGElement).style.getPropertyValue("--tile-lit") || 0);
  return { ...result, svg, parent: svg.parentElement!, glows, wakes, centre, lit };
}

describe("tileBackground", () => {
  it("is deterministic and keeps every cube's three faces on the field's points", () => {
    const a = tileBackground(small);
    const b = tileBackground(small);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(20);
    expect(a.every((c) => c.faces.length === 3 && c.faces.map((f) => f.tone).join() === "0,1,2")).toBe(true);
    expect(tileBackground({ ...small, seed: 9 })).not.toEqual(a);
  });

  it("vignettes the outlines: fainter at the corner than at the centre, flat when off", () => {
    const soft = tileVignette(0.6);
    expect(soft(0.5, 0.5)).toBe(1);
    expect(soft(0, 0)).toBeCloseTo(0.4);
    expect(soft(0.5, 0)).toBeGreaterThan(soft(0, 0));
    const cubes = tileBackground(small);
    const byDistance = [...cubes].sort(
      (p, q) => Math.hypot(p.x - 200, p.y - 100) - Math.hypot(q.x - 200, q.y - 100),
    );
    const centre = byDistance.slice(0, 4).reduce((s, c) => s + c.outline, 0) / 4;
    const edge = byDistance.slice(-4).reduce((s, c) => s + c.outline, 0) / 4;
    expect(edge).toBeLessThan(centre);
    const flat = tileBackground({ ...small, vignette: false });
    expect(Math.max(...flat.map((c) => c.outline)) - Math.min(...flat.map((c) => c.outline))).toBeLessThan(
      0.3,
    );
    expect(flat.every((c) => c.outline > 0.7)).toBe(true);
  });

  it("steps the outline by row with depth, lower rows nearer", () => {
    const cubes = tileBackground({ ...small, vignette: false, depth: true });
    const rows = new Map<number, number[]>();
    for (const c of cubes) rows.set(c.row, [...(rows.get(c.row) ?? []), c.outline]);
    const means = [...rows.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, list]) => list.reduce((s, o) => s + o, 0) / list.length);
    expect(means.length).toBeGreaterThan(3);
    expect(means[0]).toBeLessThan(means[means.length - 1]);
    for (let i = 1; i < means.length; i++) expect(means[i]).toBeGreaterThan(means[i - 1] - 0.05);
  });
});

describe("TileBackground", () => {
  const originalMedia = window.matchMedia;
  const originalRaf = window.requestAnimationFrame;
  const originalCaf = window.cancelAnimationFrame;
  afterEach(() => {
    window.matchMedia = originalMedia;
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCaf;
  });

  it("is decorative, fills its parent and draws outlines only, no filled polygon", () => {
    const { svg, glows, wakes } = renderPlane();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    expect(svg.className.baseVal).toContain("pointer-events-none");
    expect(svg.className.baseVal).toContain("absolute");
    expect(svg.className.baseVal).toContain("inset-0");
    const groups = Array.from(svg.querySelectorAll(":scope > g"));
    expect(groups.length).toBeGreaterThan(20);
    expect(
      groups.every((g) => g.getAttribute("fill") === "none" && g.getAttribute("stroke") === "var(--line)"),
    ).toBe(true);
    expect(groups.every((g) => g.querySelectorAll("polygon").length === 3)).toBe(true);
    expect(svg.querySelectorAll("polygon[fill]:not([fill='none'])").length).toBe(0);
    expect(glows.length).toBe(0);
    expect(wakes.length).toBe(0);
    expect(svg).not.toHaveAttribute("data-cursor");
  });

  it("is deterministic: the same seed renders the same plane, and the cursor never changes the grid", () => {
    const grid = (props: Partial<React.ComponentProps<typeof TileBackground>>) =>
      Array.from(renderPlane(props).svg.querySelectorAll(":scope > g:not([class])")).map((g) => g.outerHTML);
    const plain = grid({});
    expect(grid({})).toEqual(plain);
    expect(grid({ cursor: "lines" })).toEqual(plain);
    expect(grid({ cursor: "fill" })).toEqual(plain);
    expect(grid({ cursor: "ripple" })).toEqual(plain);
    expect(grid({ seed: 9 })).not.toEqual(plain);
  });

  it("vignettes the outlines: the corner cubes fainter than the centre ones", () => {
    const { svg } = renderPlane();
    const opacity = (g: Element) => Number(g.getAttribute("stroke-opacity") ?? 1);
    const groups = Array.from(svg.querySelectorAll(":scope > g"));
    const centre = (g: Element) => {
      const [x, y] = g.querySelector("polygon")!.getAttribute("points")!.split(" ").at(-1)!.split(",");
      return Math.hypot(Number(x) - 200, Number(y) - 100);
    };
    const sorted = groups.sort((a, b) => centre(a) - centre(b));
    const mean = (list: Element[]) => list.reduce((s, g) => s + opacity(g), 0) / list.length;
    expect(mean(sorted.slice(-6))).toBeLessThan(mean(sorted.slice(0, 6)));
    expect(renderPlane({ depth: true }).svg).toHaveAttribute("data-depth");
  });

  it("lights the cubes near the pointer from one frame per move and clears them when it leaves", () => {
    stubMedia();
    const frames = stubFrames();
    const { parent, svg, glows, centre, lit } = renderPlane({ cursor: "lines" });
    expect(svg).toHaveAttribute("data-cursor", "lines");
    expect(glows.length).toBe(svg.querySelectorAll(":scope > g:not([class])").length);
    expect(
      glows.every((g) => g.getAttribute("stroke") === "var(--accent)" && g.getAttribute("fill") === "none"),
    ).toBe(true);
    fireEvent.pointerMove(parent, { clientX: 190, clientY: 90 });
    fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(parent, { clientX: 210, clientY: 100 });
    expect(frames.pending()).toBe(1);
    expect(glows.every((g) => lit(g) === 0)).toBe(true);
    frames.flush();
    const distance = (g: Element) => Math.hypot(centre(g).x - 210, centre(g).y - 100);
    const near = glows.filter((g) => distance(g) < 30);
    const far = glows.filter((g) => distance(g) > 120);
    expect(near.length).toBeGreaterThan(0);
    expect(far.length).toBeGreaterThan(5);
    expect(near.every((g) => lit(g) > 0.5)).toBe(true);
    expect(far.every((g) => g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
    const sorted = glows.filter((g) => lit(g) > 0).sort((a, b) => distance(a) - distance(b));
    for (let i = 1; i < sorted.length; i++) expect(lit(sorted[i])).toBeLessThanOrEqual(lit(sorted[i - 1]));
    expect(Math.max(...glows.map(lit))).toBeLessThanOrEqual(1);
    fireEvent.pointerLeave(parent);
    expect(frames.pending()).toBe(1);
    frames.flush();
    expect(glows.every((g) => g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
  });

  it("fills the cube under the pointer in its tones and trails it, with the ink highlight when asked", () => {
    stubMedia();
    const frames = stubFrames();
    const { parent, glows, wakes, centre } = renderPlane({
      cursor: "fill",
      highlight: "ink",
      palette: "hadron",
    });
    expect(wakes.length).toBe(glows.length);
    expect(glows.every((g) => g.getAttribute("stroke") === "var(--ink)")).toBe(true);
    const fills = new Set(
      wakes.flatMap((g) => Array.from(g.querySelectorAll("polygon")).map((p) => p.getAttribute("fill"))),
    );
    expect(fills).toEqual(new Set(["var(--hadron-sky)", "var(--hadron-blue)", "var(--hadron-deep)"]));
    fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
    frames.flush();
    const fill = (g: Element) => Number((g as SVGGElement).style.getPropertyValue("--tile-fill") || 0);
    // A wake draws its top face last, so take the centre from the lit group at the same index.
    const distance = (g: Element) => {
      const i = wakes.indexOf(g as SVGGElement);
      const c = centre(i >= 0 ? glows[i] : g);
      return Math.hypot(c.x - 200, c.y - 100);
    };
    // The faces are drawn sides first, the top last, with the face stroke under the fill.
    expect(wakes[0].getAttribute("paint-order")).toBe("stroke");
    expect(wakes[0].getAttribute("stroke-linejoin")).toBe("bevel");
    expect(Array.from(wakes[0].querySelectorAll("polygon")).map((p) => p.getAttribute("fill"))).toEqual([
      "var(--hadron-blue)",
      "var(--hadron-deep)",
      "var(--hadron-sky)",
    ]);
    const under = wakes.filter((g) => distance(g) < 15);
    expect(under.length).toBe(1);
    expect(fill(under[0])).toBeGreaterThan(0.6);
    expect(under[0]).toHaveAttribute("data-lit");
    // The fill is tighter than the light: a cube two radii away is lit but not filled.
    const beside = wakes.filter((g) => distance(g) > 50 && distance(g) < 75);
    expect(beside.length).toBeGreaterThan(0);
    expect(beside.every((g) => fill(g) === 0 && !g.hasAttribute("data-lit"))).toBe(true);
    expect(
      glows
        .filter((g) => distance(g) > 50 && distance(g) < 75)
        .some((g) => g.style.getPropertyValue("--tile-lit") !== ""),
    ).toBe(true);
    fireEvent.pointerLeave(parent);
    frames.flush();
    expect(wakes.every((g) => fill(g) === 0 && !g.hasAttribute("data-lit"))).toBe(true);
  });

  it("ripples once from a press and never lights on a move", () => {
    stubMedia();
    const frames = stubFrames();
    const { parent, glows, centre } = renderPlane({ cursor: "ripple" });
    expect(glows.every((g) => g.classList.contains("tile-bg-ring"))).toBe(true);
    fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
    frames.flush();
    expect(glows.every((g) => g.style.getPropertyValue("--tile-lit") === "")).toBe(true);
    fireEvent.pointerDown(parent, { clientX: 200, clientY: 100 });
    const rippling = glows.filter((g) => g.classList.contains("tile-bg-ripple"));
    expect(rippling.length).toBeGreaterThan(10);
    const distance = (g: Element) => Math.hypot(centre(g).x - 200, centre(g).y - 100);
    const delay = (g: Element) =>
      Number(/\* ([\d.]+)\)/.exec((g as SVGGElement).style.getPropertyValue("--tile-delay"))?.[1]);
    const amplitude = (g: Element) => Number((g as SVGGElement).style.getPropertyValue("--tile-ripple"));
    const sorted = [...rippling].sort((a, b) => distance(a) - distance(b));
    expect(delay(sorted[0])).toBeLessThan(0.1);
    expect(amplitude(sorted[0])).toBe(1);
    // Centres are rounded to a hundredth in the markup, so neighbours a hair apart may swap.
    for (let i = 1; i < sorted.length; i++) {
      expect(delay(sorted[i])).toBeGreaterThanOrEqual(delay(sorted[i - 1]) - 0.01);
      expect(amplitude(sorted[i])).toBeLessThanOrEqual(amplitude(sorted[i - 1]) + 0.05);
    }
    // The delay is a share of the span token, never a literal duration.
    expect(sorted[0].style.getPropertyValue("--tile-delay")).toMatch(
      /^calc\(var\(--tile-bg-ripple-span\) \* /,
    );
    // The ring is one shot: the class comes off when the animation ends.
    fireEvent.animationEnd(sorted[0]);
    expect(sorted[0].classList.contains("tile-bg-ripple")).toBe(false);
    // A touch press does nothing.
    fireEvent.pointerDown(parent, { clientX: 100, clientY: 100, pointerType: "touch" });
    expect(sorted[0].classList.contains("tile-bg-ripple")).toBe(false);
    // A second press restarts every ring cell.
    fireEvent.pointerDown(parent, { clientX: 100, clientY: 100 });
    expect(sorted[0].classList.contains("tile-bg-ripple")).toBe(true);
  });

  it("listens on the parent, not the SVG, and removes the listeners and the frame on unmount", () => {
    stubMedia();
    stubFrames();
    const { parent, svg, unmount } = renderPlane({ cursor: "ripple" });
    const remove = vi.spyOn(parent, "removeEventListener");
    const add = vi.spyOn(parent, "addEventListener");
    // A move over the SVG bubbles to the parent; two moves book one frame.
    fireEvent.pointerMove(svg, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("pointerleave", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(add).not.toHaveBeenCalled();
  });

  it("attaches nothing without a hovering fine pointer, under reduced motion, without matchMedia, or when off", () => {
    stubFrames();
    // React delegates its own native listeners onto the root container, so
    // only count what went on the plane's parent.
    const attached = (props: Partial<React.ComponentProps<typeof TileBackground>> = { cursor: "lines" }) => {
      const add = vi.spyOn(HTMLElement.prototype, "addEventListener");
      const { parent, glows, unmount } = renderPlane(props);
      const calls = add.mock.calls.filter(
        ([type], i) => add.mock.contexts[i] === parent && type.startsWith("pointer"),
      );
      fireEvent.pointerMove(parent, { clientX: 200, clientY: 100 });
      fireEvent.pointerDown(parent, { clientX: 200, clientY: 100 });
      add.mockRestore();
      const touched = glows.filter((g) => g.hasAttribute("style") || g.classList.contains("tile-bg-ripple"));
      unmount();
      return { calls: calls.length, touched: touched.length };
    };
    stubMedia({ hover: false });
    expect(attached()).toEqual({ calls: 0, touched: 0 });
    stubMedia({ reduced: true });
    expect(attached()).toEqual({ calls: 0, touched: 0 });
    expect(attached({ cursor: "ripple" })).toEqual({ calls: 0, touched: 0 });
    // @ts-expect-error a browser without matchMedia, or jsdom as it ships
    window.matchMedia = undefined;
    expect(attached()).toEqual({ calls: 0, touched: 0 });
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    stubMedia();
    expect(attached({ cursor: false })).toEqual({ calls: 0, touched: 0 });
    expect(attached().calls).toBe(2);
    expect(attached({ cursor: "ripple" }).calls).toBe(3);
  });

  it("follows a target element instead of the parent when given one", () => {
    stubMedia();
    const frames = stubFrames();
    const target = React.createRef<HTMLDivElement>();
    const { container } = render(
      <>
        <div ref={target} />
        <div className="relative">
          <TileBackground {...small} cursor="lines" target={target} />
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
    expect(svg.querySelectorAll('g.tile-bg-lit[style*="--tile-lit"]').length).toBeGreaterThan(0);
  });
});
