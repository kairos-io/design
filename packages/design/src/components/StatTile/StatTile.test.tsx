import { render, screen } from "@testing-library/react";
import { Cpu } from "lucide-react";
import { MeterBar, StackBar, StatTile, usageTone } from "./StatTile.tsx";

describe("StatTile", () => {
  it("renders label, value and sub-line", () => {
    render(<StatTile label="Nodes" icon={Cpu} value={12} sub="3 offline" tone="danger" />);
    expect(screen.getByText("Nodes")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3 offline")).toBeInTheDocument();
  });
});

describe("usageTone", () => {
  it("steps at 80 and 90", () => {
    expect(usageTone(79)).toBe("success");
    expect(usageTone(80)).toBe("warning");
    expect(usageTone(90)).toBe("danger");
  });
});

describe("MeterBar", () => {
  it("shows a dash without data", () => {
    render(<MeterBar value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("clamps and rounds the value", () => {
    const { container } = render(<MeterBar value={130.4} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(container.querySelector("[data-tone]")).toHaveAttribute("data-tone", "danger");
  });
});

describe("StackBar", () => {
  it("labels the shown counts and drops zeros", () => {
    const { container } = render(
      <StackBar
        counts={[
          { tone: "success", count: 3, label: "online" },
          { tone: "danger", count: 0, label: "offline" },
          { tone: "warning", count: 1, label: "pending" },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "3 online, 1 pending" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-tone]")).toHaveLength(2);
  });

  it("reads None when every count is zero", () => {
    render(<StackBar counts={[{ tone: "success", count: 0, label: "online" }]} />);
    expect(screen.getByRole("img", { name: "None" })).toBeInTheDocument();
  });
});
