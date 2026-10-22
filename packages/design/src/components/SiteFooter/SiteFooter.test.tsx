import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter.tsx";

describe("SiteFooter", () => {
  it("is a dark contentinfo landmark with the columns and the legal line", () => {
    render(
      <SiteFooter
        brand="Kairos"
        columns={[{ title: "Docs", items: [{ label: "Quick start", href: "/quick" }] }]}
        legal="Copyright © 2026 Kairos"
        note="Project supported by Spectro Cloud"
      />,
    );
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveAttribute("data-theme", "dark");
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quick start" })).toHaveAttribute("href", "/quick");
    expect(screen.getByText("Copyright © 2026 Kairos")).toBeInTheDocument();
  });

  it("keeps the brand block on the left and does not stretch the logo across the cell", () => {
    render(
      <SiteFooter
        brand={
          <>
            <svg role="img" aria-label="Kairos" />
            <span>A Cloud Native Computing Foundation sandbox project.</span>
          </>
        }
        columns={[{ title: "Docs", items: [{ label: "Quick start", href: "/quick" }] }]}
      />,
    );
    const brand = screen.getByRole("img", { name: "Kairos" }).parentElement!;
    expect(brand).toHaveClass("flex-col", "items-start");
    expect(brand.parentElement!.firstElementChild).toBe(brand);
  });

  it("puts the brand and the children on one row when compact", () => {
    render(
      <SiteFooter brand="Hadron" compact>
        <a href="#">GitHub</a>
      </SiteFooter>,
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.queryByText("Copyright")).not.toBeInTheDocument();
  });
});
