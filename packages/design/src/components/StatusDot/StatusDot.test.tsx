import { render } from "@testing-library/react";
import { StatusDot } from "./StatusDot.tsx";

describe("StatusDot", () => {
  it("is decorative and carries the tone background", () => {
    const { container } = render(<StatusDot tone="success" />);
    const dot = container.firstElementChild as HTMLElement;
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot.className).toContain("bg-status-healthy");
  });
});
