import { render, screen } from "@testing-library/react";
import { Gauge, Sparkline, TileMeter, gaugeTone } from "./Gauge.tsx";

describe("gaugeTone", () => {
  it("steps at 70 and 85", () => {
    expect(gaugeTone(69)).toBe("success");
    expect(gaugeTone(70)).toBe("warning");
    expect(gaugeTone(85)).toBe("danger");
  });
});

describe("Gauge", () => {
  it("is an image named by its label and reading", () => {
    render(<Gauge value={38.4} label="CPU" />);
    const img = screen.getByRole("img", { name: "CPU 38%" });
    expect(img).toHaveAttribute("data-tone", "success");
    expect(img.querySelectorAll("polygon")).toHaveLength(30);
  });

  it("turns red above the danger threshold", () => {
    render(<Gauge value={91} label="CPU" />);
    expect(screen.getByRole("img", { name: "CPU 91%" })).toHaveAttribute("data-tone", "danger");
  });
});

describe("Sparkline", () => {
  it("is decorative without a name and an image with one", () => {
    const { container, rerender } = render(<Sparkline values={[10, 20, 30]} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    rerender(<Sparkline values={[10, 20, 30]} aria-label="CPU trend" />);
    expect(screen.getByRole("img", { name: "CPU trend" })).toBeInTheDocument();
  });
});

describe("TileMeter", () => {
  it("is a meter with the value text", () => {
    const { container } = render(
      <TileMeter value={43} aria-label="Persistent" valueText="182 GB of 420 GB" />,
    );
    const meter = screen.getByRole("meter", { name: "Persistent" });
    expect(meter).toHaveAttribute("aria-valuenow", "43");
    expect(meter).toHaveAttribute("aria-valuetext", "182 GB of 420 GB");
    expect(container.querySelectorAll("svg")).toHaveLength(24);
  });

  it("gives every tile a zero width basis so the row has no intrinsic width and fits a phone", () => {
    const { container } = render(<TileMeter value={43} aria-label="Persistent" />);
    container.querySelectorAll("svg").forEach((svg) => {
      expect(svg).toHaveClass("w-0", "flex-1");
      expect(svg).not.toHaveClass("min-w-0");
    });
  });
});
