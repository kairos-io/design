import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardSteps } from "./WizardSteps.tsx";

const steps = [
  { id: "base", label: "Base" },
  { id: "system", label: "System" },
  { id: "review", label: "Review" },
];

describe("WizardSteps", () => {
  it("marks the current step, ticks the ones behind and names the states", async () => {
    const onStepChange = vi.fn();
    render(<WizardSteps steps={steps} current="system" onStepChange={onStepChange} label="Build steps" />);
    expect(screen.getByRole("navigation", { name: "Build steps" })).toBeInTheDocument();
    const current = screen.getByRole("button", { name: /System, current/ });
    expect(current).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Base, done/ })).toHaveTextContent("✓");
    expect(screen.getByRole("button", { name: /Review, not started/ })).toHaveAttribute(
      "data-state",
      "pending",
    );
    await userEvent.click(screen.getByRole("button", { name: /Base/ }));
    expect(onStepChange).toHaveBeenCalledWith("base");
  });
});
