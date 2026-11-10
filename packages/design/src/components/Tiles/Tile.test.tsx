import { render } from "@testing-library/react";
import { tileOutlinePoints, tileOutlineStrokeWidth, tilePoints } from "../../lib/tiles.ts";
import { Tile } from "./Tile.tsx";

describe("Tile", () => {
  it("draws the outline tone as an inset stroke that stays inside the box", () => {
    const { container } = render(<Tile tone="outline" />);
    const polygon = container.querySelector("polygon")!;
    expect(polygon).toHaveAttribute("points", tileOutlinePoints);
    expect(polygon).toHaveAttribute("fill", "none");
    expect(polygon).toHaveAttribute("stroke-width", String(tileOutlineStrokeWidth));
    expect(polygon).toHaveAttribute("stroke-linejoin", "miter");
    // Every inset vertex sits half a stroke inside the 22x14 box.
    for (const pair of tileOutlinePoints.split(" ")) {
      const [x, y] = pair.split(",").map(Number);
      expect(x).toBeGreaterThanOrEqual(tileOutlineStrokeWidth / 2);
      expect(x).toBeLessThanOrEqual(22 - tileOutlineStrokeWidth / 2);
      expect(y).toBeGreaterThanOrEqual(tileOutlineStrokeWidth / 2);
      expect(y).toBeLessThanOrEqual(14 - tileOutlineStrokeWidth / 2);
    }
  });

  it("keeps the filled tones on the full tile", () => {
    const { container } = render(<Tile tone={2} />);
    expect(container.querySelector("polygon")).toHaveAttribute("points", tilePoints);
  });
});
