import { act, render, screen } from "@testing-library/react";
import { TileBar } from "./TileBar.tsx";
import { TileLoader } from "./TileLoader.tsx";
import { TileRing } from "./TileRing.tsx";
import { RESOLVE_FADE, RESOLVE_LAND, RESOLVE_STEP, resolveDelay } from "./loop.ts";

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

/** Pretend the faces named are mid-motion: jsdom has no animated computed styles, so the live values are stubbed. */
function stubLive(moving: Record<string, { transform: string; opacity: string }>) {
  const real = window.getComputedStyle;
  return vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
    const style = real(el);
    const key = el.getAttribute("data-face") ?? (el.hasAttribute("data-gate") ? "gate" : null);
    const live = key !== null ? moving[key] : undefined;
    if (!live) return style;
    return new Proxy(style, {
      get: (target, prop) =>
        prop === "transform" ? live.transform : prop === "opacity" ? live.opacity : Reflect.get(target, prop),
    });
  });
}

const brandFaces = (root: Element) =>
  Array.from(root.querySelectorAll("polygon[data-tone]:not([data-status-face])"));
const statusFaces = (root: Element) => Array.from(root.querySelectorAll("polygon[data-status-face]"));
const loopFaces = (root: Element) =>
  root.querySelectorAll("[class*='tile-loop'], [class*='tile-build'], [class*='tile-chase']");
const delay = (el: Element) => parseInt((el as HTMLElement).style.getPropertyValue("--tile-delay"), 10);
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("a loader's status", () => {
  const originalMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMedia;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("resolves from the tokens: landed faces a tenth of fast apart, never spanning more than base, a moving face after base", () => {
    expect(RESOLVE_FADE).toBe(150);
    expect(RESOLVE_LAND).toBe(200);
    expect(RESOLVE_STEP).toBe(15);
    expect([0, 1, 2].map((i) => resolveDelay(i, 3, false))).toEqual([0, 15, 30]);
    expect(resolveDelay(1, 3, true)).toBe(200);
    // Eighteen ring faces, or forty bar tiles, still finish within base plus fast.
    expect(resolveDelay(17, 18, false)).toBe(200);
    expect(resolveDelay(39, 40, false)).toBe(200);
    expect(resolveDelay(0, 1, false)).toBe(0);
  });

  it("TileLoader: the flip cancels the loop in the same frame, the faces turn green a step apart, onSettled fires once", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileLoader onSettled={onSettled} />);
    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(statusFaces(container)).toHaveLength(0);
    expect(loopFaces(container)).toHaveLength(3);
    advance(100);
    rerender(<TileLoader status="success" onSettled={onSettled} />);
    // No loop class remains anywhere; every brand face carries the resolve, every status face the settle.
    expect(loopFaces(container)).toHaveLength(0);
    expect(brandFaces(container).every((p) => p.classList.contains("tile-resolve"))).toBe(true);
    const green = statusFaces(container);
    expect(green).toHaveLength(3);
    expect(green.every((p) => p.classList.contains("tile-settle"))).toBe(true);
    expect(green.map((p) => p.getAttribute("fill")).sort()).toEqual([
      "var(--tile-success-deep)",
      "var(--tile-success-light)",
      "var(--tile-success-mid)",
    ]);
    // Landed faces (jsdom animates nothing) stagger in tone order from zero.
    expect(green.map(delay).sort((a, b) => a - b)).toEqual([0, 15, 30]);
    expect(screen.getByRole("img", { name: "Done" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    expect(container.querySelector("svg")).toHaveAttribute("data-status", "success");
    expect(onSettled).not.toHaveBeenCalled();
    // Settled within base plus fast: no class on anything, the callback once.
    advance(RESOLVE_LAND + RESOLVE_FADE);
    expect(statusFaces(container)).toHaveLength(3);
    expect(container.querySelectorAll("polygon[class], g[class]")).toHaveLength(0);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith("success");
    advance(5000);
    expect(onSettled).toHaveBeenCalledTimes(1);
    // Error is the same in the reds; back to loading starts the loop again from empty.
    rerender(<TileLoader status="error" onSettled={onSettled} />);
    advance(400);
    expect(statusFaces(container)[0]).toHaveAttribute("fill", expect.stringContaining("--tile-error"));
    expect(screen.getByRole("img", { name: "Failed" })).toBeInTheDocument();
    expect(onSettled).toHaveBeenLastCalledWith("error");
    expect(onSettled).toHaveBeenCalledTimes(2);
    rerender(<TileLoader status="loading" onSettled={onSettled} />);
    expect(statusFaces(container)).toHaveLength(0);
    expect(container.querySelectorAll(".tile-resolve")).toHaveLength(0);
    expect(brandFaces(container).every((p) => p.classList.contains("tile-loop-unfold"))).toBe(true);
    // And a second success resolves again, not from the stale settle.
    rerender(<TileLoader status="success" onSettled={onSettled} />);
    expect(statusFaces(container).every((p) => p.classList.contains("tile-settle"))).toBe(true);
    advance(400);
    expect(onSettled).toHaveBeenCalledTimes(3);
  });

  it("TileLoader: a face on its way is pinned where it is, carried home by the resolve, and turns last", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<TileLoader enter="assemble" />);
    const live = stubLive({ "2": { transform: "matrix(1, 0, 0, 1, 1.5, 2.6)", opacity: "0.4" } });
    const face2 = container.querySelector("polygon[data-face='2']") as SVGPolygonElement;
    // Watch the pin go on and off: the inline values are written, then released, within the one commit.
    const observer = new MutationObserver(() => {});
    observer.observe(face2, { attributes: true, attributeOldValue: true });
    rerender(<TileLoader enter="assemble" status="success" />);
    const records = observer.takeRecords();
    observer.disconnect();
    live.mockRestore();
    const styles = records.filter((r) => r.attributeName === "style").map((r) => r.oldValue ?? "");
    expect(styles.some((v) => v.includes("matrix(1, 0, 0, 1, 1.5, 2.6)") && v.includes("opacity: 0.4"))).toBe(
      true,
    );
    // Released again in the same commit, with the resolve class on, so the transition runs from the pin.
    expect(face2.style.transform).toBe("");
    expect(face2.style.opacity).toBe("");
    expect(face2).toHaveClass("tile-resolve");
    expect(face2.classList.contains("tile-loop-assemble")).toBe(false);
    // Its status face waits for the landing; the landed ones go at once.
    const delays = Object.fromEntries(
      statusFaces(container).map((p) => [p.getAttribute("data-tone"), delay(p)]),
    );
    expect(delays).toEqual({ "0": 0, "1": 15, "2": RESOLVE_LAND });
    advance(RESOLVE_LAND + RESOLVE_FADE);
    expect(container.querySelectorAll("polygon[class]")).toHaveLength(0);
  });

  it("TileLoader under reduced motion turns green at once and still reports", () => {
    stubReducedMotion(true);
    const onSettled = vi.fn();
    render(<TileLoader status="success" onSettled={onSettled} />);
    const green = statusFaces(document.body);
    expect(green).toHaveLength(3);
    expect(document.querySelectorAll("polygon[class], g[class]")).toHaveLength(0);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("img", { name: "Done" })).toBeInTheDocument();
  });

  it("TileRing: the lap stops mid-cube and the mark turns green clockwise from the top within base plus fast", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileRing onSettled={onSettled} />);
    advance(200);
    rerender(<TileRing status="success" onSettled={onSettled} />);
    expect(loopFaces(container)).toHaveLength(0);
    expect(brandFaces(container)).toHaveLength(18);
    expect(brandFaces(container).every((p) => p.classList.contains("tile-resolve"))).toBe(true);
    const green = statusFaces(container);
    expect(green).toHaveLength(18);
    expect(green.every((p) => p.classList.contains("tile-settle"))).toBe(true);
    // In cube then tone order, a step apart, the whole mark within the base token.
    const delays = Array.from(container.querySelectorAll("g[data-status-cube]")).flatMap((g) =>
      Array.from(g.children)
        .sort((a, b) => Number(a.getAttribute("data-tone")) - Number(b.getAttribute("data-tone")))
        .map(delay),
    );
    expect(delays).toEqual([...Array(18)].map((_, i) => Math.round((i * RESOLVE_LAND) / 17)));
    expect(Math.max(...delays)).toBe(RESOLVE_LAND);
    expect(screen.getByRole("img", { name: "Done" })).toBeInTheDocument();
    expect(onSettled).not.toHaveBeenCalled();
    advance(RESOLVE_LAND + RESOLVE_FADE);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("polygon[class], g[class]")).toHaveLength(0);
    advance(20000);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(loopFaces(container)).toHaveLength(0);
  });

  it("TileBar: the loop stops mid-step, the done tiles and the running one turn green left to right, then the bar rests", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileBar total={8} done={3} current onSettled={onSettled} />);
    advance(100);
    rerender(<TileBar total={8} done={3} current status="success" onSettled={onSettled} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-busy");
    expect(bar).toHaveAttribute("data-status", "success");
    expect(screen.getByRole("status")).toHaveTextContent("Done");
    expect(loopFaces(container)).toHaveLength(0);
    // Tiles 0..3: the three done and the running one, each a step after the last; nothing beyond.
    const green = statusFaces(container);
    expect(green).toHaveLength(4);
    expect(green.every((p) => p.classList.contains("tile-settle"))).toBe(true);
    expect(green.map(delay)).toEqual([0, 15, 30, 45]);
    expect(container.querySelectorAll("polygon[data-face].tile-resolve")).toHaveLength(4);
    advance(RESOLVE_LAND + RESOLVE_FADE);
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("polygon[class]")).toHaveLength(0);
    expect(statusFaces(container)).toHaveLength(4);
    // An indeterminate bar turns every tile.
    const { container: wave } = render(<TileBar total={5} current status="success" />);
    expect(statusFaces(wave)).toHaveLength(5);
    expect(statusFaces(wave).every((p) => p.classList.contains("tile-settle"))).toBe(true);
    expect(wave.querySelectorAll("polygon[data-face].tile-resolve")).toHaveLength(5);
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
