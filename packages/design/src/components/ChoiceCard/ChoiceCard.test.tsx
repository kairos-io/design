import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChoiceCard, ChoiceGroup } from "./ChoiceCard.tsx";

describe("ChoiceCard", () => {
  it("is a radio in a radiogroup and reports selection", async () => {
    const onSelect = vi.fn();
    render(
      <ChoiceGroup aria-label="Architecture">
        <ChoiceCard title="AMD64" description="x86_64" selected onSelect={onSelect} />
        <ChoiceCard title="ARM64" onSelect={onSelect} />
      </ChoiceGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Architecture" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /AMD64/ })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "ARM64" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("is a checkbox with multiple", () => {
    render(<ChoiceCard multiple title="ISO" selected={false} />);
    expect(screen.getByRole("checkbox", { name: "ISO" })).not.toBeChecked();
  });

  it("takes the ink border when selected", () => {
    render(<ChoiceCard title="Core" selected />);
    expect(screen.getByRole("radio").className).toContain("border-ink");
  });
});
