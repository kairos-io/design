import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl.tsx";

type Arch = "amd64" | "arm64" | "riscv64";
const options: SegmentedOption<Arch>[] = [
  { value: "amd64", label: "amd64", hint: "x86-64 servers" },
  { value: "arm64", label: "arm64", hint: "Raspberry Pi, Ampere" },
  { value: "riscv64", label: "riscv64", disabled: true },
];

function Example({ onChange }: { onChange?: (v: Arch) => void }) {
  const [value, setValue] = useState<Arch>("amd64");
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      options={options}
      aria-label="Architecture"
    />
  );
}

describe("SegmentedControl", () => {
  it("is a radio group with one checked radio and only that one in the tab order", () => {
    render(<Example />);
    expect(screen.getByRole("radiogroup", { name: "Architecture" })).toBeInTheDocument();
    const amd = screen.getByRole("radio", { name: "amd64" });
    const arm = screen.getByRole("radio", { name: "arm64" });
    expect(amd).toHaveAttribute("aria-checked", "true");
    expect(amd).toHaveAttribute("tabindex", "0");
    expect(arm).toHaveAttribute("tabindex", "-1");
    expect(amd).toHaveAccessibleDescription("x86-64 servers");
  });

  it("keeps every option the width of its bold label so the choice can move without a shift", async () => {
    render(<Example />);
    const arm = screen.getByRole("radio", { name: "arm64" });
    const twin = arm.querySelector('[aria-hidden="true"]')!;
    expect(twin).toHaveTextContent("arm64");
    expect(twin).toHaveClass("invisible", "font-bold", "col-start-1", "row-start-1");
    const label = twin.previousElementSibling!;
    expect(label).toHaveClass("font-semibold", "col-start-1", "row-start-1");
    await userEvent.click(arm);
    expect(label).toHaveClass("font-bold");
    expect(arm.querySelector('[aria-hidden="true"]')).toHaveClass("invisible", "font-bold");
  });

  it("shows the code over the label and reads the hint as the description", () => {
    render(
      <SegmentedControl
        value="l1"
        onChange={() => {}}
        options={[
          { value: "l1", label: "Guided", code: "L1" },
          { value: "l2", label: "Automate", code: "L2", hint: "Scripts and the CLI" },
        ]}
        aria-label="Docs level"
      />,
    );
    // The code is part of the option's name, not decoration beside it.
    const l1 = screen.getByRole("radio", { name: "L1 Guided" });
    expect(l1).toHaveTextContent("L1");
    expect(l1.querySelector("span")?.className).toContain("text-link");
    expect(screen.getByRole("radio", { name: "L2 Automate" })).toHaveAccessibleDescription(
      "Scripts and the CLI",
    );
  });

  it("puts the only tab stop on the first option that is not disabled", () => {
    render(
      <SegmentedControl
        value="none"
        onChange={() => {}}
        options={[
          { value: "l1", label: "Guided", disabled: true },
          { value: "l2", label: "Automate" },
          { value: "l3", label: "Declare" },
        ]}
        aria-label="Docs level"
      />,
    );
    const [guided, automate, declare] = screen.getAllByRole("radio");
    expect(guided).toHaveAttribute("tabindex", "-1");
    expect(automate).toHaveAttribute("tabindex", "0");
    expect(declare).toHaveAttribute("tabindex", "-1");
  });

  it("selects on click", async () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "arm64" }));
    expect(onChange).toHaveBeenCalledWith("arm64");
    expect(screen.getByRole("radio", { name: "arm64" })).toHaveAttribute("aria-checked", "true");
  });

  it("moves with the arrow keys, skipping disabled options and wrapping", async () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    screen.getByRole("radio", { name: "amd64" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("arm64");
    expect(screen.getByRole("radio", { name: "arm64" })).toHaveFocus();
    // riscv64 is disabled, so the next step wraps to amd64.
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("amd64");
    expect(screen.getByRole("radio", { name: "amd64" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith("arm64");
  });
});
