import { act, render, screen } from "@testing-library/react";
import { Tile, TileBar, TileField, TileMarker, TileUnit } from "./Tiles.tsx";

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
