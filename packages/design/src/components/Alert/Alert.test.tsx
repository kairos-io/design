import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert.tsx";

describe("Alert", () => {
  it("is not a live region unless it is announced", () => {
    const { container } = render(<Alert tone="danger">Installation failed</Alert>);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute("role");
    expect(container.firstElementChild).toHaveTextContent("Installation failed");
  });

  it("interrupts only for danger when it is announced", () => {
    render(
      <Alert tone="danger" live>
        Installation failed
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Installation failed");
  });

  it("is a polite status for the other tones when it is announced", () => {
    render(
      <Alert tone="success" live>
        Installation completed
      </Alert>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders a title above the text and applies the tone classes", () => {
    render(
      <Alert tone="warning" title="Disk will be erased" live>
        Everything on /dev/sda is lost.
      </Alert>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Disk will be erased");
    expect(status.className).toContain("bg-surface");
    expect(status.querySelector("svg")?.getAttribute("class")).toContain("fill-status-warning");
    expect(status).toHaveAttribute("data-tone", "warning");
  });

  it("uses the inline size when asked", () => {
    const { container } = render(<Alert variant="inline">Short</Alert>);
    expect(container.firstElementChild?.className).toContain("text-[13px]");
  });
});
