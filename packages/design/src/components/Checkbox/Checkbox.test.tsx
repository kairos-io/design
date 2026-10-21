import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox.tsx";

describe("Checkbox", () => {
  it("toggles when its label is clicked", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Autoscroll" onChange={onChange} />);
    await userEvent.click(screen.getByText("Autoscroll"));
    expect(screen.getByRole("checkbox", { name: "Autoscroll" })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("describes itself with the description text", () => {
    render(<Checkbox label="Format disk" description="Erases /dev/sda" />);
    const box = screen.getByRole("checkbox", { name: "Format disk" });
    expect(box).toHaveAccessibleDescription("Erases /dev/sda");
  });

  it("renders a bare input without a label", () => {
    render(<Checkbox aria-label="Select node" />);
    expect(screen.getByRole("checkbox", { name: "Select node" })).toBeInTheDocument();
    expect(screen.queryByText("Select node")).not.toBeInTheDocument();
  });

  it("is disabled", async () => {
    render(<Checkbox label="Locked" disabled />);
    const box = screen.getByRole("checkbox");
    expect(box).toBeDisabled();
    await userEvent.click(screen.getByText("Locked"));
    expect(box).not.toBeChecked();
  });
});
