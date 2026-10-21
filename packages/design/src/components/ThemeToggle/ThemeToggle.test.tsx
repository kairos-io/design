import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle.tsx";

describe("ThemeToggle", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("offers the three modes and marks the current one pressed", async () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "System theme" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Dark theme" }));
    expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("kairos-theme")).toBe("dark");
  });

  it("cycles system, light, dark in compact form and honours the storage key", async () => {
    render(<ThemeToggle compact storageKey="auroraboot_theme" />);
    const button = screen.getByRole("button", { name: "Theme: system" });
    await userEvent.click(button);
    expect(screen.getByRole("button", { name: "Theme: light" })).toBeInTheDocument();
    expect(document.documentElement.classList.contains("light")).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Theme: light" }));
    expect(screen.getByRole("button", { name: "Theme: dark" })).toBeInTheDocument();
    expect(localStorage.getItem("auroraboot_theme")).toBe("dark");
    await userEvent.click(screen.getByRole("button", { name: "Theme: dark" }));
    expect(screen.getByRole("button", { name: "Theme: system" })).toBeInTheDocument();
    expect(document.documentElement.className).toBe("");
  });
});
