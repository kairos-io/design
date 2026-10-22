import { act, render, screen } from "@testing-library/react";
import { TileBar } from "./TileBar.tsx";
import { TileLoader } from "./TileLoader.tsx";
import { TileRing } from "./TileRing.tsx";
import { CUBE_DURATION, CYCLES, ENTER_DURATION, LOOP_FACE_STEP, faceState, gateClass } from "./loop.ts";

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

const faces = (root: Element) => Array.from(root.querySelectorAll("polygon[data-face]"));
const cubes = (root: Element) => Array.from(root.querySelectorAll("g[data-cube]"));
const outlines = (root: Element) => Array.from(root.querySelectorAll('path[fill="none"]'));
const delay = (el: Element) => parseInt((el as HTMLElement).style.getPropertyValue("--tile-delay"), 10);

/** Walks a lap in small steps and returns the most cubes with a face mid-motion in any one step. */
function mostMoving(root: Element, cycle: "build" | "chase", exit: "disassemble" | "vanish"): number {
  const { period } = CYCLES[exit][cycle];
  let most = 0;
  // Two periods, so the wrap (the first cube returning while the last is still going) is walked too.
  for (let t = 0; t <= 2 * period * ENTER_DURATION; t += 12) {
    const moving = new Set<string>();
    for (const g of cubes(root)) {
      for (const p of Array.from(g.querySelectorAll("polygon[data-face]"))) {
        if (faceState(t, delay(p), cycle, exit) === "moving") moving.add(g.getAttribute("data-cube")!);
      }
    }
    most = Math.max(most, moving.size);
  }
  return most;
}

describe("the ring's sequence", () => {
  it("moves exactly one cube at a time in build, each a whole cube's time after the last, and at most two in chase", () => {
    const { container, rerender } = render(<TileRing />);
    // Per-cube starts are monotonic whole steps of the cube's time round the ring, so no two overlap.
    const starts = cubes(container).map((g) =>
      Math.min(...Array.from(g.querySelectorAll("polygon")).map(delay)),
    );
    expect(starts).toEqual([0, 1, 2, 3, 4, 5].map((i) => i * CUBE_DURATION));
    expect(CUBE_DURATION).toBe(ENTER_DURATION + 2 * LOOP_FACE_STEP);
    starts.slice(1).forEach((s, i) => expect(s - starts[i]).toBe(CUBE_DURATION));
    // Within a cube the faces go in tone order at the inline loader's spacing, and the cube is whole
    // (its last face landed) exactly when the next starts: overlap zero.
    for (const g of cubes(container)) {
      const byTone = Array.from(g.querySelectorAll("polygon")).sort(
        (a, b) => Number(a.getAttribute("data-tone")) - Number(b.getAttribute("data-tone")),
      );
      const first = delay(byTone[0]);
      expect(byTone.map((p) => delay(p) - first)).toEqual([0, LOOP_FACE_STEP, 2 * LOOP_FACE_STEP]);
      expect(2 * LOOP_FACE_STEP + ENTER_DURATION).toBe(CUBE_DURATION);
    }
    expect(mostMoving(container, "build", "disassemble")).toBe(1);
    rerender(<TileRing mode="chase" />);
    expect(mostMoving(container, "chase", "disassemble")).toBe(2);
    rerender(<TileRing exit="vanish" />);
    expect(mostMoving(container, "build", "vanish")).toBe(1);
    rerender(<TileRing mode="chase" exit="vanish" />);
    expect(mostMoving(container, "chase", "vanish")).toBe(1);
  });

  it("rests as the whole mark for one cube's time in build, then takes the cubes out in the same order", () => {
    const { period, moving, away } = CYCLES.disassemble.build;
    const lastIn = 5 * 2 + 2; // the sixth cube's last face lands at twelve entrances
    expect(moving[1][0] - lastIn).toBe(2); // one cube's time as the mark
    expect(away).toBe(moving[1][1]);
    expect(period).toBe(moving[1][0] + 2 * 6); // six cubes out, a cube's time apart, then round again
    // Cube 0 leaves at fourteen entrances, cube 5 at twenty-four; nobody leaves out of order.
    const outs = [0, 1, 2, 3, 4, 5].map((i) => (i * CUBE_DURATION) / ENTER_DURATION + moving[1][0]);
    expect(outs).toEqual([14, 16, 18, 20, 22, 24]);
  });
});

describe("the vanish exit", () => {
  const originalMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMedia;
    vi.useRealTimers();
  });

  it("is a cycle whose exit takes no time: landed one frame, away the next, the outline always there", () => {
    for (const cycle of ["loop", "chase", "build"] as const) {
      const { away, gate, moving, period } = CYCLES.vanish[cycle];
      expect(moving).toEqual([[0, 1]]); // the entrance alone; no out window
      expect(gate).toBe(away); // the cube's gate closes as its first face goes
      expect(away + 1).toBeLessThanOrEqual(period); // the last face is away before the first returns
      const d = (t: number) => faceState(t * ENTER_DURATION, 0, cycle, "vanish");
      expect(d(0.5)).toBe("moving");
      expect(d(away - 0.01)).toBe("landed");
      expect(d(away + 0.01)).toBe("away");
      expect(d(period + 0.5)).toBe("moving");
    }
    expect(CYCLES.vanish.loop).toMatchObject({ period: 4, away: 3 }); // two in, one as the cube, one gone
    expect(CYCLES.vanish.chase).toMatchObject({ period: 12, away: 2 }); // one cube at a time round the ring
    expect(CYCLES.vanish.build).toMatchObject({ period: 16, away: 14 }); // six in, two as the mark, two gone
    // The one-shot step and the disassemble cycles are untouched.
    expect(CYCLES.vanish.step).toEqual(CYCLES.disassemble.step);
    expect(faceState(5 * ENTER_DURATION, 0, "step")).toBe("landed");
    expect(faceState(2.7 * ENTER_DURATION, 0, "loop")).toBe("moving");
  });

  it("TileLoader: the faces take the vanish keyframes and the cube's group is the gate; the grid stays", () => {
    const { container, rerender } = render(<TileLoader exit="vanish" />);
    expect(container.querySelector("svg")).toHaveAttribute("data-exit", "vanish");
    expect(faces(container)).toHaveLength(3);
    expect(faces(container).every((p) => p.classList.contains("tile-loop-unfold-vanish"))).toBe(true);
    expect(
      faces(container)
        .map(delay)
        .sort((a, b) => a - b),
    ).toEqual([0, 270, 540]);
    const gate = container.querySelector("g[data-cube='0']")!;
    expect(gate).toHaveAttribute("data-gate");
    expect(gate).toHaveClass("tile-loop-gate");
    expect(delay(gate)).toBe(0);
    expect(outlines(container)).toHaveLength(1);
    expect(outlines(container)[0].getAttribute("d")!.match(/M/g)).toHaveLength(9);
    rerender(<TileLoader exit="vanish" enter="assemble" />);
    expect(faces(container).every((p) => p.classList.contains("tile-loop-assemble-vanish"))).toBe(true);
    // The default exit has no gate on the group.
    rerender(<TileLoader />);
    expect(container.querySelector("g[data-cube='0']")).not.toHaveAttribute("data-gate");
    expect(container.querySelector("g[data-cube='0']")).not.toHaveAttribute("class");
  });

  it("TileRing: build gates all close at the lap's fourteenth entrance, chase gates with their cube", () => {
    const { container, rerender } = render(<TileRing exit="vanish" />);
    expect(faces(container).every((p) => p.classList.contains("tile-build-unfold-vanish"))).toBe(true);
    cubes(container).forEach((g, i) => {
      expect(g).toHaveAttribute("data-gate");
      expect(g).toHaveClass(gateClass("build", i));
      expect(g).toHaveClass(`tile-build-gate-${i}`);
      expect(delay(g)).toBe(i * CUBE_DURATION);
      // Each gate's own-time close is the lap's fourteen entrances less the cubes before it: see base.css.
      const { gate, period } = CYCLES.vanish.build;
      expect((gate! - 2 * i) / period).toBeCloseTo([0.875, 0.75, 0.625, 0.5, 0.375, 0.25][i], 5);
    });
    rerender(<TileRing exit="vanish" mode="chase" enter="assemble" />);
    expect(faces(container).every((p) => p.classList.contains("tile-chase-assemble-vanish"))).toBe(true);
    cubes(container).forEach((g, i) => {
      expect(g).toHaveClass("tile-chase-gate");
      expect(delay(g)).toBe(i * CUBE_DURATION);
    });
  });

  it("TileBar: the running tile and the wave take the vanish loop; a tile is a single face, so no gate", () => {
    const { container, rerender } = render(<TileBar total={6} done={2} current exit="vanish" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-exit", "vanish");
    expect(container.querySelectorAll(".tile-loop-unfold-vanish")).toHaveLength(1);
    expect(container.querySelectorAll("[data-gate]")).toHaveLength(0);
    expect(container.querySelectorAll('polygon[fill="var(--inner)"]')).toHaveLength(6);
    // A tile that becomes done still steps in once.
    rerender(<TileBar total={6} done={3} current exit="vanish" />);
    expect(container.querySelectorAll(".tile-step-unfold")).toHaveLength(1);
    rerender(<TileBar total={6} current exit="vanish" />);
    expect(container.querySelectorAll(".tile-loop-unfold-vanish")).toHaveLength(6);
  });

  it("resolves a vanished cube too: the gate is carried open by the resolve, then nothing loops", () => {
    vi.useFakeTimers();
    const onSettled = vi.fn();
    const { container, rerender } = render(<TileRing exit="vanish" onSettled={onSettled} />);
    rerender(<TileRing exit="vanish" status="error" onSettled={onSettled} />);
    expect(container.querySelectorAll("[class*='-gate']")).toHaveLength(0);
    expect(container.querySelectorAll("[class*='-vanish']")).toHaveLength(0);
    cubes(container).forEach((g) => expect(g).toHaveClass("tile-resolve"));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("polygon[class], g[class]")).toHaveLength(0);
    expect(container.querySelectorAll("polygon[data-status-face]")).toHaveLength(18);
  });

  it("is the static complete cube, tile and mark under reduced motion", () => {
    stubReducedMotion(true);
    const { container } = render(
      <>
        <TileLoader exit="vanish" />
        <TileBar total={4} done={1} current exit="vanish" />
        <TileRing exit="vanish" />
      </>,
    );
    expect(faces(container)).toHaveLength(3 + 2 + 18);
    expect(container.querySelectorAll("polygon[class], polygon[style], g[class], g[style]")).toHaveLength(0);
    expect(screen.getAllByRole("img", { name: "Loading" })).toHaveLength(2);
  });
});
