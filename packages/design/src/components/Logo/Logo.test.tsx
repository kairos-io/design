import { render, screen } from "@testing-library/react";
import { HadronLogo, HadronMark, KairosLogo, KairosMark, hadronLogoAssets, logoAssets } from "./Logo.tsx";
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

  it("keeps the colour mark and sets the wordmark in white for the dark-surface lockup", () => {
    const { container, rerender } = render(<KairosLogo variant="dark" />);
    const fills = Array.from(container.querySelectorAll("rect, path")).map((s) => s.getAttribute("fill"));
    expect(fills).toContain("#EE5007");
    expect(fills).toContain("white");
    expect(fills).not.toContain("#03153A");
    // The mark alone has no dark rendition: it is the colour mark.
    rerender(<KairosMark variant="dark" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", logos["icon-color"].viewBox);
    // Nor does the stacked lockup; it falls back to the one-colour white.
    rerender(<KairosLogo layout="stacked" variant="dark" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", logos["stacked-white"].viewBox);
  });

  it("renders the Hadron mark in the three blues, named Hadron", () => {
    render(<HadronMark />);
    const svg = screen.getByRole("img", { name: "Hadron" });
    expect(svg).toHaveAttribute("viewBox", logos["hadron-icon-color"].viewBox);
    const fills = new Set(
      Array.from(svg.querySelectorAll("path")).map((p) => p.getAttribute("fill")?.toUpperCase()),
    );
    expect(fills).toEqual(new Set(["#1BAAFF", "#0275E7", "#004CCE"]));
  });

  it("renders the Hadron lockup for light and dark surfaces with the mark unchanged", () => {
    const { container, rerender } = render(<HadronLogo />);
    const light = Array.from(container.querySelectorAll("path")).map((p) =>
      p.getAttribute("fill")?.toUpperCase(),
    );
    expect(light).toContain("#0275E7");
    expect(light).toContain("#03153A");
    rerender(<HadronLogo variant="dark" />);
    const dark = Array.from(container.querySelectorAll("path")).map((p) =>
      p.getAttribute("fill")?.toUpperCase(),
    );
    expect(dark).toContain("#0275E7");
    expect(dark).toContain("#FFFFFF");
    expect(dark).not.toContain("#03153A");
    rerender(<HadronMark variant="white" />);
    const white = new Set(Array.from(container.querySelectorAll("path")).map((p) => p.getAttribute("fill")));
    expect(white).toEqual(new Set(["#FFFFFF"]));
  });

  it("is hidden from assistive technology when decorative", () => {
    const { container, rerender } = render(<KairosMark decorative />);
    let svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    rerender(<HadronLogo decorative />);
    svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("aria-label");
  });

  it("sizes by height or by class, with a 32px default", () => {
    const { container, rerender } = render(<KairosMark />);
    expect(container.querySelector("svg")!.className.baseVal).toContain("h-8");
    rerender(<KairosMark height={44} />);
    expect(container.querySelector("svg")).toHaveStyle({ height: "44px" });
    expect(container.querySelector("svg")!.className.baseVal).not.toContain("h-8");
    rerender(<HadronMark className="h-14" />);
    expect(container.querySelector("svg")!.className.baseVal).not.toContain("h-8");
  });

  it("maps every variant to a shipped asset", () => {
    for (const layout of ["icon", "horizontal", "stacked"] as const) {
      for (const variant of ["color", "white", "black"] as const) {
        expect(logoAssets[layout][variant]).toBe(`assets/logos/kairos-${layout}-${variant}.svg`);
        expect(logos[`${layout}-${variant}`]).toBeDefined();
      }
    }
    expect(logoAssets.horizontal.dark).toBe("assets/logos/kairos-horizontal-dark.svg");
    expect(logos["horizontal-dark"]).toBeDefined();
    expect(hadronLogoAssets.icon.color).toBe("assets/logos/hadron-icon-color.svg");
    expect(hadronLogoAssets.icon.white).toBe("assets/logos/hadron-icon-white.svg");
    expect(hadronLogoAssets.horizontal.color).toBe("assets/logos/hadron-horizontal-color.svg");
    expect(hadronLogoAssets.horizontal.dark).toBe("assets/logos/hadron-horizontal-dark.svg");
    for (const key of [
      "hadron-icon-color",
      "hadron-icon-white",
      "hadron-horizontal-color",
      "hadron-horizontal-dark",
    ]) {
      expect(logos[key]).toBeDefined();
    }
  });
});
