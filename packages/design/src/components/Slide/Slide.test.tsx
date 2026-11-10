import { render, screen } from "@testing-library/react";
import { SLIDE_WIDTH, Slide, SlideDivider, SlideTerminal, SlideTitle } from "./index.ts";

describe("Slide", () => {
  it("lays the content out at the design size, forces the light theme and keeps the notes for assistive tech", () => {
    const { container } = render(
      <Slide notes="Say hello." footer="Talk title · Event 2026">
        <p>Hello</p>
      </Slide>,
    );
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.getAttribute("data-theme")).toBe("light");
    expect(frame.hasAttribute("data-variant")).toBe(false);
    const canvas = frame.firstElementChild as HTMLElement;
    expect(canvas.style.width).toBe(`${SLIDE_WIDTH}px`);
    expect(screen.getByText("Say hello.")).toHaveClass("sr-only");
    expect(screen.getByText("Talk title · Event 2026")).toBeInTheDocument();
  });

  it("takes the Hadron variant for a Hadron talk", () => {
    const { container } = render(
      <SlideTitle brand="hadron" event="Event" title="A minimal distro" speaker="Name" affiliation="Role" />,
    );
    expect((container.firstElementChild as HTMLElement).getAttribute("data-variant")).toBe("hadron");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A minimal distro");
  });

  it("puts the divider on the accent with ink on it", () => {
    const { container } = render(<SlideDivider number="01" title="Why immutable" />);
    expect(container.querySelector(".bg-accent")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Why immutable");
  });

  it("renders terminal lines by kind", () => {
    render(
      <SlideTerminal
        heading="CLI"
        lines={[
          { kind: "comment", text: "start" },
          { kind: "command", text: "kairos ui" },
          { kind: "ok", text: "ready" },
        ]}
      />,
    );
    expect(screen.getByText(/kairos ui/)).toHaveTextContent("$ kairos ui");
    expect(screen.getByText(/start/)).toHaveTextContent("# start");
    expect(screen.getByText("ready")).toHaveClass("text-ok");
  });
});
