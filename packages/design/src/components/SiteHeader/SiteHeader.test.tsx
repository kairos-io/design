import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader.tsx";

describe("SiteHeader", () => {
  it("renders a banner with the logo, a labelled nav and the actions", () => {
    render(
      <SiteHeader
        logo={<a href="/">Kairos</a>}
        links={[
          { label: "Docs", href: "/docs", current: true },
          { label: "Blog", href: "/blog" },
        ]}
        actions={<button type="button">Quick start</button>}
      />,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Quick start" })).toBeInTheDocument();
  });

  it("renders no nav when there are no links", () => {
    render(<SiteHeader logo="Kairos" />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
