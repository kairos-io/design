import { act, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "./toast.ts";
import { Toaster } from "./Toaster.tsx";

describe("Toaster", () => {
  it("shows what toast() sends in a polite live region", () => {
    render(<Toaster />);
    act(() => {
      toast("ISO queued", "success");
    });
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveTextContent("ISO queued");
    expect(region.querySelector("[data-tone]")).toHaveAttribute("data-tone", "success");
    // The toast itself is the polite live region, not the stack around it.
    expect(screen.getByRole("status")).toHaveTextContent("ISO queued");
  });

  it("interrupts for a danger toast and stays polite for the others", () => {
    render(<Toaster />);
    act(() => {
      toast("ISO queued", "success");
      toast("Build failed", "danger");
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Build failed");
    expect(screen.getByRole("status")).toHaveTextContent("ISO queued");
    expect(screen.getByRole("status")).not.toHaveTextContent("Build failed");
  });

  it("holds a toast open while the pointer is over it, then gives it the time it had left", () => {
    vi.useFakeTimers();
    try {
      render(<Toaster duration={1000} />);
      act(() => {
        toast("Hold me");
      });
      const toastEl = screen.getByRole("status");
      fireEvent.pointerEnter(toastEl);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.queryByText("Hold me")).toBeInTheDocument();
      fireEvent.pointerLeave(toastEl);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      // The stay has run out: the toast is fading, and gone after the fade.
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.queryByText("Hold me")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("holds a toast open while the keyboard is inside it", () => {
    vi.useFakeTimers();
    try {
      render(<Toaster duration={1000} />);
      act(() => {
        toast("Reach the button");
      });
      const dismiss = screen.getByRole("button", { name: "Dismiss" });
      act(() => {
        dismiss.focus();
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.queryByText("Reach the button")).toBeInTheDocument();
      act(() => {
        dismiss.blur();
      });
      act(() => {
        vi.advanceTimersByTime(1150);
      });
      expect(screen.queryByText("Reach the button")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("fades a toast out over the fast duration before it leaves, on click and after the duration", () => {
    vi.useFakeTimers();
    try {
      render(<Toaster duration={1000} />);
      act(() => {
        toast("One");
        toast("Two", "danger");
      });
      expect(screen.getAllByRole("button", { name: "Dismiss" })).toHaveLength(2);
      fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0]);
      const one = screen.getByText("One").parentElement!;
      expect(one).toHaveAttribute("data-exiting", "true");
      expect(one).toHaveClass("animate-fade-out", "pointer-events-none");
      expect(one).not.toHaveClass("animate-fade-up");
      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(screen.queryByText("One")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByText("One")).not.toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(850);
      });
      const two = screen.getByText("Two").parentElement!;
      expect(two).toHaveClass("animate-fade-out");
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.queryByText("Two")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("removes a toast at once when the motion token is zero (reduced motion)", () => {
    const spy = vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "0ms",
    } as unknown as CSSStyleDeclaration);
    try {
      render(<Toaster />);
      act(() => {
        toast("Gone");
      });
      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText("Gone")).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("slides the toasts that stay from where they were, on a transform over the fast token", () => {
    vi.useFakeTimers();
    // jsdom has no layout: the first wrapper sits at 684 while two toasts show and at 738
    // once the lower one has left, as in the bottom-anchored stack.
    let region: HTMLElement | null = null;
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const top = region && this.parentElement === region ? (region.children.length === 2 ? 684 : 738) : 0;
      return { top, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
    });
    try {
      render(<Toaster duration={60_000} />);
      act(() => {
        toast("Stays");
        toast("Leaves");
      });
      region = screen.getByRole("region", { name: "Notifications" });
      const stays = region.firstElementChild as HTMLElement;
      fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[1]);
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.queryByText("Leaves")).not.toBeInTheDocument();
      expect(stays.style.transition).toBe("transform var(--duration-fast) var(--ease-out)");
      expect(stays.style.transform).toBe("");
    } finally {
      spy.mockRestore();
      vi.useRealTimers();
    }
  });
});
