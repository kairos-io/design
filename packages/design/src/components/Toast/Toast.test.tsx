import { act, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "./toast.ts";
import { Toaster } from "./Toaster.tsx";

describe("Toaster", () => {
  it("shows what toast() sends in a polite live region", () => {
    render(<Toaster />);
    act(() => {
      toast("ISO queued", "success");
    });
    const region = screen.getByRole("status", { name: "Notifications" });
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("ISO queued");
    expect(region.querySelector("[data-tone]")).toHaveAttribute("data-tone", "success");
  });

  it("dismisses on click and after the duration", () => {
    vi.useFakeTimers();
    try {
      render(<Toaster duration={1000} />);
      act(() => {
        toast("One");
        toast("Two", "danger");
      });
      expect(screen.getAllByRole("button", { name: "Dismiss" })).toHaveLength(2);
      fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0]);
      expect(screen.queryByText("One")).not.toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.queryByText("Two")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
