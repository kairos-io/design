import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea.tsx";

function gutterOf(area: HTMLElement): HTMLElement {
  const g = area.parentElement?.querySelector("[data-gutter]");
  if (!(g instanceof HTMLElement)) throw new Error("no gutter");
  return g;
}

describe("Textarea", () => {
  it("accepts multi-line typing", async () => {
    render(<Textarea aria-label="Cloud config" />);
    const area = screen.getByRole("textbox", { name: "Cloud config" });
    await userEvent.type(area, "#cloud-config{enter}hostname: edge-01");
    expect(area).toHaveValue("#cloud-config\nhostname: edge-01");
  });

  it("is disabled when asked", () => {
    render(<Textarea aria-label="Cloud config" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  describe("line numbers", () => {
    it("numbers every line of the value in a hidden, unselectable gutter and does not wrap", () => {
      render(
        <Textarea
          aria-label="Cloud config"
          lineNumbers
          defaultValue={"#cloud-config\nhostname: edge-01\nusers:"}
        />,
      );
      const area = screen.getByRole("textbox", { name: "Cloud config" });
      const gutter = gutterOf(area);
      expect(gutter).toHaveAttribute("aria-hidden", "true");
      expect(gutter.className).toContain("select-none");
      expect(Array.from(gutter.querySelectorAll(":scope > div > div")).map((d) => d.textContent)).toEqual([
        "1",
        "2",
        "3",
      ]);
      expect(area).toHaveAttribute("wrap", "off");
      expect(area.className).toContain("whitespace-pre");
      expect(area.className).toContain("font-mono");
    });

    it("adds a number as lines are typed, and keeps the numbers out of the value", async () => {
      render(<Textarea aria-label="Cloud config" lineNumbers />);
      const area = screen.getByRole("textbox", { name: "Cloud config" });
      expect(gutterOf(area).textContent).toBe("1");
      await userEvent.type(area, "#cloud-config{enter}hostname: edge-01{enter}");
      expect(gutterOf(area).textContent).toBe("123");
      expect(area).toHaveValue("#cloud-config\nhostname: edge-01\n");
      (area as HTMLTextAreaElement).select();
      const selected = (area as HTMLTextAreaElement).value.slice(
        (area as HTMLTextAreaElement).selectionStart,
        (area as HTMLTextAreaElement).selectionEnd,
      );
      expect(selected).toBe("#cloud-config\nhostname: edge-01\n");
      expect(selected).not.toMatch(/^1/);
    });

    it("counts a controlled value", () => {
      const { rerender } = render(
        <Textarea aria-label="Cloud config" lineNumbers value="a" onChange={() => {}} />,
      );
      const area = screen.getByRole("textbox");
      expect(gutterOf(area).textContent).toBe("1");
      rerender(<Textarea aria-label="Cloud config" lineNumbers value={"a\nb\nc\nd"} onChange={() => {}} />);
      expect(gutterOf(area).textContent).toBe("1234");
    });

    it("follows the control's scroll", () => {
      render(
        <Textarea aria-label="Cloud config" lineNumbers defaultValue={Array(40).fill("x").join("\n")} />,
      );
      const area = screen.getByRole("textbox");
      Object.defineProperty(area, "scrollTop", { value: 57, configurable: true });
      fireEvent.scroll(area);
      const list = gutterOf(area).firstElementChild as HTMLElement;
      expect(list.style.transform).toBe("translateY(-57px)");
    });

    it("stays a normal form control: label, description and invalid state", () => {
      render(
        <>
          <label htmlFor="cc">Cloud config</label>
          <Textarea id="cc" lineNumbers aria-describedby="cc-err" aria-invalid defaultValue="x" />
          <p id="cc-err">Line 1: invalid</p>
        </>,
      );
      const area = screen.getByRole("textbox", { name: "Cloud config" });
      expect(area).toHaveAccessibleDescription("Line 1: invalid");
      expect(area).toBeInvalid();
      expect(area.className).toContain("aria-invalid:border-status-recovery");
    });
  });
});
