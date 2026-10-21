import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert.tsx";

describe("Alert", () => {
  it("interrupts only for danger", () => {
    render(<Alert tone="danger">Installation failed</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Installation failed");
  });

  it("is a polite status for the other tones", () => {
    render(<Alert tone="success">Installation completed</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders a title above the text and applies the tone classes", () => {
    render(
      <Alert tone="warning" title="Disk will be erased">
        Everything on /dev/sda is lost.
      </Alert>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Disk will be erased");
    expect(status.className).toContain("bg-status-warning/12");
    expect(status).toHaveAttribute("data-tone", "warning");
  });

  it("uses the inline size when asked", () => {
    render(<Alert variant="inline">Short</Alert>);
    expect(screen.getByRole("status").className).toContain("text-[13px]");
  });
});
