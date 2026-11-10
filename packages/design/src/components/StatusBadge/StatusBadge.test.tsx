import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge.tsx";

const diamond = (el: Element | null) => el?.querySelector("svg")?.getAttribute("class") ?? "";

describe("StatusBadge", () => {
  it("renders a known status on a surface chip with a filled diamond", () => {
    const { container } = render(<StatusBadge status="Healthy" />);
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    const chip = container.firstElementChild;
    expect(chip?.className).toContain("bg-surface");
    expect(chip).toHaveAttribute("data-tone", "success");
    expect(diamond(chip)).toContain("fill-status-healthy");
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

  it("draws an unknown phase as a neutral outline", () => {
    const { container } = render(<StatusBadge status="Expired" />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "neutral");
    expect(container.firstElementChild).toHaveAttribute("data-outline", "true");
    expect(diamond(container.firstElementChild)).toContain("fill-none");
  });

  it("draws Upgrading filled in the accent and Installing as an accent outline", () => {
    const { container: a } = render(<StatusBadge status="Upgrading" />);
    expect(diamond(a.firstElementChild)).toContain("fill-accent");
    const { container: b } = render(<StatusBadge status="Installing" />);
    expect(diamond(b.firstElementChild)).toContain("fill-none");
    expect(diamond(b.firstElementChild)).toContain("stroke-accent");
  });

  it("draws Offline as a muted outline, not an alarm", () => {
    const { container } = render(<StatusBadge status="Offline" />);
    expect(container.firstElementChild).toHaveAttribute("data-tone", "neutral");
    expect(diamond(container.firstElementChild)).toContain("stroke-muted");
  });

  it("lets an explicit tone win over the status mapping", () => {
    const { container } = render(<StatusBadge status="Healthy" tone="danger" />);
    expect(diamond(container.firstElementChild)).toContain("fill-status-recovery");
  });

  it("never tints the chip", () => {
    const { container } = render(<StatusBadge status="Failed" />);
    expect(container.firstElementChild?.className).not.toMatch(/bg-status|\/15/);
    expect(container.firstElementChild?.className).toContain("text-ink");
  });

  it("drops the surface when bare", () => {
    const { container } = render(<StatusBadge status="Healthy" bare />);
    expect(container.firstElementChild?.className).not.toContain("bg-surface");
    expect(diamond(container.firstElementChild)).toContain("fill-status-healthy");
  });
});
