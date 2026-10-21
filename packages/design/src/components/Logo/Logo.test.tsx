import { render, screen } from "@testing-library/react";
import { KairosLogo, KairosMark, logoAssets } from "./Logo.tsx";
import { logos } from "./logos.generated.ts";

describe("Logo", () => {
  it("renders the icon as an image named Kairos", () => {
    render(<KairosMark />);
    const svg = screen.getByRole("img", { name: "Kairos" });
    expect(svg).toHaveAttribute("viewBox", logos["icon-color"].viewBox);
    expect(svg.querySelectorAll("rect")).toHaveLength(18);
  });

  it("keeps the artwork's fills for each variant", () => {
    const { container } = render(<KairosMark variant="white" />);
    const fills = new Set(Array.from(container.querySelectorAll("rect")).map((r) => r.getAttribute("fill")));
    expect(fills.has("#EE5007")).toBe(false);
    expect(fills.size).toBe(3);
  });

  it("renders the horizontal and stacked wordmarks", () => {
    const { container, rerender } = render(<KairosLogo />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", logos["horizontal-color"].viewBox);
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
    rerender(<KairosLogo layout="stacked" variant="black" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", logos["stacked-black"].viewBox);
  });

  it("is hidden from assistive technology when decorative", () => {
    const { container } = render(<KairosMark decorative />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("sizes by height or by class, with a 32px default", () => {
    const { container, rerender } = render(<KairosMark />);
    expect(container.querySelector("svg")!.className.baseVal).toContain("h-8");
    rerender(<KairosMark height={44} />);
    expect(container.querySelector("svg")).toHaveStyle({ height: "44px" });
    expect(container.querySelector("svg")!.className.baseVal).not.toContain("h-8");
    rerender(<KairosMark className="h-14" />);
    expect(container.querySelector("svg")!.className.baseVal).not.toContain("h-8");
  });

  it("maps every variant to a shipped asset", () => {
    for (const layout of ["icon", "horizontal", "stacked"] as const) {
      for (const variant of ["color", "white", "black"] as const) {
        expect(logoAssets[layout][variant]).toBe(`assets/logos/kairos-${layout}-${variant}.svg`);
        expect(logos[`${layout}-${variant}`]).toBeDefined();
      }
    }
  });
});
