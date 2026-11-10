import { render, screen } from "@testing-library/react";
import { SectionHeading, SiteSection } from "./SiteSection.tsx";

describe("SiteSection", () => {
  it("caps the content at the page measure", () => {
    render(
      <SiteSection data-testid="s">
        <p>Body</p>
      </SiteSection>,
    );
    const section = screen.getByTestId("s");
    expect(section.tagName).toBe("SECTION");
    expect(section.firstElementChild?.className).toContain("max-w-(--page-max)");
  });

  it("themes the deep tone dark for its children", () => {
    render(
      <SiteSection tone="deep" data-testid="s">
        <p>Body</p>
      </SiteSection>,
    );
    const section = screen.getByTestId("s");
    expect(section.className).toContain("bg-deep");
    expect(section.querySelector('[data-theme="dark"]')).not.toBeNull();
  });

  it("renders as the element asked for", () => {
    render(<SiteSection as="footer" data-testid="f" />);
    expect(screen.getByTestId("f").tagName).toBe("FOOTER");
  });
});

describe("SectionHeading", () => {
  it("renders the eyebrow, the title at the level asked and the action", () => {
    render(<SectionHeading eyebrow="Start here" title="Pick your path" action={<a href="#">All</a>} />);
    expect(screen.getByRole("heading", { level: 2, name: "Pick your path" })).toBeInTheDocument();
    expect(screen.getByText("Start here")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All" })).toBeInTheDocument();
  });

  it("uses an h3 inside a card", () => {
    render(<SectionHeading level={3} title="Hot off the press" />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
});
