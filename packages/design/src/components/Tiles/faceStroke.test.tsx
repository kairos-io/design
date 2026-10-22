import { render } from "@testing-library/react";
import { TileField } from "./TileField.tsx";
import { TileLoader } from "./TileLoader.tsx";
import { TileRing } from "./TileRing.tsx";
import { TileUnit } from "./TileUnit.tsx";
import { tileFaceStroke, tileFieldSvg } from "../../lib/tiles.ts";

// Every filled face, wherever it is drawn, carries the one face stroke: thin,
// in its own fill, under the fill, bevelled, so no corner grows a pin and
// nothing overshoots the grid; the hairline grid keeps the svg's mitre.
const faces = (root: ParentNode) => Array.from(root.querySelectorAll('polygon:not([fill="none"])'));
const expectFaceStroke = (p: Element) => {
  expect(p.getAttribute("stroke")).toBe(p.getAttribute("fill"));
  expect(p.getAttribute("stroke-width")).toBe(String(tileFaceStroke.width));
  expect(p.getAttribute("stroke-linejoin")).toBe("bevel");
  expect(p.getAttribute("paint-order")).toBe("stroke");
};

describe("the face stroke", () => {
  it("is thin, bevelled and under the fill on TileField, TileUnit and the loaders, with the grid on the mitre", () => {
    const { container } = render(
      <>
        <TileField solid width={120} height={80} radius={30} />
        <TileUnit />
        <TileLoader />
        <TileLoader tone="mono" />
        <TileRing />
      </>,
    );
    const all = faces(container).filter((p) => p.getAttribute("fill") !== "var(--inner)");
    expect(all.length).toBeGreaterThan(30);
    all.forEach(expectFaceStroke);
    for (const svg of Array.from(container.querySelectorAll("svg"))) {
      if (svg.querySelector('path[fill="none"]')) expect(svg).toHaveAttribute("stroke-linejoin", "miter");
      for (const line of Array.from(svg.querySelectorAll('path[fill="none"]'))) {
        expect(line.getAttribute("stroke-linejoin")).toBe("round");
        expect(line.getAttribute("stroke-linecap")).toBe("round");
        expect(line.getAttribute("stroke-width")).toBe("1");
      }
    }
  });

  it("draws the top face of a cube last", () => {
    const { container } = render(
      <>
        <TileUnit />
        <TileLoader />
      </>,
    );
    for (const svg of Array.from(container.querySelectorAll("svg"))) {
      const fills = faces(svg).map((p) => p.getAttribute("fill"));
      expect(fills).toEqual(["var(--kairos-mid)", "var(--kairos-orange)", "var(--kairos-light)"]);
    }
    const { container: field } = render(<TileField solid width={120} height={80} radius={30} />);
    for (const g of Array.from(field.querySelectorAll("svg > g"))) {
      expect(g.lastElementChild).toHaveAttribute("fill", "var(--kairos-light)");
    }
  });

  it("carries the same stroke into the static pattern files", () => {
    const svg = tileFieldSvg({ width: 120, height: 80, radius: 30, solid: true });
    const face = svg.match(/<polygon points="[^"]+" fill="var\(--kairos-light[^>]*>/)![0];
    expect(face).toContain(`stroke-width="${tileFaceStroke.width}"`);
    expect(face).toContain('stroke-linejoin="bevel"');
    expect(face).toContain('paint-order="stroke"');
    expect(svg).toContain('stroke-linejoin="miter"');
    // The grid is a path per opacity step with round caps, at the hairline width.
    const grid = svg.match(/<path [^>]*>/g)!;
    expect(grid.length).toBeGreaterThan(0);
    for (const path of grid) {
      expect(path).toContain('stroke-width="1"');
      expect(path).toContain('stroke-linecap="round"');
      expect(path).toContain('stroke-linejoin="round"');
    }
  });
});
