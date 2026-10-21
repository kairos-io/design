import { render, screen } from "@testing-library/react";
import { Terminal } from "./Terminal.tsx";

describe("Terminal", () => {
  it("is a labelled live log and renders text, never markup", () => {
    render(<Terminal aria-label="Installation log" lines={["Partitioning /dev/sda", "<b>not html</b>"]} />);
    const log = screen.getByRole("log", { name: "Installation log" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveTextContent("<b>not html</b>");
    expect(log.querySelector("b")).toBeNull();
  });

  it("colours error lines", () => {
    render(<Terminal aria-label="Log" lines={[{ text: "[ERROR] no disk", error: true }]} />);
    expect(screen.getByText("[ERROR] no disk").className).toContain("text-status-recovery");
  });
});
