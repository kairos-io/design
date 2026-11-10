import { render, screen } from "@testing-library/react";
import { FeatureCell, FeatureGrid } from "./FeatureGrid.tsx";

describe("FeatureGrid", () => {
  it("lays cells out on a hairline grid with the minimum width asked", () => {
    render(
      <FeatureGrid minWidth={300} data-testid="g">
        <FeatureCell label="Build">Factory</FeatureCell>
        <FeatureCell label="Deploy">Installer</FeatureCell>
      </FeatureGrid>,
    );
    const grid = screen.getByTestId("g");
    expect(grid.className).toContain("gap-px");
    expect(grid.style.gridTemplateColumns).toContain("300px");
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("Factory")).toBeInTheDocument();
  });

  it("renders a cell without a marker row", () => {
    render(<FeatureCell data-testid="c">Body</FeatureCell>);
    expect(screen.getByTestId("c").childElementCount).toBe(0);
    expect(screen.getByTestId("c")).toHaveTextContent("Body");
  });
});
