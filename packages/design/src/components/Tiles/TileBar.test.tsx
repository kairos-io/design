import { act, render, screen } from "@testing-library/react";
import { TileBar } from "./TileBar.tsx";
import { tilePoints } from "../../lib/tiles.ts";

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

const tiles = (root: Element) => Array.from(root.querySelectorAll("svg"));
const rests = (root: Element) => Array.from(root.querySelectorAll('polygon[fill="var(--inner)"]'));
const face = (tile: Element) => tile.querySelector('polygon:not([fill="var(--inner)"])');
const delay = (el: Element) => parseInt((el as HTMLElement).style.getPropertyValue("--tile-delay"), 10);
const prop = (el: Element, name: string) => (el as HTMLElement).style.getPropertyValue(name);

describe("TileBar with a current step", () => {
  const originalMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMedia;
    vi.useRealTimers();
  });

  it("keeps the plain bar as it was: one tile per item, no rest tile under a done one, no motion", () => {
    const { container } = render(<TileBar total={10} done={4} aria-label="Rollout" />);
    const bar = screen.getByRole("progressbar", { name: "Rollout" });
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).not.toHaveAttribute("aria-busy");
    expect(tiles(container)).toHaveLength(10);
    expect(rests(container)).toHaveLength(6);
    expect(container.querySelectorAll("[class^='tile-']")).toHaveLength(0);
  });

  it("loops the assemble on the tile at done, over a rest tile under every cell, in a padded box", () => {
    const { container, rerender } = render(<TileBar total={8} done={3} current aria-label="Install" />);
    const bar = screen.getByRole("progressbar", { name: "Install" });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuetext", "3 of 8");
    expect(bar).toHaveAttribute("aria-busy", "true");
    expect(bar).toHaveAttribute("data-current", "3");
    expect(bar).toHaveAttribute("data-enter", "assemble");
    expect(rests(container)).toHaveLength(8);
    const all = tiles(container);
    // Three done faces stand still, the fourth loops, the rest are their rest tile alone.
    expect(all.slice(0, 3).map((t) => face(t)?.getAttribute("class") ?? null)).toEqual([null, null, null]);
    expect(face(all[3])).toHaveClass("tile-loop-assemble");
    expect(delay(face(all[3])!)).toBe(0);
    expect(prop(face(all[3])!, "--tile-reach")).toBe("4.2px");
    expect(all.slice(4).every((t) => face(t) === null)).toBe(true);
    // The face and the rest tile are the one parallelogram, in a box padded by the reach and pulled back by margin.
    expect(face(all[3])).toHaveAttribute("points", tilePoints);
    expect(all[3]).toHaveAttribute("viewBox", "-4.2 -4.2 30.4 22.4");
    expect(all[3].style.margin).toBe(`${-(4.2 * (16 / 22))}px`);
    expect(all[3]).toHaveClass("overflow-visible");
    // The faces cycle the tones from the left, the running one included.
    expect(all.slice(0, 4).map((t) => face(t)!.getAttribute("fill"))).toEqual([
      "var(--kairos-light)",
      "var(--kairos-mid)",
      "var(--kairos-orange)",
      "var(--kairos-light)",
    ]);
    // A number picks the running tile; false runs none, but the bar still steps.
    rerender(<TileBar total={8} done={3} current={5} />);
    expect(face(tiles(container)[3])).toBeNull();
    expect(face(tiles(container)[5])).toHaveClass("tile-loop-assemble");
    rerender(<TileBar total={8} done={3} current={false} />);
    expect(container.querySelectorAll(".tile-loop-assemble")).toHaveLength(0);
    expect(rests(container)).toHaveLength(8);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-busy");
  });

  it("unfolds when asked, the tile standing up from its bottom right corner", () => {
    const { container } = render(<TileBar total={4} done={1} current enter="unfold" />);
    const running = face(tiles(container)[1])!;
    expect(running).toHaveClass("tile-loop-unfold");
    expect(prop(running, "--tile-vx")).toBe("15px");
    expect(prop(running, "--tile-vy")).toBe("14px");
    expect(prop(running, "--tile-dx")).toBe("");
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-enter", "unfold");
  });

  it("brings in only the tiles that have just become done, left to right, then rests clean", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<TileBar total={8} done={3} current />);
    // Mounting at 3 of 8 moves nothing: those three were done already.
    expect(container.querySelectorAll(".tile-step-assemble")).toHaveLength(0);
    rerender(<TileBar total={8} done={4} current />);
    let landing = Array.from(container.querySelectorAll(".tile-step-assemble"));
    expect(landing).toHaveLength(1);
    expect(landing[0]).toBe(face(tiles(container)[3]));
    expect(delay(landing[0])).toBe(0);
    expect(face(tiles(container)[4])).toHaveClass("tile-loop-assemble");
    expect(
      tiles(container)
        .slice(0, 3)
        .some((t) => face(t)!.hasAttribute("class")),
    ).toBe(false);
    // Landed: no entrance class remains, the loop goes on.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelectorAll(".tile-step-assemble")).toHaveLength(0);
    expect(container.querySelectorAll(".tile-loop-assemble")).toHaveLength(1);
    // Two at once come in a step apart, the left one first.
    rerender(<TileBar total={8} done={6} current />);
    landing = Array.from(container.querySelectorAll(".tile-step-assemble"));
    expect(landing).toHaveLength(2);
    expect(landing.map(delay)).toEqual([0, 60]);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelectorAll(".tile-step-assemble")).toHaveLength(0);
    // Going back moves nothing; the last tile done shows nothing running.
    rerender(<TileBar total={8} done={2} current />);
    expect(container.querySelectorAll(".tile-step-assemble")).toHaveLength(0);
    rerender(<TileBar total={8} done={8} current />);
    expect(container.querySelectorAll(".tile-loop-assemble")).toHaveLength(0);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "8");
  });

  it("is indeterminate with current and no done: the loop travels the bar as a wave", () => {
    const { container } = render(<TileBar total={12} current aria-label="Build" />);
    const bar = screen.getByRole("progressbar", { name: "Build" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveAttribute("aria-valuetext");
    expect(bar).toHaveAttribute("aria-valuemax", "12");
    expect(bar).toHaveAttribute("aria-busy", "true");
    expect(bar).toHaveAttribute("data-current", "");
    const faces = tiles(container).map((t) => face(t)!);
    expect(faces.every((p) => p.classList.contains("tile-loop-assemble"))).toBe(true);
    // Each tile an eighth of a turn (270ms) behind its neighbour.
    expect(faces.map(delay)).toEqual(faces.map((_, i) => i * 270));
    expect(rests(container)).toHaveLength(12);
  });

  it("stands still under reduced motion: the running tile at half strength, the wave not at all", () => {
    stubReducedMotion(true);
    const { container, rerender } = render(<TileBar total={8} done={3} current />);
    expect(container.querySelectorAll("[class^='tile-']")).toHaveLength(0);
    expect(face(tiles(container)[3])).toHaveAttribute("fill-opacity", "0.5");
    expect(face(tiles(container)[2])).not.toHaveAttribute("fill-opacity");
    rerender(<TileBar total={8} done={4} current />);
    expect(container.querySelectorAll("[class^='tile-']")).toHaveLength(0);
    expect(face(tiles(container)[3])).not.toHaveAttribute("fill-opacity");
    rerender(<TileBar total={8} current />);
    expect(container.querySelectorAll("[class^='tile-']")).toHaveLength(0);
    expect(tiles(container).every((t) => face(t) === null)).toBe(true);
    expect(rests(container)).toHaveLength(8);
  });
});
