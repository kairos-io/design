import { render, screen } from "@testing-library/react";
import { Steps } from "./Steps.tsx";

describe("Steps", () => {
  it("marks the active step as current and names each state", () => {
    render(
      <Steps
        aria-label="Installation steps"
        items={[
          { id: "partition", label: "Partitioning disk", state: "done" },
          { id: "active", label: "Installing active system", state: "active" },
          { id: "bootloader", label: "Configuring bootloader", state: "pending" },
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Installation steps" });
    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).toHaveTextContent("Partitioning disk, done");
    expect(items[2]).toHaveTextContent("not started");
  });

  it("colours a failed step in danger", () => {
    render(<Steps aria-label="Steps" items={[{ id: "a", label: "Bootloader", state: "failed" }]} />);
    expect(screen.getByRole("listitem").className).toContain("text-danger-foreground");
  });
});
