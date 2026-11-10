import { copyText, selectText } from "./clipboard.ts";

describe("copyText", () => {
  const clipboard = navigator.clipboard;
  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });
    delete (document as { execCommand?: unknown }).execCommand;
  });

  it("uses the Clipboard API when the page has it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await expect(copyText("kairos upgrade")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("kairos upgrade");
  });

  it("falls back to execCommand on a plain http page, which has no navigator.clipboard", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const exec = vi.fn().mockReturnValue(true);
    (document as { execCommand?: unknown }).execCommand = exec;
    await expect(copyText("docker pull quay.io/kairos/hadron:v0.5.1")).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("falls back when the Clipboard API rejects, and reports false when nothing can copy", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await expect(copyText("x")).resolves.toBe(false);
    (document as { execCommand?: unknown }).execCommand = vi.fn().mockReturnValue(false);
    await expect(copyText("x")).resolves.toBe(false);
  });
});

describe("selectText", () => {
  it("selects the element's text and survives a null element", () => {
    const el = document.createElement("code");
    el.textContent = "kairos lab up";
    document.body.appendChild(el);
    selectText(el);
    expect(window.getSelection()?.toString()).toBe("kairos lab up");
    expect(() => selectText(null)).not.toThrow();
    el.remove();
  });
});
