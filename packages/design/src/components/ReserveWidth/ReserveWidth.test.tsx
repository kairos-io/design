import { render, screen } from "@testing-library/react";
import { ReserveWidth } from "./ReserveWidth.tsx";

describe("ReserveWidth", () => {
  it("stacks the content and an invisible twin in one cell, with the twin hidden from assistive technology", () => {
    render(
      <ReserveWidth twin="Copied" childClassName="font-semibold" twinClassName="font-bold">
        Copy
      </ReserveWidth>,
    );
    const content = screen.getByText("Copy");
    expect(content).toHaveClass("col-start-1", "row-start-1", "font-semibold");
    expect(content.parentElement).toHaveClass("grid");
    const twin = screen.getByText("Copied");
    expect(twin).toHaveAttribute("aria-hidden", "true");
    expect(twin).toHaveClass("invisible", "col-start-1", "row-start-1", "font-bold");
  });
});
