import { act, render, screen } from "@testing-library/react";
import { TileBar } from "./TileBar.tsx";
import { TileLoader } from "./TileLoader.tsx";
import { TileRing } from "./TileRing.tsx";
import { quietPoint } from "./loop.ts";

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

const brandFaces = (root: Element) =>
  Array.from(root.querySelectorAll("polygon[data-tone]:not([data-status-face])"));
const statusFaces = (root: Element) => Array.from(root.querySelectorAll("polygon[data-status-face]"));
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("a loader's status", () => {
  const originalMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMedia;
    vi.useRealTimers();
  });

  it("finds the next moment no face is mid-motion, and which faces are away then", () => {
    const faces = [0, 270, 540].map((delay) => ({ delay }));
    // At 100ms the first face is coming in: the cube is quiet once the last has landed, at 1080ms
    // (a face counts as landed a few ms before its keyframes end).
    const wait = quietPoint(100, faces, "loop").wait;
    expect(wait).toBeGreaterThanOrEqual(940);
    expect(wait).toBeLessThanOrEqual(980);
    expect(quietPoint(1200, faces, "loop")).toEqual({ wait: 0, away: [false, false, false] });
    // Deep in the loop's leaving, the faces overlap on purpose (one is always showing), so the next
    // quiet moment is the next rest, with every face back and none away.
    const leaving = quietPoint(1700, faces, "loop");
    expect(leaving.wait).toBeGreaterThan(1000);
    expect(leaving.away).toEqual([false, false, false]);
    // A ring in "build" has a moment when every cube is away: the faces are marked so.
    const ring6 = [0, 1, 2, 3, 4, 5].flatMap((c) => [0, 270, 540].map((f) => ({ delay: c * 1080 + f })));
    const gone = quietPoint(16 * 540, ring6, "build");
    expect(gone.wait).toBe(0);
    expect(gone.away.filter(Boolean).length).toBeGreaterThan(0);
    // The ring's laps touch at their boundaries: there is always a quiet instant within one lap.
    const ring = [0, 1, 2, 3, 4, 5].flatMap((c) => [0, 270, 540].map((f) => ({ delay: c * 1080 + f })));
    for (const cycle of ["chase", "build"] as const) {
      for (const t of [0, 500, 3000, 7000, 12000])
        expect(quietPoint(t, ring, cycle).wait).toBeLessThan(26 * 540);
    }
  });

  it("TileLoader: the loop runs to its quiet moment, the green faces land once, onSettled fires once, the name updates", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileLoader onSettled={onSettled} />);
    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(statusFaces(container)).toHaveLength(0);
    advance(100);
    rerender(<TileLoader status="success" onSettled={onSettled} />);
    // Still looping until the cube has landed; the name is already the outcome.
    expect(brandFaces(container).every((p) => p.classList.contains("tile-loop-assemble"))).toBe(true);
    expect(statusFaces(container)).toHaveLength(0);
    expect(screen.getByRole("img", { name: "Done" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    expect(container.querySelector("svg")).toHaveAttribute("data-status", "success");
    advance(1000);
    // Landing: the loop is off, the success faces come in once in tone order over the brand ones.
    expect(brandFaces(container).some((p) => p.hasAttribute("class"))).toBe(false);
    const green = statusFaces(container);
    expect(green).toHaveLength(3);
    expect(green.every((p) => p.classList.contains("tile-step-assemble"))).toBe(true);
    expect(green.map((p) => p.getAttribute("fill")).sort()).toEqual([
      "var(--tile-success-deep)",
      "var(--tile-success-light)",
      "var(--tile-success-mid)",
    ]);
    expect(onSettled).not.toHaveBeenCalled();
    advance(1100);
    // Settled: the green cube stands, with no class on anything, and the callback has fired once.
    expect(statusFaces(container)).toHaveLength(3);
    expect(container.querySelectorAll("polygon[class]")).toHaveLength(0);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith("success");
    advance(5000);
    expect(onSettled).toHaveBeenCalledTimes(1);
    // Error is the same in the reds; back to loading starts the loop again.
    rerender(<TileLoader status="error" onSettled={onSettled} />);
    advance(3000);
    expect(statusFaces(container)[0]).toHaveAttribute("fill", expect.stringContaining("--tile-error"));
    expect(screen.getByRole("img", { name: "Failed" })).toBeInTheDocument();
    expect(onSettled).toHaveBeenLastCalledWith("error");
    rerender(<TileLoader status="loading" onSettled={onSettled} />);
    expect(statusFaces(container)).toHaveLength(0);
    expect(brandFaces(container).every((p) => p.classList.contains("tile-loop-assemble"))).toBe(true);
  });

  it("TileLoader under reduced motion turns green at once and still reports", () => {
    stubReducedMotion(true);
    const onSettled = vi.fn();
    render(<TileLoader status="success" onSettled={onSettled} />);
    const green = statusFaces(document.body);
    expect(green).toHaveLength(3);
    expect(document.querySelectorAll("polygon[class]")).toHaveLength(0);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("img", { name: "Done" })).toBeInTheDocument();
  });

  it("TileRing: a final green lap builds the mark cube by cube after the lap's quiet moment", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileRing onSettled={onSettled} />);
    advance(200);
    rerender(<TileRing status="success" onSettled={onSettled} />);
    expect(statusFaces(container)).toHaveLength(0);
    // The first cube lands at 1080ms; the search finds the boundary.
    advance(1000);
    const green = statusFaces(container);
    expect(green).toHaveLength(18);
    expect(green.every((p) => p.classList.contains("tile-step-assemble"))).toBe(true);
    const delays = Array.from(container.querySelectorAll("g[data-status-cube]")).map((g) =>
      Math.min(
        ...Array.from(g.children).map((p) =>
          parseInt((p as HTMLElement).style.getPropertyValue("--tile-delay")),
        ),
      ),
    );
    expect(delays).toEqual([0, 1080, 2160, 3240, 4320, 5400]);
    // Cubes that had not come in yet stay away rather than snap in under the green.
    expect(brandFaces(container).filter((p) => p.getAttribute("opacity") === "0").length).toBeGreaterThan(0);
    expect(brandFaces(container).some((p) => p.hasAttribute("class"))).toBe(false);
    advance(6500);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("polygon[class]")).toHaveLength(0);
    expect(screen.getByRole("img", { name: "Done" })).toBeInTheDocument();
  });

  it("TileBar: the done tiles crossfade and the current one comes in green, left to right, then the bar rests", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileBar total={8} done={3} current onSettled={onSettled} />);
    advance(100);
    rerender(<TileBar total={8} done={3} current status="success" onSettled={onSettled} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-busy");
    expect(bar).toHaveAttribute("data-status", "success");
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    // The running tile lands at 540ms; the bar is landing from then.
    advance(600);
    const green = statusFaces(container);
    // Tiles 0..3: three done crossfade, the running one assembles, each a step after the last.
    expect(green).toHaveLength(4);
    expect(green.slice(0, 3).every((p) => p.classList.contains("tile-settle"))).toBe(true);
    expect(green[3]).toHaveClass("tile-step-assemble");
    expect(green.map((p) => parseInt((p as HTMLElement).style.getPropertyValue("--tile-delay")))).toEqual([
      0, 60, 120, 180,
    ]);
    expect(container.querySelectorAll(".tile-loop-assemble")).toHaveLength(0);
    advance(1000);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("polygon[class]")).toHaveLength(0);
    expect(statusFaces(container)).toHaveLength(4);
    // An indeterminate bar crossfades every tile at once.
    const { container: wave } = render(<TileBar total={5} current status="success" />);
    advance(10);
    expect(statusFaces(wave)).toHaveLength(5);
    expect(statusFaces(wave).every((p) => p.classList.contains("tile-settle"))).toBe(true);
  });

  it("TileBar under reduced motion turns green at once", () => {
    stubReducedMotion(true);
    const onSettled = vi.fn();
    const { container } = render(<TileBar total={6} done={2} current status="error" onSettled={onSettled} />);
    expect(statusFaces(container)).toHaveLength(3);
    expect(statusFaces(container)[0]).toHaveAttribute("fill", "var(--tile-error-light)");
    expect(container.querySelectorAll("polygon[class]")).toHaveLength(0);
    expect(onSettled).toHaveBeenCalledWith("error");
    expect(screen.getByRole("status")).toHaveTextContent("Failed");
  });
});
