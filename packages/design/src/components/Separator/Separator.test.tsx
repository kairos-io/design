import { render } from "@testing-library/react";
import { Separator } from "./Separator.tsx";

describe("Separator", () => {
  it("is decorative by default", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "none");
    expect(el.className).toContain("h-[1px]");
  });

  it("is a vertical separator landmark when asked", () => {
    const { container } = render(<Separator orientation="vertical" decorative={false} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el.className).toContain("w-[1px]");
  });
});
