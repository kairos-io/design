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

  it("takes the accent when on", () => {
    render(<Switch checked aria-label="Register" />);
    expect(screen.getByRole("switch", { name: "Register" }).className).toContain("bg-accent");
  });
});
