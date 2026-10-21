import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input.tsx";

describe("Input", () => {
  it("accepts typing and forwards props", async () => {
    render(<Input aria-label="Hostname" placeholder="edge-01" />);
    const input = screen.getByRole("textbox", { name: "Hostname" });
    await userEvent.type(input, "node-a");
    expect(input).toHaveValue("node-a");
    expect(input).toHaveAttribute("placeholder", "edge-01");
  });

  it("is disabled when asked", () => {
    render(<Input aria-label="Hostname" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("marks an invalid value", () => {
    render(<Input aria-label="Hostname" aria-invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});
