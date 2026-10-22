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

  it("shows the tile loader while loading: mono on a filled button, the palette on an outline one", () => {
    const { rerender } = render(<Button loading>Saving</Button>);
    const button = screen.getByRole("button", { name: "Saving" });
    const loader = () => button.querySelector("svg.tile-loader")!;
    expect(loader()).toHaveAttribute("aria-hidden", "true");
    expect(loader()).toHaveAttribute("data-tone", "mono");
    expect(loader().querySelectorAll(".tile-loop-assemble")).toHaveLength(3);
    rerender(
      <Button loading variant="outline">
        Saving
      </Button>,
    );
    expect(loader()).toHaveAttribute("data-tone", "palette");
    rerender(<Button>Saving</Button>);
    expect(button.querySelector("svg")).toBeNull();
  });

  it("keeps its width while loading: the label stays in place, transparent, under the loader", () => {
    const { rerender } = render(<Button>Download ISO</Button>);
    const button = screen.getByRole("button", { name: "Download ISO" });
    const label = () => screen.getByText("Download ISO");
    expect(label().className).toContain("inline-flex");
    expect(label().className).not.toContain("opacity-0");
    rerender(<Button loading>Download ISO</Button>);
    // The same label element, now transparent; the loader floats over it in an absolute slot, out of the flow.
    expect(screen.getByRole("button", { name: "Download ISO" })).toBe(button);
    expect(label().className).toContain("opacity-0");
    expect(button.className).toContain("relative");
    const slot = button.querySelector("svg.tile-loader")!.parentElement!;
    expect(slot.className).toContain("absolute");
    expect(slot).toHaveAttribute("aria-hidden", "true");
    // The button's children are the slot and the label, nothing else, so the flow holds one item either way.
    expect(Array.from(button.children).filter((c) => !c.classList.contains("absolute"))).toHaveLength(1);
  });

  it("applies the variant and size classes", () => {
    render(
      <Button variant="outline" size="lg">
        Big
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-ink");
    expect(button.className).toContain("text-[17px]");
  });

  it("renders a link when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link.className).toContain("bg-accent");
  });

  it("warns in development when an icon-only button has no label", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon">x</Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockRestore();
  });
});
