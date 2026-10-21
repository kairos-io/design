import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button.tsx";

describe("Button", () => {
  it("renders its label and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Install</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Install" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("is disabled and busy while loading", () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("applies the variant and size classes", () => {
    render(
      <Button variant="outline" size="lg">
        Big
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-input");
    expect(button.className).toContain("h-10");
  });

  it("renders a link when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link.className).toContain("bg-primary");
  });

  it("warns in development when an icon-only button has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon">x</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockRestore();
  });
});
