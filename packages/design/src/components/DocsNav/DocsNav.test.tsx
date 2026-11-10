import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocsNav, DocsToc } from "./DocsNav.tsx";

const groups = [
  {
    title: "Products",
    items: [
      { label: "Console", href: "/console", current: true },
      { label: "Installer", href: "/installer" },
    ],
  },
];

describe("DocsNav", () => {
  it("marks the current page and groups the links", () => {
    render(<DocsNav groups={groups} />);
    expect(screen.getByRole("navigation", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Console" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Installer" })).not.toHaveAttribute("aria-current");
  });

  it("hands navigation to the host when asked", async () => {
    const onNavigate = vi.fn();
    render(<DocsNav groups={groups} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: "Installer" }));
    expect(onNavigate).toHaveBeenCalledWith("/installer");
  });
});

describe("DocsToc", () => {
  it("lists the headings with the current one marked", () => {
    render(
      <DocsToc
        items={[
          { label: "Overview", href: "#overview" },
          { label: "Steps", href: "#steps", current: true },
        ]}
        action={<a href="#edit">Edit this page</a>}
      />,
    );
    expect(screen.getByRole("complementary", { name: "On this page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Steps" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Edit this page" })).toBeInTheDocument();
  });
});
