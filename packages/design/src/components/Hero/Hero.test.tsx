import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero.tsx";

describe("Hero", () => {
  it("renders the headline as the page's h1 with the eyebrow and lede", () => {
    render(<Hero eyebrow="Kairos · CNCF sandbox project" title="Bring any Linux." lede="Run it immutable." />);
    expect(screen.getByRole("heading", { level: 1, name: "Bring any Linux." })).toBeInTheDocument();
    expect(screen.getByText("Kairos · CNCF sandbox project")).toBeInTheDocument();
    expect(screen.getByText("Run it immutable.")).toBeInTheDocument();
  });

  it("draws the tile field as decoration, and none when asked", () => {
    const { container, rerender } = render(<Hero title="x" />);
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    rerender(<Hero title="x" tiles={false} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("paints the Hadron palette when asked", () => {
    const { container } = render(<Hero title="x" palette="hadron" />);
    expect(container.innerHTML).toContain("var(--hadron-blue)");
    expect(container.innerHTML).not.toContain("var(--kairos-orange)");
  });
});
