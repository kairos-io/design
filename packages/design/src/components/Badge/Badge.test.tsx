import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge.tsx";

describe("Badge", () => {
  it("renders its text with the default variant", () => {
    render(<Badge>v3.4.0</Badge>);
    const badge = screen.getByText("v3.4.0");
    expect(badge.className).toContain("bg-primary");
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">arm64</Badge>);
    expect(screen.getByText("arm64").className).toContain("text-foreground");
  });

  it("merges a custom class", () => {
    render(<Badge className="uppercase">k3s</Badge>);
    expect(screen.getByText("k3s").className).toContain("uppercase");
  });
});
