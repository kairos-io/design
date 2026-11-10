import { act, fireEvent, render, screen } from "@testing-library/react";
import { InfoTooltip } from "./InfoTooltip.tsx";

describe("InfoTooltip", () => {
  it("toggles the panel on click, ties it to the button, and closes on a click outside", () => {
    render(
      <div>
        <InfoTooltip label="About the base image">Help text</InfoTooltip>
        <p>outside</p>
      </div>,
    );
    const button = screen.getByRole("button", { name: "About the base image" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    const panel = screen.getByRole("group", { name: "About the base image" });
    expect(panel).toHaveTextContent("Help text");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", panel.id);
    fireEvent.mouseDown(screen.getByText("outside"));
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the button", () => {
    render(<InfoTooltip>Help text</InfoTooltip>);
    const button = screen.getByRole("button", { name: "More information" });
    fireEvent.click(button);
    expect(screen.getByRole("group")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("group"), { key: "Escape" });
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it("opens on hover and stays open while the pointer is over the panel", () => {
    vi.useFakeTimers();
    try {
      render(<InfoTooltip>Hover help</InfoTooltip>);
      const button = screen.getByRole("button");
      fireEvent.mouseEnter(button);
      const panel = screen.getByRole("group");
      fireEvent.mouseLeave(button);
      fireEvent.mouseEnter(panel);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole("group")).toBeInTheDocument();
      fireEvent.mouseLeave(panel);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("draws the keyboard focus ring without a focus:outline-none that would hide it", () => {
    render(<InfoTooltip>x</InfoTooltip>);
    const button = screen.getByRole("button");
    expect(button.className).not.toContain("outline-none");
    expect(button.className).toContain("focus-visible:outline-2");
  });

  it("shifts the open panel back inside the viewport and keeps the arrow under the button", () => {
    const width = vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(390);
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const panel = this.getAttribute("role") === "group";
      return {
        left: panel ? 93 : 0,
        right: panel ? 451 : 0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect;
    });
    try {
      render(<InfoTooltip defaultOpen>Long help text that would run off a phone</InfoTooltip>);
      const panel = screen.getByRole("group");
      expect(panel.className).toContain("max-w-[min(24rem,calc(100vw-2rem))]");
      expect(panel.style.left).toBe("-77px");
      expect((panel.querySelector('[aria-hidden="true"]') as HTMLElement).style.left).toBe("89px");
    } finally {
      rect.mockRestore();
      width.mockRestore();
    }
  });

  it("merges className onto the wrapper", () => {
    render(
      <InfoTooltip className="ml-2" data-testid="tip">
        x
      </InfoTooltip>,
    );
    expect(screen.getByTestId("tip").className).toContain("ml-2");
  });
});
