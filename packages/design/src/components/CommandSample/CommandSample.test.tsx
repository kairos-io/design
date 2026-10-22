import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandSample } from "./CommandSample.tsx";

describe("CommandSample", () => {
  it("shows the command as code with a decorative prompt", () => {
    render(<CommandSample command="kairos lab up" />);
    expect(screen.getByText("kairos lab up").tagName).toBe("CODE");
  });

  it("labels the copy button with the command and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CommandSample command="docker pull quay.io/kairos/hadron:v0.5.1" />);
    const button = screen.getByRole("button", { name: "Copy docker pull quay.io/kairos/hadron:v0.5.1" });
    await userEvent.click(button);
    expect(writeText).toHaveBeenCalledWith("docker pull quay.io/kairos/hadron:v0.5.1");
    expect(button).toHaveTextContent("Copied");
    expect(button).toHaveAttribute("data-copied", "true");
    expect(button.querySelector("svg.lucide-check")).toHaveClass("text-ok");
    expect(button.querySelector("svg.lucide-copy")).toBeNull();
  });

  it("copies through the legacy path on a plain http page and selects the text when nothing can copy", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const exec = vi.fn().mockReturnValue(true);
    (document as { execCommand?: unknown }).execCommand = exec;
    render(<CommandSample command="kairos lab up" />);
    const button = screen.getByRole("button", { name: "Copy kairos lab up" });
    await userEvent.click(button);
    expect(exec).toHaveBeenCalledWith("copy");
    expect(button).toHaveTextContent("Copied");

    exec.mockReturnValue(false);
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-selected", "true"));
    expect(button).toHaveTextContent("Selected");
    expect(window.getSelection()?.toString()).toBe("kairos lab up");
    delete (document as { execCommand?: unknown }).execCommand;
  });

  it("shows a copy icon at rest and reserves the width of the copied state", () => {
    render(<CommandSample command="kairos lab up" />);
    const button = screen.getByRole("button", { name: "Copy kairos lab up" });
    expect(button.querySelector("svg.lucide-copy")).toBeInTheDocument();
    expect(button).not.toHaveAttribute("data-copied");
    const twin = button.querySelector('span[aria-hidden="true"]')!;
    expect(twin).toHaveClass("invisible");
    expect(twin).toHaveTextContent("Copied");
  });
});
