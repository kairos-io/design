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

  it("says copied once the Clipboard API has taken the text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<Terminal aria-label="Command" copy lines={["kairos upgrade"]} />);
    await userEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(writeText).toHaveBeenCalledWith("kairos upgrade");
    expect(await screen.findByRole("button", { name: "copied" })).toHaveClass("bg-status-healthy");
  });

  it("does not claim a copy that did not happen", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    (document as { execCommand?: unknown }).execCommand = vi.fn().mockReturnValue(false);
    render(<Terminal aria-label="Command" copy lines={["kairos upgrade"]} />);
    await userEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(screen.queryByRole("button", { name: "copied" })).toBeNull();
    delete (document as { execCommand?: unknown }).execCommand;
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

  it("holds the copy chip at the width of its copied state, and fills it green once copied", async () => {
    render(<Terminal aria-label="Command" copy onCopy={() => {}} lines={["kairos upgrade"]} />);
    const button = screen.getByRole("button", { name: "copy" });
    const twin = button.querySelector('[aria-hidden="true"].invisible');
    expect(twin).toHaveTextContent("copied");
    expect(twin).toHaveClass("col-start-1", "row-start-1");
    expect(button.querySelector(".grid")).not.toBeNull();
    await userEvent.click(button);
    // The ok token is 2.8:1 on the light theme's code bar, so the check stays in the bar's colour.
    const check = screen
      .getByRole("button", { name: "copied" })
      .querySelector(".col-start-1:not(.invisible) svg");
    expect(check?.getAttribute("class")).not.toContain("text-ok");
    expect(screen.getByRole("button", { name: "copied" })).toHaveClass(
      "bg-status-healthy",
      "text-status-ink",
    );
  });
});
