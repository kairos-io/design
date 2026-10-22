import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
      // The wrapper draws the border, so it reads the control's invalid, focus and disabled states.
      const box = area.closest("[data-numbered]");
      expect(box?.className).toContain("has-[[aria-invalid=true]]:border-status-recovery");
      expect(box?.className).toContain("focus-within:border-ink");
      expect(box?.className).toContain("rounded-base");
      expect(area.className).toContain("border-0");
    });

    // The control's metrics as a browser would report them: a given line
    // height (mocked before the control mounts, since it is read on mount)
    // and, once mounted, the scroll and client heights of `lines` lines of
    // it in a `rows`-row box with 10px padding.
    const lineHeightOf = (lineHeight: number) => {
      const original = window.getComputedStyle;
      vi.spyOn(window, "getComputedStyle").mockImplementation((el, pseudo) => {
        const cs = original.call(window, el, pseudo);
        if (el instanceof HTMLTextAreaElement)
          Object.defineProperty(cs, "lineHeight", { value: `${lineHeight}px` });
        return cs;
      });
    };
    const metrics = (area: HTMLElement, { lines = 60, rows = 10, lineHeight = 20 } = {}) => {
      Object.defineProperty(area, "scrollHeight", { value: 2 * 10 + lines * lineHeight, configurable: true });
      Object.defineProperty(area, "clientHeight", { value: 2 * 10 + rows * lineHeight, configurable: true });
    };
    afterEach(() => vi.restoreAllMocks());

    it("covers the whole scroll height, so the last visible number is the last visible line", async () => {
      const value = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join("\n");
      lineHeightOf(20);
      render(<Textarea aria-label="Cloud config" lineNumbers rows={10} defaultValue={value} />);
      const area = screen.getByRole("textbox");
      metrics(area);
      // Scrolled to the very bottom, as the wheel, Ctrl+End or typing at the end leaves it.
      const scrollTop = area.scrollHeight - area.clientHeight;
      Object.defineProperty(area, "scrollTop", { value: scrollTop, configurable: true });
      fireEvent.scroll(area);
      const list = gutterOf(area).firstElementChild as HTMLElement;
      await waitFor(() => expect(list.style.transform).toBe(`translateY(-${scrollTop}px)`));
      fireEvent.input(area);
      await waitFor(() => expect(list.style.minHeight).toBe(`${area.scrollHeight - 20}px`));
      expect(list.style.lineHeight).toBe("20px");
      expect(gutterOf(area).style.height).toBe(`${area.clientHeight}px`);
      // Geometry: number n sits at 10 + (n - 1) * 20 in the list, shifted up by scrollTop.
      const numbers = list.children.length;
      const lastVisibleNumber = Math.max(
        ...Array.from({ length: numbers }, (_, i) => i + 1).filter(
          (n) => 10 + n * 20 - scrollTop <= area.clientHeight,
        ),
      );
      const lastVisibleLine = Math.floor((scrollTop + area.clientHeight - 10) / 20);
      expect(numbers).toBe(60);
      expect(lastVisibleNumber).toBe(60);
      expect(lastVisibleNumber).toBe(lastVisibleLine);
    });

    const caretAt = async (area: HTMLTextAreaElement, start: number, end = start) => {
      area.setSelectionRange(start, end);
      fireEvent.select(area);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
    };

    it("sets the caret's line number in ink on a band while focused, and clears it on blur", async () => {
      const value = "#cloud-config\nhostname: edge-01\nusers:\n  - name: kairos\ninstall:";
      lineHeightOf(20);
      render(<Textarea aria-label="Cloud config" lineNumbers defaultValue={value} />);
      const area = screen.getByRole("textbox") as HTMLTextAreaElement;
      metrics(area, { lines: 5 });
      const box = area.closest("[data-numbered]") as HTMLElement;
      act(() => area.focus());
      // The caret in "users:" (line 3).
      await caretAt(area, value.indexOf("users") + 2);
      const current = () =>
        Array.from(box.querySelectorAll("[data-gutter] [data-current]")).map((n) => n.textContent);
      expect(current()).toEqual(["3"]);
      expect(box.querySelector("[data-gutter] [data-current]")?.className).toContain("text-ink");
      const band = box.querySelector('[data-band="current"]') as HTMLElement;
      expect(band.className).toContain("bg-raised/60");
      expect(band.style.top).toBe(`${10 + 2 * 20}px`);
      expect(band.style.height).toBe("20px");
      // A selection from line 2 to line 4 marks all three and the band spans them.
      await caretAt(area, value.indexOf("hostname"), value.indexOf("kairos"));
      expect(current()).toEqual(["2", "3", "4"]);
      const span = box.querySelector('[data-band="current"]') as HTMLElement;
      expect(span.style.top).toBe(`${10 + 1 * 20}px`);
      expect(span.style.height).toBe(`${3 * 20}px`);
      act(() => area.blur());
      await waitFor(() => expect(current()).toEqual([]));
      expect(box.querySelector('[data-band="current"]')).toBeNull();
      // The gutter stays out of the accessibility tree and the value.
      expect(screen.getByRole("textbox", { name: "Cloud config" })).toHaveValue(value);
    });

    it("marks highlighted lines in the danger tone, number and band, whether focused or not", () => {
      render(
        <Textarea aria-label="Cloud config" lineNumbers highlight={[5]} defaultValue={"a\nb\nc\nd\ne\nf"} />,
      );
      const area = screen.getByRole("textbox");
      const box = area.closest("[data-numbered]") as HTMLElement;
      const n = box.querySelector("[data-gutter] [data-highlight]");
      expect(n?.textContent).toBe("5");
      expect(n?.className).toContain("text-status-recovery");
      const band = box.querySelector('[data-band="highlight"]') as HTMLElement;
      expect(band.className).toContain("bg-status-recovery/10");
      expect(band.style.top).toBe(`${10 + 4 * 19.5}px`);
      expect(box.querySelectorAll("[data-band]")).toHaveLength(1);
    });
  });
});
