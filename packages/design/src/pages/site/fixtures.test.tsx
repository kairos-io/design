import { act, render, screen } from "@testing-library/react";
import { ThemedKairosLogo } from "./fixtures.tsx";

describe("ThemedKairosLogo", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders the dark-surface lockup when the document is dark, and the colour one otherwise", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    render(<ThemedKairosLogo height={30} />);
    // The dark rendition keeps the colour mark and sets the wordmark in white.
    const fills = () =>
      Array.from(screen.getByRole("img", { name: "Kairos" }).querySelectorAll("[fill]")).map((el) =>
        el.getAttribute("fill"),
      );
    expect(fills()).toContain("white");
    await act(async () => {
      document.documentElement.setAttribute("data-theme", "light");
      // MutationObserver callbacks are microtasks; let them run.
      await Promise.resolve();
    });
    expect(fills()).not.toContain("white");
  });
});
