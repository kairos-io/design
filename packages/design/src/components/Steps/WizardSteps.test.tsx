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

  it("leaves the steps' focus ring room inside the scroll container", () => {
    render(<WizardSteps steps={steps} current="base" />);
    const nav = screen.getByRole("navigation", { name: "Steps" });
    expect(nav).toHaveClass("overflow-x-auto", "p-0.5", "-m-0.5");
    expect(nav).not.toHaveClass("pb-0.5");
  });

  it("keeps the hidden state text inside the scroll rail, so a phone gets no page-wide scroll", () => {
    render(<WizardSteps steps={steps} current="base" />);
    // The sr-only span is absolutely positioned; its containing block has to be
    // the step, inside the overflow-x-auto nav, or it lands in the page's overflow.
    for (const step of screen.getAllByRole("button")) expect(step).toHaveClass("relative");
  });
});
