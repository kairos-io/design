import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Server } from "lucide-react";
import { EmptyState } from "./EmptyState.tsx";

describe("EmptyState", () => {
  it("renders the title, description and action", () => {
    render(
      <EmptyState
        icon={Server}
        title="No nodes yet"
        description="Boot a node."
        action={<button>Add</button>}
      />,
    );
    expect(screen.getByText("No nodes yet")).toBeInTheDocument();
    expect(screen.getByText("Boot a node.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("hides the icon from assistive technology", () => {
    const { container } = render(<EmptyState icon={Server} title="Empty" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards a ref and spreads host attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} icon={Server} title="Empty" data-testid="empty" id="nodes-empty" />);
    expect(ref.current).toBe(screen.getByTestId("empty"));
    expect(ref.current).toHaveAttribute("id", "nodes-empty");
  });
});
