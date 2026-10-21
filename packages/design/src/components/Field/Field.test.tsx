import { render, screen } from "@testing-library/react";
import { Input } from "../Input/Input.tsx";
import { Field } from "./Field.tsx";

describe("Field", () => {
  it("labels the control and describes it with the help text", () => {
    render(
      <Field id="device" label="Install device" help="auto picks the largest disk.">
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Install device" });
    expect(input).toHaveAccessibleDescription("auto picks the largest disk.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and announces the error", () => {
    render(
      <Field id="device" label="Install device" error="Choose a device.">
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Install device" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a device.");
    expect(input).toHaveAccessibleDescription("Choose a device.");
  });

  it("passes the control props to a render function", () => {
    render(
      <Field id="count" label="Nodes" required>
        {(control) => <input type="number" {...control} />}
      </Field>,
    );
    const input = screen.getByRole("spinbutton", { name: "Nodes" });
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toBeRequired();
  });
});
