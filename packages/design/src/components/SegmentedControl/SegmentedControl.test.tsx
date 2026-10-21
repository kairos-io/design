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
