import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select.tsx";

function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Base image">
        <SelectValue placeholder="Choose a base image" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ubuntu">Ubuntu 24.04</SelectItem>
        <SelectItem value="fedora">Fedora 42</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  beforeAll(() => {
    // jsdom has neither; Radix select needs both to open.
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
    Element.prototype.releasePointerCapture = vi.fn();
  });

  it("shows the placeholder and is a combobox", () => {
    render(<Example />);
    const trigger = screen.getByRole("combobox", { name: "Base image" });
    expect(trigger).toHaveTextContent("Choose a base image");
  });

  it("opens with the keyboard and selects an option", async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const option = await screen.findByRole("option", { name: "Fedora 42" });
    await userEvent.click(option);
    expect(onValueChange).toHaveBeenCalledWith("fedora");
    expect(trigger).toHaveTextContent("Fedora 42");
  });
});
