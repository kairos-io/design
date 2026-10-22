import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader.tsx";

describe("PageHeader", () => {
  it("renders the title as the page h1 with description and actions", () => {
    render(
      <PageHeader title="Nodes" description="Every machine the console knows about.">
        <button type="button">Register node</button>
      </PageHeader>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Nodes" })).toBeInTheDocument();
    expect(screen.getByText("Every machine the console knows about.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register node" })).toBeInTheDocument();
  });

  it("renders a breadcrumb with links and marks the last item current", () => {
    render(
      <PageHeader
        title="edge-node-01"
        breadcrumb={[{ label: "Nodes", href: "/nodes" }, { label: "edge-node-01" }]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nodes" })).toHaveAttribute("href", "/nodes");
    expect(screen.getByText("edge-node-01", { selector: "span" })).toHaveAttribute("aria-current", "page");
  });

  it("lets the host supply its own link element for a crumb", () => {
    render(
      <PageHeader
        title="Detail"
        breadcrumb={[
          {
            label: "Groups",
            element: (
              <a href="/groups" data-router="yes">
                Groups
              </a>
            ),
          },
          { label: "Detail" },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: "Groups" });
    expect(link).toHaveAttribute("data-router", "yes");
    expect(link.className).toContain("hover:underline");
  });

  it("forwards a ref and spreads host attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(<PageHeader ref={ref} title="Nodes" data-testid="header" />);
    expect(ref.current).toBe(screen.getByTestId("header"));
  });
});
