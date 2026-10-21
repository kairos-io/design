import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows the bar with its title and a prompt in the key colour", () => {
    render(
      <Terminal
        aria-label="Command"
        title="terminal"
        lines={[{ text: "kairos artifacts create --iso", prompt: true }]}
      />,
    );
    expect(screen.getByText("terminal")).toBeInTheDocument();
    const prompt = screen.getByText("$", { exact: false });
    expect(prompt.className).toContain("text-code-key");
    expect(prompt).toHaveAttribute("aria-hidden", "true");
  });

  it("drops the bar when the title is null", () => {
    render(<Terminal aria-label="Log" title={null} lines={["x"]} />);
    expect(screen.queryByText("terminal")).not.toBeInTheDocument();
  });

  it("copies every line without the prompts", async () => {
    const onCopy = vi.fn();
    render(
      <Terminal
        aria-label="Command"
        copy
        onCopy={onCopy}
        lines={[{ text: "kairos upgrade", prompt: true }, "done"]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(onCopy).toHaveBeenCalledWith("kairos upgrade\ndone");
    expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument();
  });
});
