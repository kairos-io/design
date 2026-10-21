import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge.tsx";

describe("StatusBadge", () => {
  it("renders a known status", () => {
    render(<StatusBadge status="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  // A node fetched from an endpoint that does not return a node has no phase.
  // One absent field must not be able to throw out of render.
  it("renders a placeholder instead of throwing when the status is missing", () => {
    expect(() => render(<StatusBadge status={undefined} />)).not.toThrow();
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("renders a placeholder for an empty status", () => {
    render(<StatusBadge status="" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("styles an unknown phase with the neutral tone", () => {
    const { container } = render(<StatusBadge status="Expired" />);
    expect(container.firstElementChild?.className).toContain("bg-muted/15");
    expect(container.firstElementChild?.className).toContain("text-muted");
  });

  it("styles Running with the info tone", () => {
    const { container } = render(<StatusBadge status="Running" />);
    expect(container.firstElementChild?.className).toContain("bg-accent/15");
    expect(container.firstElementChild?.className).toContain("border-accent/25");
  });

  it("lets an explicit tone win over the status mapping", () => {
    const { container } = render(<StatusBadge status="Online" tone="danger" />);
    expect(container.firstElementChild?.className).toContain("bg-status-recovery/15");
  });

  it("prefixes a decorative dot when asked", () => {
    const { container } = render(<StatusBadge status="Online" dot />);
    const dot = container.querySelector("[aria-hidden=true]");
    expect(dot?.className).toContain("bg-status-healthy");
  });
});
