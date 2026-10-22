import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch.tsx";

describe("Switch", () => {
  it("is a switch named by its label that flips on click and on Space", async () => {
    const onChange = vi.fn();
    render(
      <Switch
        checked={false}
        onCheckedChange={onChange}
        label="FIPS"
        description="FIPS 140 crypto modules"
      />,
    );
    const sw = screen.getByRole("switch", { name: "FIPS" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(sw).toHaveAccessibleDescription("FIPS 140 crypto modules");
    await userEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    sw.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("takes the accent when on and slides the thumb on a transform over the fast token", () => {
    const { rerender } = render(<Switch checked aria-label="Register" />);
    const sw = screen.getByRole("switch", { name: "Register" });
    expect(sw.className).toContain("bg-accent");
    expect(sw.className).toContain("duration-[var(--duration-fast)]");
    const thumb = sw.querySelector("span")!;
    expect(thumb).toHaveClass(
      "translate-x-4",
      "transition-transform",
      "duration-[var(--duration-fast)]",
      "ease-out",
    );
    rerender(<Switch checked={false} aria-label="Register" />);
    expect(sw.className).toContain("bg-raised");
    expect(thumb).not.toHaveClass("translate-x-4");
  });
});
