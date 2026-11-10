import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChip } from "./FilterChip.tsx";

describe("FilterChip", () => {
  it("is a pressed button when selected and calls onSelect", async () => {
    const onSelect = vi.fn();
    render(
      <FilterChip selected status="Healthy" count={5} onSelect={onSelect}>
        Healthy
      </FilterChip>,
    );
    const chip = screen.getByRole("button", { name: /Healthy/ });
    expect(chip).toHaveTextContent("5");
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip.className).toContain("bg-ink");
    expect(chip.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(chip);
    expect(onSelect).toHaveBeenCalled();
  });

  it("outlines the diamond for installing and offline", () => {
    render(<FilterChip status="Offline">Offline</FilterChip>);
    expect(screen.getByRole("button").querySelector("svg")?.getAttribute("class")).toContain("fill-none");
  });
});
