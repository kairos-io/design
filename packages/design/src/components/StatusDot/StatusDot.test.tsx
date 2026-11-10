import { render } from "@testing-library/react";
import { StatusDot } from "./StatusDot.tsx";

describe("StatusDot", () => {
  it("is a decorative diamond filled in the tone", () => {
    const { container } = render(<StatusDot tone="success" />);
    const dot = container.firstElementChild as SVGElement;
    expect(dot.tagName).toBe("svg");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot.getAttribute("class")).toContain("fill-status-healthy");
    expect(dot.querySelector("polygon")).toHaveAttribute("points", "6,0.8 11.2,6 6,11.2 0.8,6");
  });

  it("outlines the diamond when asked", () => {
    const { container } = render(<StatusDot tone="info" outline size={14} />);
    const dot = container.firstElementChild as SVGElement;
    expect(dot.getAttribute("class")).toContain("fill-none");
    expect(dot.getAttribute("class")).toContain("stroke-accent");
    expect(dot).toHaveAttribute("width", "14");
  });
});
