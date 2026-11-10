import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip.tsx";

describe("Chip", () => {
  it("renders its text without a remove button by default", () => {
    render(<Chip>site=rack2</Chip>);
    expect(screen.getByText("site=rack2")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("labels the remove button after the chip text and calls onRemove", async () => {
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>role=worker</Chip>);
    await userEvent.click(screen.getByRole("button", { name: "Remove role=worker" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("takes an explicit remove label", () => {
    render(
      <Chip onRemove={() => {}} removeLabel="Clear the site filter">
        <strong>site</strong>
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "Clear the site filter" })).toBeInTheDocument();
  });

  it("shows the selected state", () => {
    render(<Chip selected>online</Chip>);
    expect(screen.getByText("online").parentElement?.className).toContain("border-accent-line");
  });
});
